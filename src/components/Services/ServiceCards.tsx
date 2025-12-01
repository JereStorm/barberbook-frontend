import { CircleCheckBig, CircleX, Edit, Trash2 } from "lucide-react";
import { Service } from "../../types";
import { formatPrice } from "../Utils";

type Props = {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
};

export const ServicesCards: React.FC<Props> = ({
  services,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <div
          className="rounded-xl p-5 shadow-lg text-white
      bg-gradient-to-br from-[#0E1F3D] via-[#0E2A60] to-[#0E3780]"
        >
          {/* Título */}
          <h2 className="text-xl font-bold mb-4">{service.name}</h2>

          {/* Datos del servicio */}
          <div className="space-y-2 text-gray-200">
            <p>
              <span className="font-semibold">Duración:</span>{" "}
              {service.durationMin} min
            </p>
            <p>
              <span className="font-semibold">Precio:</span>{" "}
              {formatPrice(Number(service.price))}
            </p>
            <p>
              <span className="font-semibold">Estado:</span>{" "}
              {service.isActive ? "Activo" : "Inactivo"}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => onEdit(service)}
              className="p-2 rounded-lg hover:bg-white/10 transition"
              title="Editar"
            >
              <Edit className="w-5 h-5" />
            </button>

            <button
              onClick={() => onToggleStatus(service)}
              className="p-2 rounded-lg hover:bg-white/10 transition"
              title={service.isActive ? "Desactivar" : "Activar"}
            >
              {service.isActive ? (
                <CircleX className="w-5 h-5 text-red-300" />
              ) : (
                <CircleCheckBig className="w-5 h-5 text-green-300" />
              )}
            </button>

            <button
              onClick={() => onDelete(service)}
              className="p-2 rounded-lg hover:bg-white/10 transition"
              title="Eliminar"
            >
              <Trash2 className="w-5 h-5 text-red-300" />
            </button>
          </div>
        </div>
      ))}

      {services.length === 0 && (
        <div className="col-span-full flex justify-center py-8">
          <p className="text-gray-300 text-sm">No hay servicios</p>
        </div>
      )}
    </div>
  );
};
