import { Plus, Edit, Trash2, Search, SquareScissors, UserX, UserCheck, CircleCheck, CircleCheckBig, CircleX } from "lucide-react";
import { CreateServiceRequest, Service, UpdateServiceRequest, UserRole } from "../types";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import {
  createService,
  getServices,
  updateService,
  deleteService,
} from "../services/api-services";
import { apiService } from "../services/api";
import AlertService from "../helpers/sweetAlert/AlertService";

const ServicesManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<CreateServiceRequest>({
    salonId: currentUser?.salonId ?? 0,
    name: "",
    price: "",
    durationMin: 15,
  });

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadServices = async () => {
    if (!currentUser) {
      toast.error("Usuario no autenticado");
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

  const resetForm = () => {
    setFormData({
      salonId: currentUser?.salonId ?? 0,
      name: "",
      price: "",
      durationMin: 15,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, salonId: currentUser?.salonId ?? 0 }));
    setEditingService(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Service) => {
    setFormData({
      salonId: item.salonId ?? currentUser?.salonId ?? 0,
      name: item.name,
      price: item.price,
      durationMin: item.durationMin,
    });
    setEditingService(item);
    setIsModalOpen(true);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setIsModalOpen(false);
      resetForm();
      loadServices();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error creando servicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !currentUser) return;

    setIsSubmitting(true);
    try {
      const updateData: UpdateServiceRequest = {
        name: formData.name?.trim(),
        price: formData.price.toString(),
        durationMin: formData.durationMin,
      };

      await updateService(editingService.id, updateData);
      toast.success("Servicio actualizado correctamente");
      setIsModalOpen(false);
      setEditingService(null);
      resetForm();
      loadServices();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error actualizando servicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (item: Service) => {
    const confirmed = await AlertService.confirm(
      `¿Está seguro que desea eliminar el servicio "${item.name}"?`
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
      await deleteService(item.id);
      toast.success("Servicio eliminado");
      loadServices();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message || "Error eliminando servicio");
    }
  };

  const handleToggleServiceStatus = async (service: Service) => {
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

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
      p ?? 0
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Servicios</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Servicio
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar servicios..."
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
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración (min)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
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
              {filteredServices.map((svc) => (
                <tr key={svc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{svc.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {svc.durationMin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(Number(svc.price)).toString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {svc.isActive ? (
                        <SquareScissors className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <SquareScissors className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span
                        className={`text-sm ${svc.isActive ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {svc.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleDeleteService(svc)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar servicio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {currentUser?.role !== UserRole.SUPER_ADMIN && (
                        < button
                          onClick={() => handleToggleServiceStatus(svc)}
                          className={`${svc.isActive
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                            }`}
                        >
                          {svc.isActive ? (
                            <CircleX className="w-4 h-4" />
                          ) : (
                            <CircleCheckBig className="w-4 h-4" />
                          )}
                        </ button>
                      )
                      }

                      <button
                        onClick={() => openEditModal(svc)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar servicio"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay servicios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={editingService ? handleEditService : handleCreateService}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {editingService ? "Editar Servicio" : "Crear Servicio"}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Nombre del servicio
                        </label>
                        <input
                          placeholder="Corte Basico"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Precio</label>
                        <input
                          required
                          min={0}
                          placeholder="16.000"
                          type="number"
                          value={formData.price ?? ""}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duración (min)</label>
                        <input
                          min={15}
                          type="number"
                          placeholder="15"
                          value={formData.durationMin ?? ""}
                          onChange={(e) =>
                            setFormData({ ...formData, durationMin: Number(e.target.value) })
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
                      {isSubmitting ? "Guardando..." : editingService ? "Actualizar" : "Crear"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingService(null);
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
        )
      }
    </div >
  );
};

export default ServicesManagement;