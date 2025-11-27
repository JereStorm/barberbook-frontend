import {
  UserPlus,
  Plus,
  Search,
  Timer,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Appointment,
  AppointmentStatus,
  Client,
  CreateAppointmentRequest,
} from "../types";
import toast from "react-hot-toast";
import { apiService } from "../apisServices/api";
import ClientAutocomplete from "../components/Autocomplete/ClientAutocomplete";
import { CalendarInput } from "../components/Calendar/CalendarInput";

//Los agregue para el formulario de creacion de cliente
import { formatDateTime, normalizeMobileVerySimple } from "../components/Utils";
import { createClient } from "../apisServices/api-clients";
import { useClients } from "../components/Clients/UseClients";
import { useServices } from "../components/Services/UseServices";
import { useUsers } from "../components/Users/UseUsers";
import { useAppointments } from "../components/Appointments/UseAppointments";
import { AppointmentsTable } from '../components/Appointments/AppointmentsTable';
import { AppointmentModal } from "../components/Appointments/AppointmentModal";

const AppointmentsManagement: React.FC = () => {
  // CUSTOM HOOKS
  const { user: currentUser } = useAuth();
  const { appointments,
    isLoading,
    isSubmitting,
    statusDisplayName,
    createNewAppointment,
    updateAppointment,
    removeAppointment,
    handleCanceledAppointment,
    handleSendReceipt,
  } = useAppointments(currentUser);
  const { services } = useServices(currentUser);
  const { users } = useUsers(currentUser);
  const { clients } = useClients(currentUser);
  const { loadClients } = useClients(currentUser);

  // HOOKS NATIVOS
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchClient, setSearchClient] = useState("");


  const isStylist = currentUser?.role === "estilista";

  // ESTADOS PARA CREACION RAPIDA DE CLIENTE
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  // serviceIds inicializado como array vacío----->array de servicios
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    salonId: currentUser?.salonId ?? 0,
    startTime: "",
    clientId: 0,
    employeeId: null,
    serviceIds: [],
    status: AppointmentStatus.ACTIVO,
    notes: null,
    createdBy: currentUser?.id ?? 0,
  });

  const openCreateModal = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, salonId: currentUser?.salonId ?? 0 }));
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);

    // Extraer IDs de los servicios del turno para llenar el estado
    const currentServiceIds = appointment.services
      ? appointment.services.map((s) => s.id)
      : [];

    setFormData({
      salonId: appointment.salonId ?? currentUser?.salonId ?? 0,
      startTime: appointment.startTime ?? "",
      clientId: appointment.clientId ?? 0,
      employeeId: appointment.employeeId ?? 0,
      serviceIds: currentServiceIds,
      status: appointment.status as AppointmentStatus,
      notes: appointment.notes ?? null,
      createdBy: appointment.createdBy ?? currentUser?.id ?? 0,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      salonId: currentUser?.salonId ?? 0,
      startTime: "",
      clientId: 0,
      employeeId: null,
      serviceIds: [], // Resetear array
      status: AppointmentStatus.ACTIVO,
      notes: null,
      createdBy: currentUser?.id ?? 0,
    });

    setSelectedClient(null);
    setSearchClient("");
  };

  // --- NUEVA FUNCION (MODAL): Manejar Checkboxes de Servicios --- (Ahora un turno, puede tener varios servicios)
  const handleServiceToggle = (serviceId: number) => {
    setFormData((prev) => {
      const currentIds = prev.serviceIds;
      if (currentIds.includes(serviceId)) {
        // Si ya está, lo sacamos
        return {
          ...prev,
          serviceIds: currentIds.filter((id) => id !== serviceId),
        };
      } else {
        // Si no está, lo agregamos
        return { ...prev, serviceIds: [...currentIds, serviceId] };
      }
    });
  };

  //A REFACTORIZAR CON LA NUEVA IMPLEMENTACION DEL SEARCHFILTER (HOOKS)
  const filteredAppointments = appointments.filter((a) => {
    const term = searchTerm.toLowerCase();
    // Logica de busqueda por servicio
    const hasServiceMatch = a.services?.some((s) =>
      s.name.toLowerCase().includes(term)
    );
    return (
      hasServiceMatch ||
      (a.startTime ?? "").toLowerCase().includes(term) ||
      (a.client?.name ?? "").toLowerCase().includes(term)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Creación rapida de cliente------>se puede crear un cliente desde el formulario de turnos
  const handleQuickClientCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }

    setIsCreatingClient(true);
    try {
      const normalizedMobile = normalizeMobileVerySimple(
        newClientData.mobile || ""
      );
      if (newClientData.mobile && !normalizedMobile) {
        toast.error("Número de teléfono inválido.");
        setIsCreatingClient(false);
        return;
      }

      const payload = {
        salonId: currentUser.salonId ?? 0,
        name: newClientData.name.trim(),
        email: newClientData.email.trim() || undefined,
        mobile: normalizedMobile,
      };

      const createdClient = await createClient(payload);

      loadClients();
      setFormData((prev) => ({ ...prev, clientId: createdClient.id }));
      setSelectedClient(createdClient);
      setSearchClient("");

      toast.success(`Cliente "${createdClient.name}" creado y seleccionado`);
      setIsClientModalOpen(false);
      setNewClientData({ name: "", email: "", mobile: "" });
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error creando cliente");
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const success = editingAppointment
      ? await updateAppointment(editingAppointment.id, formData)
      : await createNewAppointment(formData);

    if (success) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Turnos</h1>

        {!isStylist && (
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Turno
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar turnos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <AppointmentsTable

        appointments={appointments}
        isStylist={isStylist}
        onEdit={openEditModal}
        onCanceled={
          handleCanceledAppointment
        }
        onDelete={removeAppointment}
        onSendReceipt={handleSendReceipt}
      />

      {/* Modal de crear/editar */}
      {isModalOpen && (
        <AppointmentModal
          isOpen={isModalOpen}
          formData={formData}
          isSubmitting={isSubmitting}
          isStylist={isStylist}
          selectedClient={selectedClient}
          searchClient={searchClient}
          setSearchClient={setSearchClient}
          setSelectedClient={setSelectedClient}
          editingAppointment={editingAppointment}
          statusDisplayName={statusDisplayName}
          currentUser={currentUser}
          services={services}
          users={users}
          clients={clients}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          handleServiceToggle={handleServiceToggle}
          setIsClientModalOpen={setIsClientModalOpen}
          setFormData={setFormData}
        />
      )}

      {/* Modal Creación Rápida de Cliente */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-200">
              <form onSubmit={handleQuickClientCreate}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                      <UserPlus className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Registrar Nuevo Cliente
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Nombre del cliente"
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={newClientData.name}
                            onChange={(e) =>
                              setNewClientData({
                                ...newClientData,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            placeholder="email@ejemplo.com"
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={newClientData.email}
                            onChange={(e) =>
                              setNewClientData({
                                ...newClientData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">
                            Teléfono
                          </label>
                          <input
                            type="tel"
                            inputMode="tel"
                            placeholder="Número de móvil"
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={newClientData.mobile}
                            onChange={(e) =>
                              setNewClientData({
                                ...newClientData,
                                mobile: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isCreatingClient}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isCreatingClient
                      ? "Guardando..."
                      : "Guardar y Seleccionar"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setIsClientModalOpen(false);
                      setNewClientData({ name: "", email: "", mobile: "" });
                    }}
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

export default AppointmentsManagement;
