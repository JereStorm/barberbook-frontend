import { UserPlus, Plus, Search, Edit, Trash2, CircleX, Timer, MessageCircle, CircleCheckBig } from "lucide-react";
import { useEffect, useState } from "react";
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

//Los agregue para el formulario de creacion de cliente
import { normalizeMobileVerySimple } from "../components/Utils";
import { createClient } from "../services/api-clients";

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
  const inActiveText = "(Desactivado)";

  const isStylist = currentUser?.role === "estilista";

  // --- ESTADOS PARA CREACION RAPIDA DE CLIENTE ---
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // serviceIds inicializado como array vacío----->array de servicios
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    salonId: currentUser?.salonId ?? 0,
    startTime: "",
    clientId: 0,
    employeeId: null,
    serviceIds: [],
    status: AppointmentStatus.PENDIENTE,
    notes: null,
    createdBy: currentUser?.id ?? 0,
  });

  useEffect(() => {
    loadAppointments();
    // Solo se cargan las listas completas si el usuario NO es estilista
    if (!isStylist) {
      loadClients();
      loadEmployees();
    }
    // Los servicios siempre se cargan
    loadServices();
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

    // Extraer IDs de los servicios del turno para llenar el estado
    const currentServiceIds = appointment.services
      ? appointment.services.map(s => s.id)
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
      status: AppointmentStatus.PENDIENTE,
      notes: null,
      createdBy: currentUser?.id ?? 0,
    });

    setSelectedClient(null);
    setSearchClient("");
  };

  // --- NUEVA FUNCION: Manejar Checkboxes de Servicios --- (Ahora un turno, puede tener varios servicios)
  const handleServiceToggle = (serviceId: number) => {
    setFormData(prev => {
      const currentIds = prev.serviceIds;
      if (currentIds.includes(serviceId)) {
        // Si ya está, lo sacamos
        return { ...prev, serviceIds: currentIds.filter(id => id !== serviceId) };
      } else {
        // Si no está, lo agregamos
        return { ...prev, serviceIds: [...currentIds, serviceId] };
      }
    });
  };

  // --- CALCULO DE TOTALES EN VIVO (Para mostrar en el modal) ---
  const selectedServicesObjects = services.filter(s => formData.serviceIds.includes(s.id));
  const estimatedTotal = selectedServicesObjects.reduce((sum, s) => sum + Number(s.price), 0);
  const estimatedDuration = selectedServicesObjects.reduce((sum, s) => sum + s.durationMin, 0);

  // --- FUNCIÓN PARA ENVIAR RECIBO POR WHATSAPP ---
  const handleSendReceipt = (apt: Appointment) => {
    if (!apt.client.mobile) {
      toast.error("El cliente no tiene un número de teléfono registrado.");
      return;
    }

    // Normalizar numero (quitar espacios, guiones, etc...)
    let phone = normalizeMobileVerySimple(apt.client.mobile) || apt.client.mobile.replace(/\D/g, '');

    // Formatear lista de servicios
    const servicesList = apt.services.map(s => `• ${s.name} ($${s.price})`).join('\n');

    // Construir el mensaje
    const message =
      `Hola *${apt.client.name}*! 👋
        Aquí tienes los detalles de tu turno en BarberBook:

        📅 *Fecha:* ${formatDateTime(apt.startTime)}
        👤 *Profesional:* ${apt.employee?.name || 'Sin asignar'}

        ✂️ *Servicios:*
        ${servicesList}

        ⏳ *Duración est:* ${apt.duration} min
        💰 *Total:* $${apt.totalPrice || 0}

        Estado: ${apt.status.toUpperCase()}
        ${apt.notes ? `📝 Notas: ${apt.notes}` : ''}

        ¡Gracias por elegirnos!`;

    // Abrir WhatsApp
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCancelAppointment = (appointment: Appointment) => async () => {
    if (appointment.status === AppointmentStatus.CANCELADO) {
      try {
        const updateData: UpdateAppointmentRequest = {
          startTime: appointment.startTime,
          clientId: appointment.clientId,
          serviceIds: appointment.services.map(item => item.id),
          status: AppointmentStatus.PENDIENTE,
          employeeId: appointment.employeeId || null,
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
    console.log("ESTOY CREANDO UN TURNO")
    e.preventDefault();
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }

    if (!formData.salonId) {
      toast.error("El salón es obligatorio");
      return;
    }

    if (formData.serviceIds.length === 0) {
      toast.error("Debe seleccionar al menos un servicio");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateAppointmentRequest = {
        salonId: formData.salonId,
        startTime: formData.startTime,
        clientId: formData.clientId,
        serviceIds: formData.serviceIds,
        status: formData.status,
        employeeId: formData.employeeId == 0 ? null : formData.employeeId,
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
    console.log("ESTOY EDITANDO UN TURNO")

    e.preventDefault();
    if (!editingAppointment || !currentUser) return;

    if (formData.serviceIds.length === 0) {
      toast.error("Debe seleccionar al menos un servicio");
      return;
    }


    setIsSubmitting(true);
    try {
      const updateData: UpdateAppointmentRequest = {
        startTime: formData.startTime,
        clientId: formData.clientId,
        serviceIds: formData.serviceIds,
        status: formData.status,
        employeeId: formData.employeeId!,
        notes: formData.notes,
        createdBy: formData.createdBy,
      };
      console.log(updateData)

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

  const filteredAppointments = appointments.filter((a) => {
    const term = searchTerm.toLowerCase();
    // Logica de busqueda por servicio
    const hasServiceMatch = a.services?.some(s => s.name.toLowerCase().includes(term));
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

  function formatDateTime(dt?: string) {
    if (!dt) return "-";
    try {
      return new Date(dt).toLocaleString();
    } catch {
      return dt;
    }
  }

  const statusDisplayName: AppointmentStatus[] = [
    AppointmentStatus.PENDIENTE,
    AppointmentStatus.ACTIVO,
    AppointmentStatus.CONFIRMADO,
    AppointmentStatus.CANCELADO,
    AppointmentStatus.COMPLETADO,
  ];

  // Creación rapida de cliente------>se puede crear un cliente desde el formulario de turnos
  const handleQuickClientCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }

    setIsCreatingClient(true);
    try {
      const normalizedMobile = normalizeMobileVerySimple(newClientData.mobile || "");
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

      setClients((prev) => [...prev, createdClient]);
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
                  Servicios
                </th>
                {/* NUEVA COLUMNA: DURACIÓN */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
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
                      {apt.client?.name ?? "-"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {apt.client?.mobile ?? ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apt.employee?.name ?? "Sin asignar"}
                  </td>

                  {/* COLUMNA SERVICIOS + PRECIO */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-col gap-1">
                      {apt.services && apt.services.length > 0 ? (
                        <>
                          {apt.services.map((s) => (
                            <span key={s.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                              {s.name}
                            </span>
                          ))}
                          {/* Aca se muestra el precio total */}
                          {apt.totalPrice && (
                            <span className="text-xs font-bold mt-1 text-gray-700">Total: ${apt.totalPrice}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Sin servicios</span>
                      )}
                    </div>
                  </td>

                  {/* Nueva celda->duracion total del turno */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apt.duration ? `${apt.duration} min` : "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`px-3 py-1 text-sm font-medium w-fit rounded-full ${apt.status === AppointmentStatus.CONFIRMADO ||
                        apt.status === AppointmentStatus.COMPLETADO
                        ? "text-green-800 bg-green-100"
                        : apt.status === AppointmentStatus.CANCELADO
                          ? "text-red-800 bg-red-100"
                          : "text-yellow-800 bg-yellow-100"
                        }`}
                    >
                      {apt.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">

                      {/* Agregue un boton para enviar detalles del turno por whatsapp--->esto esta "hardcodeado" desde el front, se genera
                      el wa.me/numero tomando el numero del cliente, me parecio un buen detalle, pero la implementacion desde el back llevaria mucho tiempo!*/}
                      <button
                        onClick={() => handleSendReceipt(apt)}
                        className="text-green-600 hover:text-green-800"
                        title="Enviar comprobante por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openEditModal(apt)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar turno"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {!isStylist && (
                        <button
                          onClick={handleCancelAppointment(apt)}
                          className={`${apt.status !== AppointmentStatus.CANCELADO
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                            }`}
                          title="Cancelar Turno"
                        >
                          {
                            apt.status !== AppointmentStatus.CANCELADO ?
                              <CircleX className="w-4 h-4 " /> :
                              <CircleCheckBig className="w-4 h-4" />
                          }
                        </button>
                      )}

                      {!isStylist && (
                        <button
                          onClick={() => handleDeleteAppointment(apt)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar turno"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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

      {/* Modal de crear/editar */}
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
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingAppointment ? "Editar Turno" : "Crear Turno"}
                  </h3>

                  <div className="space-y-4">
                    {/* Campo Horario */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Horario
                      </label>
                      {isStylist ? (
                        <input
                          type="text"
                          disabled
                          value={formData.startTime ? formatDateTime(formData.startTime) : "-"}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      ) : (
                        <>
                          {!isCalendarOpen ? (
                            <div>
                              <button
                                type="button"
                                onClick={() => setIsCalendarOpen(true)}
                                className="flex align-baseline gap-2 px-4 py-2 bg-white border rounded text-gray-700 hover:bg-gray-50 w-full justify-between items-center"
                              >
                                <span>
                                  {formData.startTime
                                    ? formatDateTime(formData.startTime)
                                    : "Seleccionar Fecha y Hora"}
                                </span>
                                <Timer className="w-5 h-5 text-gray-400" />
                              </button>
                            </div>
                          ) : (
                            <CalendarInput
                              initialValue={formData.startTime}
                              minDate={new Date().toISOString().slice(0, 10)}
                              onChange={() => { }}
                              onApply={(iso) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  startTime: iso,
                                }));
                                setIsCalendarOpen(false);
                              }}
                              onCancel={() => {
                                setIsCalendarOpen(false);
                              }}
                            />
                          )}
                          {!formData.startTime && !isStylist && (
                            <p className="text-xs text-red-500 mt-1">Confirme la fecha y hora.</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Campo Cliente */}
                    <div>
                      {isStylist ? (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cliente
                          </label>
                          <input
                            type="text"
                            disabled
                            value={editingAppointment?.client?.name || "Cliente no especificado"}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                          />
                        </>
                      ) : (
                        <>
                          <div className="flex gap-2 items-end">
                            <div className="flex-grow">
                              <ClientAutocomplete
                                editingAppointment={editingAppointment ?? null}
                                options={clients}
                                value={
                                  editingAppointment
                                    ? editingAppointment.client?.name
                                    : searchClient
                                }
                                onChange={setSearchClient}
                                onSelect={(c) => {
                                  setFormData({ ...formData, clientId: c.id ?? 0 });
                                  setSearchClient("");
                                  setSelectedClient(c);
                                }}
                                placeholder="Busque a su cliente..."
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsClientModalOpen(true)}
                              className="px-3 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm flex-shrink-0 mb-px"
                              title="Crear nuevo cliente"
                            >
                              <UserPlus className="w-5 h-5" />
                            </button>
                          </div>
                          {selectedClient && (
                            <div className="mt-2 text-sm text-gray-500 bg-blue-50 p-2 rounded border border-blue-100">
                              <p className="font-medium text-blue-800">
                                {selectedClient.name}
                              </p>
                              <p className="text-xs">
                                {selectedClient.mobile ? `Móvil: ${selectedClient.mobile}` : ""}
                                {selectedClient.mobile && selectedClient.email ? " | " : ""}
                                {selectedClient.email ? `Email: ${selectedClient.email}` : ""}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* CAMBIO: Campo Servicios (Checkboxes) */}
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Servicios
                        </label>
                        {/* Resumen de cálculo en vivo */}
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                          Est: {estimatedDuration} min | ${estimatedTotal}
                        </span>
                      </div>

                      <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-white">
                        {services.length === 0 && <p className="text-sm text-gray-400">No hay servicios disponibles</p>}

                        {services.map((service) => {
                          const isSelected = formData.serviceIds.includes(service.id);
                          return (
                            <div key={service.id} className="flex items-start py-2 border-b border-gray-100 last:border-0">
                              <div className="flex items-center h-5">
                                <input
                                  id={`service-${service.id}`}
                                  type="checkbox"
                                  //TODO: Aca se puede renderizar condicionalmente o no el input checkbox de un servicio que este desactivado
                                  // Si es estilista, disabled (solo lectura)
                                  disabled={isStylist || !service.isActive}
                                  checked={isSelected}
                                  onChange={() => handleServiceToggle(service.id)}
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded disabled:opacity-50"
                                />
                              </div>
                              <div className="ml-3 text-sm w-full">
                                <label htmlFor={`service-${service.id}`} className={`font-medium block cursor-pointer ${isStylist || !service.isActive ? 'text-gray-500' : 'text-gray-700'}`}>
                                  {service.name} {!service.isActive && inActiveText}
                                </label>
                                <div className="flex justify-between w-full text-gray-500 text-xs mt-0.5">
                                  <span>{service.durationMin} min</span>
                                  <span>${service.price}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {formData.serviceIds.length === 0 && !isStylist && (
                        <p className="text-xs text-red-500 mt-1">Seleccione al menos uno.</p>
                      )}
                    </div>

                    {/* Campo Empleado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Empleado
                      </label>
                      {isStylist ? (
                        <input
                          type="text"
                          disabled
                          value={currentUser.name || "Tú"}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      ) : (
                        <select
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              employeeId: Number(e.target.value),
                            })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={formData.employeeId ?? 0}
                        >
                          <option disabled value="0">
                            Selecciona un Empleado
                          </option>
                          {employees.map((employee) => (
                            <option key={employee.id} disabled={!employee.isActive} value={employee.id}>
                              {employee.name} {!employee.isActive && inActiveText}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Campo Estado */}
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
                          editingAppointment ? editingAppointment.status : AppointmentStatus.PENDIENTE
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

                    {/* Campo Notas */}
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

                  <div className="bg-white-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-4">
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
        </div >
      )}

      {/* Modal Creación Rápida de Cliente */}
      {
        isClientModalOpen && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
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
                            <label className="block text-xs font-medium text-gray-700">Nombre *</label>
                            <input
                              type="text"
                              required
                              placeholder="Nombre del cliente"
                              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={newClientData.name}
                              onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              placeholder="email@ejemplo.com"
                              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={newClientData.email}
                              onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Teléfono</label>
                            <input
                              type="tel"
                              inputMode="tel"
                              placeholder="Número de móvil"
                              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={newClientData.mobile}
                              onChange={(e) => setNewClientData({ ...newClientData, mobile: e.target.value })}
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
                      {isCreatingClient ? "Guardando..." : "Guardar y Seleccionar"}
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
        )
      }
    </div >
  );
};

export default AppointmentsManagement;