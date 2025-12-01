import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiService } from "../../apisServices/api";
import {
  cancelAppointment,
  createAppointment,
  deleteAppointment,
  editAppointment,
  getAppointments,
  getAppointmentsToday,
} from "../../apisServices/api-appointments";
import AlertService from "../../helpers/sweetAlert/AlertService";
import {
  Appointment,
  AppointmentStatus,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  UserRole
} from "../../types";
import { formatDateTime, normalizeMobileVerySimple } from "../Utils";

export function useAppointments(currentUser: any) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusDisplayName: AppointmentStatus[] = [
    AppointmentStatus.ACTIVO,
    AppointmentStatus.CANCELADO,
    AppointmentStatus.COMPLETADO,
    AppointmentStatus.CADUCADO,
  ];

  const loadAppointments = async () => {
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      setIsLoading(false);
      return;
    }

    if(currentUser.role === UserRole.SUPER_ADMIN){
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getAppointments();
      setAppointments(data);
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error cargando turnos");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAppointmentsToday = async () => {
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      setIsLoading(false);
      return [];
    }

    if(currentUser.role === UserRole.SUPER_ADMIN){
      setIsLoading(false);
      return [];
    }

    try {
      setIsLoading(true);
      const response = await getAppointmentsToday();
      return response;
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error cargando turnos");
    } finally {
      setIsLoading(false);
    }
  };


  const createNewAppointment = async (
    formData: CreateAppointmentRequest
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const payload: CreateAppointmentRequest = {
        salonId: formData.salonId,
        startTime: formData.startTime,
        clientId: formData.clientId,
        serviceIds: formData.serviceIds,
        status: formData.status,
        employeeId: formData.employeeId === 0 ? null : formData.employeeId,
        notes: formData.notes,
        createdBy: formData.createdBy,
      };

      await createAppointment(payload);
      toast.success("Turno creado correctamente");
      loadAppointments();
      return true;
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error creando turno");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAppointment = async (
    id: number,
    formData: UpdateAppointmentRequest
  ) => {
    setIsSubmitting(true);
    try {
      const updateData: UpdateAppointmentRequest = {
        startTime: formData.startTime,
        clientId: formData.clientId,
        serviceIds: formData.serviceIds,
        status: formData.status,
        employeeId: formData.employeeId === 0 ? null : formData.employeeId, //Si es 0 (sin asignar) = null
        notes: formData.notes,
        createdBy: formData.createdBy,
      };
      console.log(updateData);

      await editAppointment(id, updateData);
      toast.success("Turno actualizado correctamente");
      loadAppointments();
      return true;
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error actualizando turno");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAppointment = async (appointment: Appointment) => {
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

  const handleCanceledAppointment = async (appointment: Appointment) => {
    if (appointment.status === AppointmentStatus.CANCELADO) {
      try {
        const updateData: UpdateAppointmentRequest = {
          startTime: appointment.startTime,
          clientId: appointment.clientId,
          serviceIds: appointment.services.map((item) => item.id),
          status: AppointmentStatus.ACTIVO,
          employeeId: appointment.employeeId || null,
          notes: appointment.notes,
          createdBy: appointment.createdBy,
        };
        await editAppointment(appointment.id, updateData);
        toast.success("Turno activado");
        loadAppointments();
        return;
      } catch (error) {
        const apiError = apiService.handleError(error);
        toast.error(apiError.message || "Error cancelando turno");
        return;
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

  // --- FUNCIÓN PARA ENVIAR RECIBO POR WHATSAPP ---
  const handleSendReceipt = async (apt: Appointment) => {
    if (!apt.client.mobile) {
      toast.error("El cliente no tiene un número de teléfono registrado.");
      return;
    }

    const confirmed = await AlertService.confirm(
      `¿Está seguro que desea enviar un mensaje a "${apt.client.name ?? "cliente"
      }", con turno el ${formatDateTime(apt.startTime)}?`
    );
    if (!confirmed) {
      toast.success("Cancelación cancelada");
      return;
    }

    // Normalizar numero (quitar espacios, guiones, etc...)
    let phone =
      normalizeMobileVerySimple(apt.client.mobile) ||
      apt.client.mobile.replace(/\D/g, "");

    // Formatear lista de servicios
    const servicesList = apt.services
      .map((s) => `• ${s.name} ($${s.price})`)
      .join("\n");

    // Construir el mensaje
    const message = `Hola *${apt.client.name}*! 👋
        Aquí tienes los detalles de tu turno en BarberBook:

        📅 *Fecha:* ${formatDateTime(apt.startTime)}
        👤 *Profesional:* ${apt.employee?.name || "Sin asignar"}

        ✂️ *Servicios:*
        ${servicesList}

        ⏳ *Duración est:* ${apt.duration} min
        💰 *Total:* $${apt.totalPrice || 0}

        Estado: ${apt.status.toUpperCase()}
        ${apt.notes ? `📝 Notas: ${apt.notes}` : ""}

        ¡Gracias por elegirnos!`;

    // Abrir WhatsApp
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Creación rapida de cliente------>se puede crear un cliente desde el formulario de turnos
  /*
    const handleQuickClientCreate = async (formData: CreateClientRequest) => {

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
            toast.success(`Cliente "${createdClient.name}" creado y seleccionado`);
            return createdClient.id;
        } catch (error) {
            const apiError = apiService.handleError(error);
            toast.error(apiError.message || "Error creando cliente");
            return null;
        } finally {
            setIsCreatingClient(false);
        }
    };
*/

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    appointments,
    isLoading,
    isSubmitting,
    loadAppointments,
    loadAppointmentsToday,
    createNewAppointment,
    updateAppointment,
    removeAppointment,
    handleCanceledAppointment,
    handleSendReceipt,
    statusDisplayName,
  };
}
