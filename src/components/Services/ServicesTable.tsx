import {
  CircleCheckBig,
  CircleX,
  Edit,
  SquareScissors,
  Trash2,
} from "lucide-react";
import { Service } from "../../types";
import { formatPrice } from "../Utils";

type Props = {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
};

export const ServicesTable: React.FC<Props> = ({
  services,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duración (min)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((svc) => (
              <tr key={svc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {svc.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {svc.durationMin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatPrice(Number(svc.price)).toString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {svc.isActive ? (
                      <SquareScissors className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <SquareScissors className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span
                      className={`text-sm ${svc.isActive ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {svc.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onDelete(svc)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar servicio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onToggleStatus(svc)}
                      title={svc.isActive ? "Desactivar servicio" : "Activar servicio"}
                      className={`${svc.isActive
                        ? "text-red-600 hover:text-red-900"
                        : "text-green-600 hover:text-green-900"
                        }`}
                    >
                      {svc.isActive ? (
                        <CircleX className="w-4 h-4" />
                      ) : (
                        <CircleCheckBig className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => onEdit(svc)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar servicio"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No hay servicios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
