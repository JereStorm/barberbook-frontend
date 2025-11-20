import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Appointment, AppointmentStatus, CreateAppointmentRequest } from "../types";
import App from "../App";

const AppointmentsManagement: React.FC = () => {

    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingClient, setEditingClient] = useState<Appointment | null>(null);

    const [formData, setFormData] = useState<CreateAppointmentRequest>({
        salonId: currentUser?.salonId ?? 0,
        startTime: "",
        clientId: 0,
        employeeId: 0,
        serviceId: 0,
        status: AppointmentStatus.PENDIENTE,
        notes: null,
        createdBy: currentUser?.id ?? 0,
    });


    const openCreateModal = () => {
        resetForm();
        setFormData((prev) => ({ ...prev, salonId: currentUser?.salonId ?? 0 }));
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            salonId: currentUser?.salonId ?? 0,
            startTime: "",
            clientId: 0,
            employeeId: 0,
            serviceId: 0,
            status: AppointmentStatus.PENDIENTE,
            notes: null,
            createdBy: currentUser?.id ?? 0,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white rounded-lg shadow p-6 py-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Gestión de Turnos
                </h1>
                <button
                    onClick={openCreateModal}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Turno
                </button>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar turnos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}


export default AppointmentsManagement;