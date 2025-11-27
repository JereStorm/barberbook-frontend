import React, { useState } from "react";
import { Plus, Building2, Search } from "lucide-react";
import { CreateSalonRequest, Salon } from "../types";
import { useAuth } from "../hooks/useAuth";
import { SalonsCard } from "../components/Salons/SalonsCard";
import { useSalons } from "../components/Salons/UseSalons";
import SalonModal from "../components/Salons/SalonModal";

const SalonsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    salons,
    isLoading,
    isSubmitting,
    createNewSalon,
    editSalon,
    removeSalon,
    switchSalonStatus,
  } = useSalons(currentUser);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Formulario
  const [formData, setFormData] = useState<CreateSalonRequest>({
    name: "",
    address: "",
    mobile: "",
    admin: {
      name: "",
      email: "",
      mobile: "",
      password: "",
    },
  });

  const openCreateModal = () => {
    resetForm();
    setEditingSalon(null);
    setIsModalOpen(true);
  };

  const openEditModal = (salon: Salon) => {
    setFormData({
      name: salon.name,
      address: salon.address || "",
      mobile: salon.mobile || "",
      admin: {
        name: "",
        email: "",
        mobile: "",
        password: "",
      },
    });
    setEditingSalon(salon);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      mobile: "",
      admin: {
        name: "",
        email: "",
        mobile: "",
        password: "",
      },
    });
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = editingSalon
      ? await editSalon(editingSalon.id, formData)
      : await createNewSalon(formData);

    if (success) {
      setIsModalOpen(false);
    }
  };

  // Filtrar salones
  const filteredSalons = salons.filter(
    (salon) =>
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Salones</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Salón
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar salones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabla o estado de carga */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSalons.map((salon) => (
            <SalonsCard
              key={salon.id}
              salon={salon}
              openEditModal={openEditModal}
              handleDeleteSalon={removeSalon}
              handleDisableSalon={switchSalonStatus}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredSalons.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay salones
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "No se encontraron salones con ese criterio."
              : "Comienza creando un nuevo salón."}
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <SalonModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          editingSalon={!!editingSalon}
          setShowPassword={setShowPassword}
          showPassword={showPassword}
        />
      )}
    </div>
  );
};

export default SalonsManagement;
