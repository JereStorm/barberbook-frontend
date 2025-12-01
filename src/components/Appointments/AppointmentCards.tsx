import { Appointment } from "../../types";
import {
  CircleCheckBig,
  CircleX,
  Edit,
  MessageCircleMore,
  Phone,
  Trash2,
} from "lucide-react";

interface Props {
  appointments: Appointment[];
  isStylist: boolean;
  onEdit: (apt: Appointment) => void;
  onCanceled: (apt: Appointment) => void;
  onDelete: (apt: Appointment) => void;
  onSendReceipt: (apt: Appointment) => void;
}
//TODO: Aca se puede jugar con los estilos de las cards con numeros randoms o etc
export const AppointmentCards = (props: Props) => {
  const {
    appointments,
    isStylist,
    onEdit,
    onCanceled,
    onDelete,
    onSendReceipt,
  } = props;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {appointments.map((apt) => (
        <div
          key={apt.id}
          className="card-gradiante rounded-xl p-6 text-white shadow-md"
        >
          {/* --- Header: Cliente + Empleado --- */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">
                {apt.client?.name ?? "Cliente"}
              </h2>
              <div className="flex items-center gap-2 text-sm opacity-80 mt-1">
                <Phone className="w-4 h-4" />
                <span>{apt.client?.mobile ?? "-"}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold">
                {apt.employee?.name ?? "Sin asignar"}
              </p>

              <div className="mt-1 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    apt.status === "activo" || apt.status === "completado"
                      ? "bg-green-400"
                      : "bg-red-400"
                  }`}
                ></span>
                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
              </div>
            </div>
          </div>

          {/* --- Fecha + Hora --- */}
          <div className="flex justify-center gap-3 mb-4">
            <div className="bg-white/20 px-4 py-2 rounded-lg text-sm">
              {new Date(apt.startTime).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <div className="bg-white/20 px-4 py-2 rounded-lg text-sm">
              {new Date(apt.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* --- Servicios --- */}
          <div className="flex justify-center mb-4 mx-auto">
            <div className="inline bg-white text-sm text-blue-900 font-semibold text-center rounded-lg py-1.5 px-3">
              {apt.services?.length > 0
                ? apt.services.map((s) => s.name).join(" | ")
                : "Sin servicios"}
            </div>
          </div>

          {/* --- Duración + Precio --- */}
          <div className="flex justify-between text-sm opacity-90 mb-4">
            <span>Duración: {apt.duration ?? "-"} min</span>
            <span>Precio: ${apt.totalPrice ?? "0"}</span>
          </div>

          {/* --- Acciones --- */}
          <div className="flex justify-center gap-4 pt-4 border-t border-white/20">
            {/* WhatsApp */}
            <button
              onClick={() => onSendReceipt(apt)}
              className="hover:text-green-300 transition"
              title="Enviar comprobante"
            >
              <MessageCircleMore className="w-5 h-5" />
            </button>

            {/* Eliminar */}
            {!isStylist && (
              <button
                onClick={() => onDelete(apt)}
                className="hover:text-red-300 transition"
                title="Eliminar turno"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            {/* Cancelar / Activar */}
            {!isStylist && (
              <button
                onClick={() => onCanceled(apt)}
                className="hover:text-red-300 transition"
                title={
                  apt.status === "cancelado"
                    ? "Activar turno"
                    : "Cancelar turno"
                }
              >
                {apt.status !== "cancelado" ? (
                  <CircleX className="w-5 h-5" />
                ) : (
                  <CircleCheckBig className="w-5 h-5 text-green-300" />
                )}
              </button>
            )}

            {/* Editar */}
            <button
              onClick={() => onEdit(apt)}
              className="hover:text-blue-300 transition"
              title="Editar turno"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}

      {appointments.length === 0 && (
        <div className="col-span-full flex justify-center py-6">
          <p className="text-sm text-gray-500 text-center">No hay turnos</p>
        </div>
      )}
    </div>
  );
};
