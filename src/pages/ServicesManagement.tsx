import { Plus } from "lucide-react";
import { CreateServiceRequest } from "../types";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const ServicesManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<CreateServiceRequest>({
    salonId: currentUser?.salonId ?? 0, // se actualizará al abrir modal
    name: '',
    price: 0,
    durationMin: 15,
  });

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
    // setEditingClient(null);
    // setIsModalOpen(true);
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

    </div>
  )
}

export default ServicesManagement;