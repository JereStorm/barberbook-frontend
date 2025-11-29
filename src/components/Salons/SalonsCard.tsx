import { Salon } from "../../types";
import {
  Building2,
  CircleCheckBig,
  CircleX,
  Edit,
  MapPin,
  Phone,
  Trash2,
  Users,
} from "lucide-react";

const bgClasses = [
  "bg-blue-100",
  "bg-pink-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-purple-100",
];

const getBackground = (id?: string | number) => {
  if (id === undefined || id === null) {
    // fallback random if no id
    return bgClasses[Math.floor(Math.random() * bgClasses.length)];
  }
  const s = String(id);
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return bgClasses[hash % bgClasses.length];
};

interface Props {
  salon: Salon;
  openEditModal: (salon: Salon) => void;
  handleDeleteSalon: (salon: Salon) => void;
  handleDisableSalon: (salon: Salon) => void;
}
//TODO: Aca se puede jugar con los estilos de las cards con numeros randoms o etc
export const SalonsCard = (props: Props) => {
  const { salon, openEditModal, handleDeleteSalon, handleDisableSalon } = props;
  const bgClass = getBackground(salon.id);

  return (
    <div
      key={salon.id}
      className={`${bgClass} rounded-lg shadow hover:shadow-lg transition-shadow`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Building2 className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {salon.name}
              </h3>
            </div>

            {salon.address && (
              <div className="flex items-start mb-2">
                <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{salon.address}</p>
              </div>
            )}

            {salon.mobile && (
              <div className="flex items-center mb-2">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                <p className="text-sm text-gray-600">{salon.mobile}</p>
              </div>
            )}

            <div className="flex items-center mb-4">
              <Users className="w-4 h-4 text-gray-400 mr-2" />
              <p className="text-sm text-gray-600">
                {salon.usersCount || 0} usuarios ({salon.activeUsersCount || 0}{" "}
                activos)
              </p>
            </div>

            <p className="text-xs text-gray-400">
              Creado: {new Date(salon.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
          <button
            onClick={() => handleDeleteSalon(salon)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Eliminar salón"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDisableSalon(salon)}
            className={`${
              salon.activeUsersCount
                ? "text-red-600 hover:text-red-900"
                : "text-green-600 hover:text-green-900"
            } p-2 rounded-lg`}
            title="Desactivar salón"
          >
            {salon.activeUsersCount != 0 ? (
              <CircleX className="w-4 h-4 " />
            ) : (
              <CircleCheckBig className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => openEditModal(salon)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Editar salón"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
