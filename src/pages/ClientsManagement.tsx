import React, { useState } from "react";
import { Client, CreateClientRequest } from "../types";
//import ClientsTable from "../components/clients/ClientsTable";
import { Search } from "lucide-react";
import ClientModal from "../components/Clients/ClientModal";
import { ClientsTable } from "../components/Clients/ClientsTable";
import { useClients } from "../components/Clients/UseClients";
import { CreateButton } from "../components/UI/CreateButton";
import { useAuth } from "../hooks/useAuth";
import { useSearchFilter } from "../hooks/useSearchFilters";

const ClientsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    clients,
    isLoading,
    isSubmitting,
    createNewClient,
    editClient,
    removeClient,
  } = useClients(currentUser);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<CreateClientRequest>({
    name: "",
    email: "",
    mobile: "",
    salonId: currentUser?.salonId || 0,
  });

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      email: "",
      mobile: "",
      salonId: currentUser?.salonId || 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email ?? "",
      mobile: client.mobile ?? "",
      salonId: client.salonId ?? 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = editingClient
      ? await editClient(editingClient.id, formData)
      : await createNewClient(formData);

    if (success) {
      setIsModalOpen(false);
    }
  };

  //NUEVA IMPLEMENTACION CON CUSTOM HOOK + USEMEMO
  const filteredClients = useSearchFilter(clients, searchTerm, [
    s => s.name,
    s => s.email,
    s => s.mobile,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Clientes
        </h1>
        <CreateButton openCreateModal={openCreateModal} />
      </div>
      {
        !isLoading && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )
      }

      {/* Tabla o estado de carga */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border">
          <ClientsTable
            clients={filteredClients}
            onEdit={openEditModal}
            onDelete={removeClient}
          />
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          editingClient={!!editingClient}
        />
      )}
    </div>
  );
};

export default ClientsManagement;
