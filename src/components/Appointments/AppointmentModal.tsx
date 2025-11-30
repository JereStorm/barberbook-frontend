import { useState } from "react";
import { Appointment, AppointmentStatus, Client, CreateAppointmentRequest, Service, UpdateAppointmentRequest, User } from "../../types";
import { formatDateTime } from "../Utils";
import { Timer, UserPlus } from "lucide-react";
import CalendarInput from "../UI/CalendarInput";
import ClientAutocomplete from "../UI/ClientAutocomplete";
import { FormActionButton } from "../UI/FormActionButton";
import toast from "react-hot-toast";

type Props = {
    isOpen: boolean;
    formData: CreateAppointmentRequest;
    isSubmitting: boolean;
    isStylist: boolean;
    selectedClient: Client | null;
    searchClient: string;
    setSearchClient: (c: string) => void;
    setSelectedClient: (c: Client) => void;
    editingAppointment: Appointment | null;
    statusDisplayName: string[];
    currentUser: any;
    // INFO REQUERIDA DE OTRAS ENTIDADES
    services: Service[];
    users: User[];
    clients: Client[];
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    handleServiceToggle: (id: number) => void;
    setIsClientModalOpen: (e: boolean) => void;
    setFormData: (d: CreateAppointmentRequest) => void;
};

