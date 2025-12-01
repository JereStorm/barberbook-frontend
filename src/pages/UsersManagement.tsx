import React, { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { apiService } from "../apisServices/api";
import { User, CreateUserRequest, UserRole, Salon } from "../types";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { getRoleDisplayName } from "../components/Utils";
import { UsersTable } from "../components/Users/UsersTable";
import { useUsers } from "../components/Users/UseUsers";
import { UserModal } from "../components/Users/UserModal";
import { useSearchFilter } from "../hooks/useSearchFilters";
import { CreateButton } from "../components/UI/CreateButton";

const UsersManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    users,
    isLoading,
    isSubmitting,
    loadUsers,
    createNewUser,
    editUser,
    removeUser,
    toggleUserStatus,
  } = useUsers(currentUser);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">(
    currentUser?.role === UserRole.SUPER_ADMIN ? UserRole.ADMIN : "all"
  );

  const [formData, setFormData] = useState<CreateUserRequest>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: UserRole.ESTILISTA,
    salonId: null,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUsers();
    if (currentUser?.role === UserRole.SUPER_ADMIN) {
      loadSalons();
    }
  }, []);

  const loadSalons = async () => {
    try {
      //setIsLoading(true);
      const salonsData = await apiService.getSalons();
      setSalons(salonsData);
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      //setIsLoading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    const success = editingUser
      ? await editUser(editingUser.id, formData)
      : await createNewUser(formData);

    if (success) {
      setIsModalOpen(false);
    }
  };

  const emailsFromUsers = users.map((e) => e.email);

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

  //NUEVA IMPLEMENTACION CON CUSTOM HOOK + USEMEMO
  const filteredUsers = useSearchFilter(
    users,
    searchTerm,
    [
      (u) => (!currentUser?.salonId ? u.salon?.name : ""),
      (u) => u.name,
      (u) => u.email,
      (u) => u.mobile,
    ],
    [
      // extraFilters
      (u) => roleFilter === "all" || u.role === roleFilter,
    ]
  );

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
        <CreateButton openCreateModal={openCreateModal} />
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

              {Object.values(UserRole)
                .filter((r) => r !== UserRole.SUPER_ADMIN)
                .map((role) => (
                  <option key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      <UsersTable
        users={filteredUsers}
        onEdit={openEditModal}
        onDelete={removeUser}
        onToggle={toggleUserStatus}
        currentUser={currentUser}
      />

      {/* Modal */}
      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          formData={formData}
          isSubmitting={isSubmitting}
          editingUser={!!editingUser}
          currentUser={currentUser}
          usersEmails={emailsFromUsers}
          salons={salons}
          showPassword={showPassword}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          setFormData={setFormData}
          setShowPassword={setShowPassword}
        />
      )}
    </div>
  );
};

export default UsersManagement;
