import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { apiService } from "../services/api";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "../services/api-clients";
import { Client, CreateClientRequest, UpdateClientRequest } from "../types";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import AlertService from "../helpers/sweetAlert/AlertService";
import { ToastNotifications } from "../helpers/toastNotifications/ToastService";

const DEFAULT_COUNTRY_CODE = "+54"; // cambia si lo necesitás

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

const ClientsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateClientRequest>({
    salonId: currentUser?.salonId ?? 0, // se actualizará al abrir modal
    name: "",
    email: "",
    mobile: "",
  });

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClients = async () => {
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getClients();
      setClients(data);
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error cargando clientes");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, salonId: currentUser?.salonId ?? 0 }));
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setFormData({
      salonId: client.salonId ?? currentUser?.salonId ?? 0,
      name: client.name,
      email: client.email ?? "",
      mobile: client.mobile ?? "",
    });
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      salonId: currentUser?.salonId ?? 0,
      name: "",
      email: "",
      mobile: "",
    });
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }

    if (!formData.salonId) {
      toast.error("El salón es obligatorio para crear el cliente");
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedMobile = normalizeMobileVerySimple(formData.mobile || "");
      if (formData.mobile && !normalizedMobile) {
        toast.error(
          "Número de teléfono inválido (usa +prefijo o un número local válido)."
        );
        setIsSubmitting(false);
        return;
      }
      const payload: CreateClientRequest = {
        salonId: formData.salonId,
        name: formData.name?.trim(),
        email: formData.email?.trim() || undefined,
        mobile: normalizedMobile,
      };
      await createClient(payload);
      toast.success("Cliente creado correctamente");
      setIsModalOpen(false);
      resetForm();
      loadClients();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error creando cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !currentUser) return;

    setIsSubmitting(true);
    try {
      const normalizedMobile = normalizeMobileVerySimple(formData.mobile || "");
      if (formData.mobile && !normalizedMobile) {
        toast.error("Número de teléfono inválido. Corrige antes de guardar.");
        setIsSubmitting(false);
        return;
      }
      const updateData: UpdateClientRequest = {
        name: formData.name?.trim(),
        email: formData.email?.trim() || undefined,
        mobile: normalizedMobile,
      };

      await updateClient(editingClient.id, updateData);
      toast.success("Cliente actualizado correctamente");
      setIsModalOpen(false);
      setEditingClient(null);
      resetForm();
      loadClients();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error actualizando cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (client: Client) => {
    const confirmed = await AlertService.confirm(
      `¿Está seguro que desea eliminar al cliente "${client.name}"?`
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
      await deleteClient(client.id);
      toast.success("Cliente eliminado");
      loadClients();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error eliminando cliente");
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.mobile || "").toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Clientes
        </h1>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Cliente
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {client.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{client.email}</div>
                    {client.mobile && <div>{client.mobile}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {client.createdAt
                        ? new Date(client.createdAt).toLocaleString()
                        : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleDeleteClient(client)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(client)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No hay clientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form
                onSubmit={editingClient ? handleEditClient : handleCreateClient}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingClient ? "Editar Cliente" : "Crear Cliente"}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <input
                        placeholder="Manuel"
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
                        required
                        placeholder="manuel@email.com"
                        type="email"
                        value={formData.email ?? ""}
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
                        type="tel"
                        inputMode="tel"
                        placeholder="2284557890"
                        value={formData.mobile ?? ""}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
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
                      : editingClient
                        ? "Actualizar"
                        : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingClient(null);
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

export default ClientsManagement;
