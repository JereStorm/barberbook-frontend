import { CircleCheckBig, CircleX, Edit, MessageCircleMore, Trash2 } from "lucide-react";
import { Appointment, AppointmentStatus } from "../../types";
import { formatDateTime } from "../Utils";

type Props = {
    appointments: Appointment[];
    isStylist: boolean;
    onEdit: (apt: Appointment) => void;
    onCanceled: (apt: Appointment) => void;
    onDelete: (apt: Appointment) => void;
    onSendReceipt: (apt: Appointment) => void
};

export const AppointmentsTable: React.FC<Props> = ({
    appointments,
    isStylist,
    onEdit,
    onCanceled,
    onDelete,
    onSendReceipt,
}) => {

    // TABLA
    const getStatusBadgeColor = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.ACTIVO:
                return 'text-sm bg-purple-100 text-purple-800 border border-purple-200';
            case AppointmentStatus.CADUCADO:
                return 'text-sm bg-blue-100 text-blue-800 border border-blue-200';
            case AppointmentStatus.COMPLETADO:
                return 'text-sm bg-green-100 text-green-800 border border-green-200';
            case AppointmentStatus.CANCELADO:
                return 'text-sm bg-red-100 text-red-800 border border-red-200';
            default:
                return 'text-sm bg-purple-100 text-purple-800 border border-purple-200';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha / Hora
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Empleado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Servicios
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            {/* NUEVA COLUMNA: TOTAL (INCLUYE DURACION Y PRECIO) */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((apt) => (
                            <tr key={apt.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDateTime(apt.startTime)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {apt.client?.name ?? "-"}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {apt.client?.mobile ?? ""}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {apt.employee?.name ?? "Sin asignar"}
                                </td>

                                {/* COLUMNA SERVICIOS + PRECIO */}
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex flex-col gap-1">
                                        {apt.services && apt.services.length > 0 ? (
                                            <>
                                                {apt.services.map((s) => (
                                                    <span
                                                        key={s.id}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 w-fit"
                                                    >
                                                        {s.name}
                                                    </span>
                                                ))}
                                            </>
                                        ) : (
                                            <span className="text-gray-400 italic">
                                                Sin servicios
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div
                                        className={`px-3 py-1 font-medium w-fit rounded-full ${getStatusBadgeColor(apt.status as AppointmentStatus)
                                            }`}
                                    >
                                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                    </div>
                                </td>
                                {/* Nueva celda->duracion total del turno */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <p>{apt.duration ? `${apt.duration} min` : "-"}</p>
                                    {/* Aca se muestra el precio total */}
                                    <p>
                                        {apt.totalPrice && (
                                            <span className="text-xs mt-1 text-gray-700">
                                                Total: ${apt.totalPrice}
                                            </span>
                                        )}
                                    </p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        {/* Agregue un boton para enviar detalles del turno por whatsapp--->esto esta "hardcodeado" desde el front, se genera
                      el wa.me/numero tomando el numero del cliente, me parecio un buen detalle, pero la implementacion desde el back llevaria mucho tiempo!*/}
                                        <button
                                            onClick={() => onSendReceipt(apt)}
                                            className="text-green-600 hover:text-green-800"
                                            title="Enviar comprobante por WhatsApp"
                                        >
                                            <MessageCircleMore className="w-4 h-4" />
                                        </button>

                                        {!isStylist && (
                                            <button
                                                onClick={() => onDelete(apt)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Eliminar turno"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}

                                        {!isStylist && (
                                            <button
                                                onClick={() => onCanceled(apt)}
                                                className={`${apt.status !== AppointmentStatus.CANCELADO
                                                    ? "text-red-600 hover:text-red-900"
                                                    : "text-green-600 hover:text-green-900"
                                                    }`}
                                                title={apt.status === AppointmentStatus.CANCELADO ? "Activar turno" : "Cancelar turno"}
                                            >
                                                {apt.status !== AppointmentStatus.CANCELADO ? (
                                                    <CircleX className="w-4 h-4 " />
                                                ) : (
                                                    <CircleCheckBig className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => onEdit(apt)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Editar turno"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {appointments.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                >
                                    No hay turnos
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}