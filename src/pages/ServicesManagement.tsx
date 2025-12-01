import { Plus, Search } from "lucide-react";
import { CreateServiceRequest, Service } from "../types";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useServices } from "../components/Services/UseServices";
import { ServicesTable } from "../components/Services/ServicesTable";
import { ServiceModal } from "../components/Services/ServiceModal";
import { useSearchFilter } from "../hooks/useSearchFilters";
import { CreateButton } from "../components/UI/CreateButton";

const ServicesManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    services,
    isLoading,
    isSubmitting,
    DURATION_MIN,
    loadServices,
    createNewService,
    editService,
    removeService,
    toggleServiceStatus,
  } = useServices(currentUser);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<CreateServiceRequest>({
    salonId: currentUser?.salonId ?? 0,
    name: "",
    price: "",
    durationMin: DURATION_MIN,
  });

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {

    const success = editingService
      ? await editService(editingService.id, formData)
      : await createNewService(formData);

    if (success) {
      setIsModalOpen(false);
    }
  }

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

  //NUEVA IMPLEMENTACION CON CUSTOM HOOK + USEMEMO
  const filteredServices = useSearchFilter(services, searchTerm, [
    s => s.name,
    s => s.price,
    s => s.durationMin,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Servicios
        </h1>
        <CreateButton openCreateModal={openCreateModal} />
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

      <ServicesTable
        services={filteredServices}
        onEdit={openEditModal}
        onDelete={removeService}
        onToggleStatus={toggleServiceStatus}
      />

      {isModalOpen && (
        <ServiceModal
          durationMin={DURATION_MIN}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          editingService={!!editingService}
        />
      )}
    </div>
  );
};

export default ServicesManagement;
