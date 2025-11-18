import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Search,
  Filter,
} from "lucide-react";
import { apiService } from "../services/api";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
  Salon,
} from "../types";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import AlertService from "../helpers/sweetAlert/AlertService";

const UsersManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const DEFAULT_COUNTRY_CODE = "+54"; // cambia si lo necesitás

  const [formData, setFormData] = useState<CreateUserRequest>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: UserRole.ESTILISTA,
    salonId: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
    if (currentUser?.role === UserRole.SUPER_ADMIN) {
      loadSalons();
    }
  }, []);

  const loadSalons = async () => {
    try {
      setIsLoading(true);
      const salonsData = await apiService.getSalons();
      setSalons(salonsData);
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await apiService.getUsers();
      setUsers(usersData);
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Normalización muy simple: quita todo excepto + y dígitos, convierte 00... -> +..., si no empieza con + antepone DEFAULT_COUNTRY_CODE.
  // Devuelve undefined si está vacío; devuelve undefined también si la cantidad de dígitos no está en rango razonable (8-15).

  const normalizeMobileVerySimple = (value?: string): string | undefined => {
    if (!value) return undefined;
    const v = value.trim();
    if (!v) return undefined;

    let cleaned = v.replace(/[^+\d]/g, ""); // queda + y dígitos
    cleaned = cleaned.replace(/^00/, "+"); // 00 -> +
    if (!cleaned.startsWith("+")) {
      // quitar ceros iniciales locales
      const digits = cleaned.replace(/^0+/, "");
      cleaned = `${DEFAULT_COUNTRY_CODE}${digits}`;
    }

    const digitsOnly = cleaned.replace(/\D/g, "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) return undefined;

    return cleaned;
  };

  // Función para obtener el nombre del salón (igual que en dashboard)
  const getSalonName = (user: User): string => {
    // console.log("Checking salon for user:", user.name, "salon:", user.salon);
    return user.salon ? user.salon.name : "Sin salón";
  };

  const getAvailableRoles = (): UserRole[] => {
    if (!currentUser) return [];

    switch (currentUser.role) {
      case UserRole.SUPER_ADMIN:
        return [UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.ESTILISTA];
      case UserRole.ADMIN:
        return [UserRole.RECEPCIONISTA, UserRole.ESTILISTA];
      case UserRole.RECEPCIONISTA:
        return [UserRole.ESTILISTA];
      default:
        return [];
    }
  };

  const canEditUser = (user: User): boolean => {
    if (!currentUser) return false;

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return user.role !== UserRole.SUPER_ADMIN || currentUser.id === user.id;
    }

    // Debe ser del mismo salón
    if (currentUser.salonId !== user.salonId) {
      return false;
    }

    if (currentUser.role === UserRole.ADMIN) {
      return [UserRole.RECEPCIONISTA, UserRole.ESTILISTA].includes(user.role);
    }

    if (currentUser.role === UserRole.RECEPCIONISTA) {
      return user.role === UserRole.ESTILISTA;
    }

    return false;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const normalizedMobile = normalizeMobileVerySimple(formData.mobile);

      if (formData.mobile && !normalizedMobile) {
        toast.error("Número de teléfono inválido. Corrige antes de guardar.");
        setIsSubmitting(false);
        return;
      }
      console.log(formData);
      await apiService.createUser({
        ...formData,
        mobile: normalizedMobile,
      });

      toast.success("Usuario creado correctamente");
      setIsModalOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);

    try {
      const updateData: UpdateUserRequest = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await apiService.updateUser(editingUser.id, updateData);
      toast.success("Usuario actualizado correctamente");
      setIsModalOpen(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await apiService.updateUser(user.id, { isActive: !user.isActive });
      toast.success(
        `Usuario ${!user.isActive ? "activado" : "desactivado"} correctamente`
      );
      loadUsers();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmed = await AlertService.confirm(
      `¿Está seguro que desea eliminar al usuario "${user.name}"?`
    );

    if (!confirmed) {
      toast.success("Eliminación cancelada");
      return;
    }

    if (!currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      await apiService.deleteUser(user.id);
      toast.success("Usuario eliminado correctamente");
      loadUsers();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile || "",
      password: "",
      role: user.role,
    });
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: UserRole.ESTILISTA,
      salonId: null,
    });
    setShowPassword(false);
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "Super Admin";
      case UserRole.ADMIN:
        return "Administrador";
      case UserRole.RECEPCIONISTA:
        return "Recepcionista";
      case UserRole.ESTILISTA:
        return "Estilista";
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "bg-purple-100 text-purple-800";
      case UserRole.ADMIN:
        return "bg-blue-100 text-blue-800";
      case UserRole.RECEPCIONISTA:
        return "bg-green-100 text-green-800";
      case UserRole.ESTILISTA:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Usuarios
        </h1>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as UserRole | "all")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los roles</option>
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {getRoleDisplayName(role)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salón
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.mobile && (
                        <div className="text-sm text-gray-500">
                          {user.mobile}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.isActive ? (
                        <UserCheck className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <UserX className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span
                        className={`text-sm ${
                          user.isActive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getSalonName(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end text-center space-x-2">
                      {canEditUser(user) && (
                        <>
                          {user.role !== UserRole.SUPER_ADMIN &&
                            currentUser?.id !== user.id && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                          {user.role !== UserRole.SUPER_ADMIN &&
                            currentUser?.id !== user.id && (
                              <button
                                onClick={() => handleToggleUserStatus(user)}
                                className={`${
                                  user.isActive
                                    ? "text-red-600 hover:text-red-900"
                                    : "text-green-600 hover:text-green-900"
                                }`}
                              >
                                {user.isActive ? (
                                  <UserX className="w-4 h-4" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                              </button>
                            )}

                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={editingUser ? handleEditUser : handleCreateUser}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingUser ? "Editar Usuario" : "Crear Usuario"}
                  </h3>

                  <div className="space-y-4">
                    {currentUser?.role === UserRole.SUPER_ADMIN &&
                      !editingUser && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Salon
                            </label>
                            <select
                              required
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              onChange={(e) => {
                                console.log(
                                  "Selected salon ID:",
                                  e.target.value,
                                  typeof e.target.value
                                );
                                setFormData({
                                  ...formData,
                                  salonId: Number(e.target.value),
                                });
                              }}
                              defaultValue={""}
                            >
                              <option disabled value="">
                                Selecciona una Barberia
                              </option>
                              {salons.map((salon) => (
                                <option key={salon.id} value={salon.id}>
                                  {salon.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <input
                        placeholder="Josefina"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        placeholder="josefina@email.com"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Teléfono
                      </label>
                      <input
                        required
                        placeholder="2284602570"
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Contraseña{" "}
                        {editingUser && "(dejar vacío para mantener actual)"}
                      </label>
                      <div className="mt-1 relative">
                        <input
                          placeholder="********"
                          type={showPassword ? "text" : "password"}
                          required={!editingUser}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rol
                      </label>
                      <select
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: e.target.value as UserRole,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={""}
                      >
                        <option disabled value="">
                          Selecciona un Rol
                        </option>

                        {getAvailableRoles().map((role) => (
                          <option key={role} value={role}>
                            {getRoleDisplayName(role)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : editingUser
                      ? "Actualizar"
                      : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingUser(null);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