export const AppointmentModal: React.FC<Props> = ({
    isOpen,
    formData,
    isSubmitting,
    isStylist,
    selectedClient,
    searchClient,
    setSearchClient,
    setSelectedClient,
    editingAppointment,
    statusDisplayName,
    currentUser,
    //INFORMACION REQUERIDA DE OTRAS ENTIDADES
    services,
    users,
    clients,
    onClose,
    onSubmit,
    handleServiceToggle,
    setIsClientModalOpen,
    setFormData,
}) => {

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    
    if (!isOpen) return null;

    const inActiveText = "(Desactivado)";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        //TODO: AQUI REALIZAR VALIDACIONES

        if (validateFields()) {
            onSubmit(e);
        }
    };

    const validateFields = (): boolean => {
        if (!currentUser) {
            toast.error("Usuario no autenticado");
            return false;
        }

        if (!formData.salonId) {
            toast.error("El salón es obligatorio");
            return false;
        }

        if (!formData.startTime) {
            toast.error("Debe confirmar la fecha");
            return false;
        }

        if (!formData.clientId) {
            toast.error("Debe seleccionar un cliente");
            return false;
        }

        if (formData.serviceIds.length === 0) {
            toast.error("Debe seleccionar al menos un servicio");
            return false;
        }

        return true;
    }

    // --- CALCULO DE TOTALES EN VIVO (Para mostrar en el modal) ---
    const selectedServicesObjects = services.filter((s) =>
        formData.serviceIds.includes(s.id)
    );
    const estimatedTotal = selectedServicesObjects.reduce(
        (sum, s) => sum + Number(s.price),
        0
    );
    const estimatedDuration = selectedServicesObjects.reduce(
        (sum, s) => sum + s.durationMin,
        0
    );


    return (

        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingAppointment ? "Editar Turno" : "Crear Turno"}
                            </h3>

                            <div className="space-y-4">
                                {/* Campo Horario */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Horario
                                    </label>
                                    {isStylist ? (
                                        <input
                                            type="text"
                                            disabled
                                            value={
                                                formData.startTime
                                                    ? formatDateTime(formData.startTime)
                                                    : "-"
                                            }
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                    ) : (
                                        <>
                                            {!isCalendarOpen ? (
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCalendarOpen(true)}
                                                        className="flex align-baseline gap-2 px-4 py-2 bg-white border rounded text-gray-700 hover:bg-gray-50 w-full justify-between items-center"
                                                    >
                                                        <span>
                                                            {formData.startTime
                                                                ? formatDateTime(formData.startTime)
                                                                : "Seleccionar Fecha y Hora"}
                                                        </span>
                                                        <Timer className="w-5 h-5 text-gray-400" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <CalendarInput
                                                    initialValue={formData.startTime}
                                                    minDate={new Date().toISOString().slice(0, 10)}
                                                    onChange={() => { }}
                                                    onApply={(iso) => {
                                                        setFormData({ ...formData, startTime: iso });
                                                        setIsCalendarOpen(false);
                                                    }}
                                                    onCancel={() => {
                                                        setIsCalendarOpen(false);
                                                    }}
                                                />
                                            )}
                                            {!formData.startTime && !isStylist && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    Confirme la fecha y hora.
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Campo Cliente */}
                                <div>
                                    {isStylist ? (
                                        <>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cliente
                                            </label>
                                            <input
                                                type="text"
                                                disabled
                                                value={
                                                    editingAppointment?.client?.name ||
                                                    "Cliente no especificado"
                                                }
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex gap-2 items-end">
                                                <div
                                                    className={`flex-grow ${editingAppointment ? "text-gray-500" : ""
                                                        }`}
                                                >
                                                    <ClientAutocomplete
                                                        disabled={editingAppointment ? true : false}
                                                        editingAppointment={editingAppointment ?? null}
                                                        options={clients}
                                                        value={
                                                            editingAppointment
                                                                ? editingAppointment.client?.name
                                                                : searchClient
                                                        }
                                                        onChange={setSearchClient}
                                                        onSelect={(c) => {
                                                            setFormData({
                                                                ...formData,
                                                                clientId: c.id ?? 0,
                                                            });
                                                            setSearchClient("");
                                                            setSelectedClient(c);
                                                        }}
                                                        placeholder="Busque a su cliente..."
                                                    />
                                                </div>
                                                <button
                                                    disabled={editingAppointment ? true : false}
                                                    type="button"
                                                    onClick={() => setIsClientModalOpen(true)}
                                                    className={`px-3 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm flex-shrink-0 mb-px ${editingAppointment
                                                        ? "cursor-not-allowed bg-green-700"
                                                        : ""
                                                        }`}
                                                    title="Crear nuevo cliente"
                                                >
                                                    <UserPlus className="w-5 h-5" />
                                                </button>
                                            </div>
                                            {selectedClient && (
                                                <div className="mt-2 text-sm text-gray-500 bg-blue-50 p-2 rounded border border-blue-100">
                                                    <p className="font-medium text-blue-800">
                                                        {selectedClient.name}
                                                    </p>
                                                    <p className="text-xs">
                                                        {selectedClient.mobile
                                                            ? `Móvil: ${selectedClient.mobile}`
                                                            : ""}
                                                        {selectedClient.mobile && selectedClient.email
                                                            ? " | "
                                                            : ""}
                                                        {selectedClient.email
                                                            ? `Email: ${selectedClient.email}`
                                                            : ""}
                                                    </p>
                                                </div>
                                            )}
                                            {!selectedClient && !isStylist && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    Seleccione un cliente.
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* CAMBIO: Campo Servicios (Checkboxes) */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Servicios
                                        </label>
                                        {/* Resumen de cálculo en vivo */}
                                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                                            Est: {estimatedDuration} min | ${estimatedTotal}
                                        </span>
                                    </div>

                                    <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-white">
                                        {services.length === 0 && (
                                            <p className="text-sm text-gray-400">
                                                No hay servicios disponibles
                                            </p>
                                        )}

                                        {services.map((service) => {
                                            const isSelected = formData.serviceIds.includes(
                                                service.id
                                            );
                                            return (
                                                <div
                                                    key={service.id}
                                                    className="flex items-start py-2 border-b border-gray-100 last:border-0"
                                                >
                                                    <div className="flex items-center h-5">
                                                        <input
                                                            id={`service-${service.id}`}
                                                            type="checkbox"
                                                            //TODO: Aca se puede renderizar condicionalmente o no el input checkbox de un servicio que este desactivado
                                                            // Si es estilista, disabled (solo lectura)
                                                            disabled={isStylist || !service.isActive}
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                handleServiceToggle(service.id)
                                                            }
                                                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded disabled:opacity-50"
                                                        />
                                                    </div>
                                                    <div className="ml-3 text-sm w-full">
                                                        <label
                                                            htmlFor={`service-${service.id}`}
                                                            className={`font-medium block cursor-pointer ${isStylist || !service.isActive
                                                                ? "text-gray-500"
                                                                : "text-gray-700"
                                                                }`}
                                                        >
                                                            {service.name}{" "}
                                                            {!service.isActive && inActiveText}
                                                        </label>
                                                        <div className="flex justify-between w-full text-gray-500 text-xs mt-0.5">
                                                            <span>{service.durationMin} min</span>
                                                            <span>${service.price}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {formData.serviceIds.length === 0 && !isStylist && (
                                        <p className="text-xs text-red-500 mt-1">
                                            Seleccione al menos uno.
                                        </p>
                                    )}
                                </div>

                                {/* Campo Empleado */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Empleado
                                    </label>
                                    {isStylist ? (
                                        <input
                                            type="text"
                                            disabled
                                            value={currentUser.name || "Tú"}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                    ) : (
                                        <select
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    employeeId: Number(e.target.value),
                                                })
                                            }
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.employeeId ?? 0}
                                        >
                                            <option value="0">Sin asignar</option>
                                            {users.map((employee) => (
                                                <option
                                                    key={employee.id}
                                                    disabled={!employee.isActive}
                                                    value={employee.id}
                                                >
                                                    {employee.name}{" "}
                                                    {!employee.isActive && inActiveText}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Campo Estado */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Estado
                                    </label>
                                    <select
                                        required
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                status: e.target.value as AppointmentStatus,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        defaultValue={
                                            editingAppointment
                                                ? editingAppointment.status
                                                : AppointmentStatus.ACTIVO
                                        }
                                    >
                                        <option disabled value="">
                                            Selecciona un Estado
                                        </option>
                                        {statusDisplayName.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Campo Notas */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Notas
                                    </label>
                                    <input
                                        placeholder="Notas del turno"
                                        type="text"
                                        value={formData.notes ?? ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, notes: e.target.value })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <FormActionButton
                                    variant="primary"
                                    type="submit"
                                    disabled={isSubmitting}
                                    action={
                                        isSubmitting
                                            ? "Guardando..."
                                            : editingAppointment
                                                ? "Actualizar"
                                                : "Crear"
                                    }
                                />

                                <FormActionButton
                                    action="Cancelar"
                                    onClick={onClose}
                                    variant="secondary"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )

}