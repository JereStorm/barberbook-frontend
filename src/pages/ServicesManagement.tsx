import { Plus } from "lucide-react";
import { CreateServiceRequest, Service } from "../types";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { getServices } from "../services/api-services";
import { apiService } from "../services/api";

const ServicesManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const [formData, setFormData] = useState<CreateServiceRequest>({
    salonId: currentUser?.salonId ?? 0, // se actualizará al abrir modal
    name: '',
    price: 0,
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
      console.log(data)
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
      name: '',
      price: 0,
      durationMin: 15,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setFormData(prev => ({ ...prev, salonId: currentUser?.salonId ?? 0 }));
    // TODO: Seguir implementacion del modal
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form
              // onSubmit={editingService ? handleEditClient : handleCreateClient}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingService ? "Editar Cliente" : "Crear Cliente"}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre del servicio
                      </label>
                      <input
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
                        Precio
                      </label>
                      <input
                        type="number"
                        value={formData.price ?? ""}
                        onChange={(e) =>
                          setFormData({ ...formData, price: Number(e.target.value) })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Duracion
                      </label>
                      <input
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
                    {isSubmitting
                      ? "Guardando..."
                      : editingService
                        ? "Actualizar"
                        : "Crear"}
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
    </div>
  )
}

export default ServicesManagement;