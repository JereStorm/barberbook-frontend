import { Plus, Search, Edit, Trash2, CircleX } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Appointment, AppointmentStatus, CreateAppointmentRequest } from "../types";
import toast from "react-hot-toast";
import {
    cancelAppointment,
    deleteAppointment,
    getAppointments,
    // deleteAppointment,
    // updateAppointment,
} from "../services/api-appointments";
import { apiService } from "../services/api";
import AlertService from "../helpers/sweetAlert/AlertService";

const AppointmentsManagement: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
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

    useEffect(() => {
        loadAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadAppointments = async () => {
        if (!currentUser) {
            toast.error("Usuario no autenticado");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const data = await getAppointments();
            console.log(data)
            setAppointments(data);
        } catch (error) {
            const apiError = apiService.handleError(error);
            toast.error(apiError.message || "Error cargando turnos");
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setFormData((prev) => ({ ...prev, salonId: currentUser?.salonId ?? 0 }));
        setEditingAppointment(null);
        setIsModalOpen(true);
    };

    const openEditModal = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setFormData({
            salonId: appointment.salonId ?? currentUser?.salonId ?? 0,
            startTime: appointment.startTime ?? "",
            clientId: appointment.clientId ?? 0,
            employeeId: appointment.employeeId ?? 0,
            serviceId: appointment.serviceId ?? 0,
            status: appointment.status as AppointmentStatus,
            notes: appointment.notes ?? null,
            createdBy: appointment.createdBy ?? currentUser?.id ?? 0,
        });
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

    const handleCancelAppointment = (appointment: Appointment) => async () => {
        const confirmed = await AlertService.confirm(
            `¿Está seguro que desea cancelar el turno para "${appointment.clientId ?? 'sin nombre'}" el ${formatDateTime(appointment.startTime)}?`
        );
        if (!confirmed) {
            toast.success("Cancelación cancelada");
            return;
        }
        if (!currentUser) {
            toast.error("Usuario no autenticado");
            return;
        }
        try {
            await cancelAppointment(appointment.id);
            toast.success("Turno cancelado");
            loadAppointments();
        } catch (error) {
            const apiError = apiService.handleError(error);
            toast.error(apiError.message || "Error cancelando turno");
        }
    }

    const handleDeleteAppointment = async (appointment: Appointment) => {
        const confirmed = await AlertService.confirm(
            `¿Está seguro que desea eliminar el turno para "${appointment.clientId ?? 'sin nombre'}" el ${formatDateTime(appointment.startTime)}?`
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
            await deleteAppointment(appointment.id);
            toast.success("Turno eliminado");
            loadAppointments();
        } catch (error) {
            const apiError = apiService.handleError(error);
            toast.error(apiError.message || "Error eliminando turno");
        }
    };

    const filteredAppointments = appointments.filter((a) => {
        const term = searchTerm.toLowerCase();
        return (
            // (a.client?.name ?? "").toLowerCase().includes(term) ||
            // (a.employeeId?.name ?? "").toLowerCase().includes(term) ||
            (a.service?.name ?? "").toLowerCase().includes(term) ||
            (a.startTime ?? "").toLowerCase().includes(term)
        );
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    function formatDateTime(dt?: string) {
        if (!dt) return "-";
        try {
            return new Date(dt).toLocaleString();
        } catch {
            return dt;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white rounded-lg shadow p-6 py-8">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Turnos</h1>
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
                        placeholder="Buscar turnos por cliente, empleado o servicio..."
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAppointments.map((apt) => (
                                <tr key={apt.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(apt.startTime)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{apt.client.name ?? "-"}</div>
                                        <div className="text-sm text-gray-500">{apt.client.mobile ?? apt.clientId ?? ""}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.employee?.name ?? "Sin asignar"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.service?.name ?? "-"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div
                                            className={`px-3 py-1 text-sm font-medium ${apt.status === AppointmentStatus.CONFIRMADO || apt.status === AppointmentStatus.COMPLETADO
                                                ? "text-green-600"
                                                : apt.status === AppointmentStatus.CANCELADO
                                                    ? "text-red-600"
                                                    : "text-yellow-600"
                                                }`}
                                        >
                                            {apt.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => openEditModal(apt)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Editar turno"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={handleCancelAppointment(apt)}
                                                className="text-red-600 hover:text-red-900">
                                                <CircleX className="w-4 h-4 " />

                                            </button>
                                            <button
                                                onClick={() => handleDeleteAppointment(apt)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Eliminar turno"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAppointments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No hay turnos</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de crear/editar: reutiliza formData y editingAppointment */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            {/* El formulario de creación/edición puede implementarse aquí reutilizando formData */}
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingAppointment ? "Editar Turno" : "Crear Turno"}
                                </h3>
                                <p className="text-sm text-gray-500">Formulario de turno (implementar campos y submit según tu API).</p>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingAppointment(null);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 bg-white border rounded text-gray-700 hover:bg-gray-50"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentsManagement;