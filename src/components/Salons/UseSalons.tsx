import { useEffect, useState } from "react";
import { CreateSalonRequest, Salon, UpdateSalonRequest } from "../../types";
import toast from "react-hot-toast";
import { apiService } from "../../apisServices/api";
import AlertService from "../../helpers/sweetAlert/AlertService";

export function useSalons(currentUser: any) {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const createNewSalon = async (
    formData: CreateSalonRequest
  ): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      await apiService.createSalon(formData);
      toast.success("Salon creado correctamente");
      loadSalons();
      return true;
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const editSalon = async (
    id: number,
    formData: UpdateSalonRequest
  ): Promise<boolean> => {
    //if (!editingSalon) return;

    setIsSubmitting(true);

    try {
      const updateData: UpdateSalonRequest = {
        name: formData.name,
        address: formData.address || undefined,
        mobile: formData.mobile || undefined,
      };

      await apiService.updateSalon(id, updateData);
      toast.success("Salon actualizado correctamente");
      loadSalons();
      return true;
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSalon = async (salon: Salon) => {
    const confirmed = await AlertService.confirm(
      `¿Estás seguro de eliminar el salón "${salon.name}"? Esta acción eliminará todos los usuarios asociados.`
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
      await apiService.deleteSalon(salon.id);
      toast.success("Salón eliminado correctamente");
      loadSalons();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    }
  };

  const switchSalonStatus = async (salon: Salon) => {
    let verbo;
    if (salon.activeUsersCount !== 0) {
      verbo = "desactivar";
    } else {
        verbo = "activar";
    }

    const confirmed = await AlertService.confirm(
      `¿Estás seguro de ${verbo} el salón "${salon.name}"? Esta acción va a ${verbo} todos los usuarios asociados.`
    );

    if (!confirmed) {
      toast.success("Accion cancelada");
      return;
    }

    if (!currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      if (salon.activeUsersCount === 0) {
        await apiService.enableSalon(salon.id);
      } else {
        await apiService.disableSalon(salon.id);
      }
      toast.success(`Accion completada correctamente`);
      loadSalons();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    }
  };

  useEffect(() => {
    loadSalons();
  }, []);

  return {
    salons,
    isLoading,
    isSubmitting,
    loadSalons,
    createNewSalon,
    editSalon,
    removeSalon,
    switchSalonStatus,
  };
}
