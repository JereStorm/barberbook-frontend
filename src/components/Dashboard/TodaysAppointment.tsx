import { CalendarCog } from "lucide-react";
import { Appointment } from "../../types";
import { formatDateTime, formatHour } from "../Utils";

interface TodaysAppointmentProps {
    appointments: Appointment[];
}

export const TodaysAppointment: React.FC<TodaysAppointmentProps> = ({ appointments }) => {

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="bg-principal min-w-full divide-y divide-gray-200">
                <div className="px-6 py-2 text-start bg-principal w-full fuente-clara">
                    <h1 className="flex gap-2"><CalendarCog /> Turnos de hoy</h1>
                </div>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((apt) => (
                            <tr key={apt.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatHour(apt.startTime)}
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
                                                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-principal fuente-clara w-fit"
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
                            </tr>
                        ))}
                        {appointments.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                >
                                    No hay turnos para hoy aun...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    )
}
