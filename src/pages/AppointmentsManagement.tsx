import { Plus, Search, Edit, Trash2, CircleX, Timer, CircleCheckBig } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Appointment,
  AppointmentStatus,
  Client,
  CreateAppointmentRequest,
  Service,
  UpdateAppointmentRequest,
  User,
} from "../types";
import toast from "react-hot-toast";
import {
  cancelAppointment,
  createAppointment,
  deleteAppointment,
  editAppointment,
  getAppointments,
} from "../services/api-appointments";
import { apiService } from "../services/api";
import AlertService from "../helpers/sweetAlert/AlertService";
import { getClients } from "../services/api-clients";
import ClientAutocomplete from "../components/Autocomplete/ClientAutocomplete";
import { CalendarInput } from "../components/Calendar/CalendarInput";
import { getServices } from "../services/api-services";

const AppointmentsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [searchClient, setSearchClient] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    salonId: currentUser?.salonId ?? 0,
    startTime: "",
    clientId: 0,
    employeeId: 0,
    serviceId: 0,
    status: AppointmentStatus.PENDIENTE,
    notes: null,
    createdBy: currentUser?.id ?? 0,
  });


  const statusDisplayName: AppointmentStatus[] = [
    AppointmentStatus.PENDIENTE,
    AppointmentStatus.ACTIVO,
    AppointmentStatus.CONFIRMADO,
    AppointmentStatus.CANCELADO,
    AppointmentStatus.COMPLETADO
  ];

  useEffect(() => {
    loadAppointments();
    loadClients();
    loadServices();
    loadEmployees();
  }, []);

  const loadAppointments = async () => {
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getAppointments();
      console.log("desde componente", data);
      setAppointments(data);
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error cargando turnos");
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    const data = await getClients();
    setClients(data);
  };

  const loadEmployees = async () => {
    const data = await apiService.getUsers();
    setEmployees(data);
  };

  const loadServices = async () => {
    const data = await getServices();
    setServices(data);
  };

  const openCreateModal = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, salonId: currentUser?.salonId ?? 0 }));
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      salonId: appointment.salonId ?? currentUser?.salonId ?? 0,
      startTime: appointment.startTime ?? "",
      clientId: appointment.clientId ?? 0,
      employeeId: appointment.employeeId ?? 0,
      serviceId: appointment.serviceId ?? 0,
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
      employeeId: 0,
      serviceId: 0,
      status: AppointmentStatus.PENDIENTE,
      notes: null,
      createdBy: currentUser?.id ?? 0,
    });

    setSelectedClient(null);
    setSearchClient("");
  };

  const handleCancelAppointment = (appointment: Appointment) => async () => {
    if (appointment.status === AppointmentStatus.CANCELADO) {
      try {
        const updateData: UpdateAppointmentRequest = {
          startTime: appointment.startTime,
          clientId: appointment.clientId,
          serviceId: appointment.serviceId,
          status: AppointmentStatus.ACTIVO,
          employeeId: appointment.employeeId!,
          notes: appointment.notes,
          createdBy: appointment.createdBy,
        };
        await editAppointment(appointment.id, updateData);
        toast.success("Turno activado");
        loadAppointments();
        return
      } catch (error) {
        const apiError = apiService.handleError(error);
        toast.error(apiError.message || "Error cancelando turno");
        return
      }
    }

    const confirmed = await AlertService.confirm(
      `¿Está seguro que desea cancelar el turno para "${appointment.client.name ?? "sin nombre"
      }" el ${formatDateTime(appointment.startTime)}?`
    );
    if (!confirmed) {
      toast.success("Cancelación cancelada");
      return;
    }
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }
    try {
      await cancelAppointment(appointment.id);
      toast.success("Turno cancelado");
      loadAppointments();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error cancelando turno");
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }

    if (!formData.salonId) {
      toast.error("El salón es obligatorio para crear el turno");
      return;
    }

    setIsSubmitting(true);
    try {
      //Validar aqui si es necesario crear el cliente primero

      const payload: CreateAppointmentRequest = {
        salonId: formData.salonId,
        startTime: formData.startTime,
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        status: formData.status,
        employeeId: formData.employeeId,
        notes: formData.notes,
        createdBy: formData.createdBy,
      };

      await createAppointment(payload);
      toast.success("Turno creado correctamente");
      setIsModalOpen(false);
      resetForm();
      loadAppointments();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error creando turno");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment || !currentUser) return;

    setIsSubmitting(true);
    try {
      //Validar aqui si es necesario crear el cliente primero
      const updateData: UpdateAppointmentRequest = {
        startTime: formData.startTime,
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        status: formData.status,
        employeeId: formData.employeeId!,
        notes: formData.notes,
        createdBy: formData.createdBy,
      };

      await editAppointment(editingAppointment.id, updateData);
      toast.success("Turno actualizado correctamente");
      setIsModalOpen(false);
      setEditingAppointment(null);
      resetForm();
      loadAppointments();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error actualizando turno");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    const confirmed = await AlertService.confirm(
      `¿Está seguro que desea eliminar el turno para "${appointment.client.name ?? "sin nombre"
      }" el ${formatDateTime(appointment.startTime)}?`
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
      await deleteAppointment(appointment.id);
      toast.success("Turno eliminado");
      loadAppointments();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error eliminando turno");
    }
  };

  const filteredAppointments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return appointments.filter(a =>
      (a.client.name ?? "").toLowerCase().includes(term) ||
      (a.startTime ?? "").toLowerCase().includes(term)
    );
  }, [appointments, searchTerm]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  function formatDateTime(dt?: string) {
    if (!dt) return "-";
    try {
      return new Date(dt).toLocaleString();
    } catch {
      return dt;
    }
  }

  const getStatusBadgeColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDIENTE:
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case AppointmentStatus.ACTIVO:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case AppointmentStatus.CONFIRMADO:
        return 'bg-green-100 text-green-800 border border-green-200';
      case AppointmentStatus.COMPLETADO:
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      default:
        return 'bg-red-100 text-red-800 border border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Turnos</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Turno
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar turnos por cliente, empleado o servicio..."
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
                  Fecha / Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(apt.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {apt.client.name ?? "-"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {apt.client.mobile ?? apt.clientId ?? ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apt.employee?.name ?? "Sin asignar"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apt.service?.name ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`px-3 py-1 flex justify-center text-sm font-medium ${getStatusBadgeColor(apt.status as AppointmentStatus)}`}
                    >
                      {apt.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(apt)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar turno"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelAppointment(apt)}
                        className={`${apt.status !== AppointmentStatus.CANCELADO
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                          }`}
                      >
                        {
                          apt.status !== AppointmentStatus.CANCELADO ?
                            <CircleX className="w-4 h-4 " /> :
                            <CircleCheckBig className="w-4 h-4" />
                        }
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(apt)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar turno"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No hay turnos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de crear/editar: reutiliza formData y editingAppointment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form
                onSubmit={
                  editingAppointment
                    ? handleEditAppointment
                    : handleCreateAppointment
                }
              >
                {/* El formulario de creación/edición puede implementarse aquí reutilizando formData */}
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingAppointment ? "Editar Turno" : "Crear Turno"}
                  </h3>

                  <div className="space-y-4">
                    {/* Calendar + time selector integrado */}
                    <div>
                      {!isCalendarOpen ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Horario
                          </label>
                          <button
                            onClick={() => setIsCalendarOpen(true)}
                            className="flex align-baseline gap-2 px-4 py-2 bg-white border rounded text-gray-700 hover:bg-gray-50"
                          >
                            Seleccionar Fecha y Hora{" "}
                            <Timer className="w-6 h-6"></Timer>
                          </button>
                        </div>
                      ) : (
                        <CalendarInput
                          initialValue={formData.startTime}
                          minDate={new Date().toISOString().slice(0, 10)}
                          onChange={() => {
                            //actualizacion en vivo opcional
                          }}
                          onApply={(iso) => {
                            setFormData((prev) => ({
                              ...prev,
                              startTime: iso,
                            }));
                            setIsCalendarOpen(false);
                          }}
                          onCancel={() => {
                            // opcional: reset formData.startTime si hace falta
                            setFormData((prev) => ({ ...prev }));

                            setIsCalendarOpen(false);
                          }}
                        />
                      )}

                      {/* Preview muy simple (local) */}
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          Fecha del Turno:{" "}
                          {formData.startTime
                            ? formatDateTime(formData.startTime)
                            : "-"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <ClientAutocomplete
                        editingAppointment={editingAppointment ?? null}
                        options={clients}
                        value={
                          editingAppointment
                            ? editingAppointment.client.name
                            : searchClient
                        }
                        onChange={setSearchClient}
                        onSelect={(c) => {
                          setFormData({ ...formData, clientId: c.id ?? 0 });
                          setSearchClient("");
                          setSelectedClient(c);
                        }}
                        placeholder="Busque a su cliente por nombre, móvil o email..."
                      />

                      {selectedClient && (
                        <div className="mt-2 text-sm text-gray-500">
                          {/* Mostrar al cliente seleccionado */}
                          <p>
                            Cliente: {selectedClient.name}
                            <span className="ms-1">
                              ({selectedClient.mobile})
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Servicio
                      </label>
                      <select
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            serviceId: Number(e.target.value),
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={
                          editingAppointment ? editingAppointment.serviceId : ""
                        }
                      >
                        <option disabled value="">
                          Selecciona un Servicio
                        </option>

                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Empleado
                      </label>
                      <select
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employeeId: Number(e.target.value),
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={
                          editingAppointment
                            ? editingAppointment.employeeId
                            : ""
                        }
                      >
                        <option disabled value="">
                          Selecciona un Empleado
                        </option>

                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Estado
                      </label>
                      <select
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as AppointmentStatus,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={
                          editingAppointment ? editingAppointment.status : ""
                        }
                      >
                        <option disabled value="">
                          Selecciona un Estado
                        </option>

                        {statusDisplayName.map((status) => (
                          <option key={status} value={status}>
                            {status[0].toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notas
                      </label>
                      <input
                        placeholder="Notas del turno"
                        type="text"
                        value={formData.notes ?? ""}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
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
                        : editingAppointment
                          ? "Actualizar"
                          : "Crear"}
                    </button>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingAppointment(null);
                        setIsCalendarOpen(false);
                        resetForm();
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
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
