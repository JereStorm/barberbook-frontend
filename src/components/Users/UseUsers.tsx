import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserRole,
} from "../../types";
import { apiService } from "../../services/api";
import { normalizeMobileVerySimple } from "../Utils";
import AlertService from "../../helpers/sweetAlert/AlertService";

export function useUsers(currentUser: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      setIsLoading(false);
      return;
    }

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

  const createNewClient = async (formData: CreateUserRequest) => {
    setIsSubmitting(true);
    try {
      const normalizedMobile = normalizeMobileVerySimple(formData.mobile || "");

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
      await loadUsers();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editUser = async (id: number, formData: UpdateUserRequest) => {
    setIsSubmitting(true);

    try {
      const normalizedMobile = normalizeMobileVerySimple(formData.mobile);

      const updateData: UpdateUserRequest = {
        name: formData.name,
        email: formData.email,
        mobile: normalizedMobile,
        role: formData.role,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await apiService.updateUser(id, updateData);
      toast.success("Usuario actualizado correctamente");
      loadUsers();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeUser = async (user: User) => {
    const confirmed = await AlertService.confirm(
      `¿Eliminar al cliente "${user.name}"?`
    );
    if (!confirmed) return;

    try {
      await apiService.deleteUser(user.id);
      toast.success("Usuario eliminado correctamente");
      loadUsers();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
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

  const toggleUserStatus = async (user: User) => {
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

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    isLoading,
    isSubmitting,
    createNewClient,
    editUser,
    removeUser,
    canEditUser,
    toggleUserStatus,
  };
}
