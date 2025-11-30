import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
  UserRole,
} from "../../types";
import { apiService } from "../../apisServices/api";
import AlertService from "../../helpers/sweetAlert/AlertService";
import {
  createService,
  deleteService,
  getServices,
  updateService,
} from "../../apisServices/api-services";

export function useServices(currentUser: any) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const DURATION_MIN: number = 15;

  const loadServices = async () => {
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
      const data = await getServices();
      setServices(data);
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error cargando servicios");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewService = async (formData: CreateServiceRequest) => {
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }

    if (!formData.salonId) {
      toast.error("El salón es obligatorio para crear el servicio");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateServiceRequest = {
        salonId: formData.salonId,
        name: formData.name?.trim(),
        price: formData.price.toString(),
        durationMin: formData.durationMin,
      };
      await createService(payload);
      toast.success("Servicio creado correctamente");
      loadServices();
      return true;  // << OK
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error creando servicio");
      return false; // << ERROR
    } finally {
      setIsSubmitting(false);
    }
  };

  const editService = async (id: number, formData: UpdateServiceRequest) => {
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const updateData: UpdateServiceRequest = {
        name: formData.name?.trim(),
        price: formData.price?.toString(),
        durationMin: formData.durationMin,
      };

      await updateService(id, updateData);
      toast.success("Servicio actualizado correctamente");
      loadServices();
      return true;  // << OK
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error actualizando servicio");
      return false;  // << ERROR
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeService = async (service: Service) => {
    const confirmed = await AlertService.confirm(
      `¿Está seguro que desea eliminar el servicio "${service.name}"?`
    );
    if (!confirmed) {
      toast.success("Eliminación cancelada");
      return;
    }

    try {
      await deleteService(service.id);
      toast.success("Servicio eliminado");
      loadServices();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error eliminando servicio");
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const updateData: UpdateServiceRequest = {
        name: service.name,
        price: service.price.toString(),
        durationMin: service.durationMin,
        isActive: !service.isActive,
      };
      await updateService(service.id, updateData);
      toast.success(
        `Servicio ${!service.isActive ? "habilitado" : "deshabilitado"}`
      );
      loadServices();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error actualizando estado del servicio");
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  return {
    services,
    isLoading,
    isSubmitting,
    DURATION_MIN,
    loadServices,
    createNewService,
    editService,
    removeService,
    toggleServiceStatus,
  };
}
