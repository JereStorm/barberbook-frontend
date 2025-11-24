import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Client, CreateClientRequest, UpdateClientRequest } from "../../types";
import { apiService } from "../../services/api";
import { normalizeMobileVerySimple } from "../Utils";
import AlertService from "../../helpers/sweetAlert/AlertService";
import { createClient, deleteClient, getClients, updateClient } from "../../services/api-clients";

export function useClients(currentUser: any) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const createNewClient = async (formData: CreateClientRequest) => {
    setIsSubmitting(true);
    try {
      const mobile = normalizeMobileVerySimple(formData.mobile || "");
      if (formData.mobile && !mobile) {
        toast.error("Número de teléfono inválido.");
        setIsSubmitting(false);
        return;
      }

      await createClient({ ...formData, mobile });
      toast.success("Cliente creado correctamente");
      await loadClients();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editClient = async (id: number, formData: UpdateClientRequest) => {
    setIsSubmitting(true);
    try {
      const mobile = normalizeMobileVerySimple(formData.mobile || "");
      if (formData.mobile && !mobile) {
        toast.error("Número de teléfono inválido.");
        setIsSubmitting(false);
        return;
      }

      await updateClient(id, { ...formData, mobile });
      toast.success("Cliente actualizado correctamente");
      await loadClients();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeClient = async (client: Client) => {
    const confirmed = await AlertService.confirm(
      `¿Eliminar al cliente "${client.name}"?`
    );
    if (!confirmed) return;

    try {
      await deleteClient(client.id);
      toast.success("Cliente eliminado");
      await loadClients();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return {
    clients,
    isLoading,
    isSubmitting,
    createNewClient,
    editClient,
    removeClient,
  };
}