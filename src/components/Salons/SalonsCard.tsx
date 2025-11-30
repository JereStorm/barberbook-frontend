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

interface Props {
  salon: Salon;
  openEditModal: (salon: Salon) => void;
  handleDeleteSalon: (salon: Salon) => void;
  handleDisableSalon: (salon: Salon) => void;
}
//TODO: Aca se puede jugar con los estilos de las cards con numeros randoms o etc
export const SalonsCard = (props: Props) => {
  const { salon, openEditModal, handleDeleteSalon, handleDisableSalon } = props;

  return (
    <div
      key={salon.id}
      className="rounded-xl shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-[#062b54] to-[#0a3c7a] text-white"
    >
      <div className="p-6">
        {/* TÍTULO */}
        <h2 className="text-2xl font-semibold mb-2">{salon.name}</h2>

        <hr className="border-white/20 mb-4" />

        {/* ADMIN + FECHA */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-lg font-semibold">
              {salon.owner ?? "Administrador"}
            </p>
            <p className="text-sm opacity-80">Administrador</p>
          </div>

          <p className="text-sm opacity-80">
            {salon.createdAt
              ? `Creado: ${new Date(salon.createdAt).toLocaleDateString()}`
              : ""}
          </p>
        </div>

        {/* DATOS DEL SALÓN */}
        <div className="space-y-2 text-sm">
          {salon.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white/70" />
              <span>{salon.address}</span>
            </div>
          )}

          {salon.mobile && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-white/70" />
              <span>{salon.mobile}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/70" />
            <span>Cant. Usuarios: {salon.usersCount ?? 0}</span>
          </div>
        </div>

        {/* BOTONES INFERIORES */}
        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-white/20">
          {/* Editar */}
          <button
            onClick={() => openEditModal(salon)}
            className="p-2 rounded hover:bg-white/10 transition"
            title="Editar salón"
          >
            <Edit className="w-5 h-5" />
          </button>

          {/* Desactivar */}
          <button
            onClick={() => handleDisableSalon(salon)}
            className="p-2 rounded hover:bg-white/10 transition"
            title="Desactivar salón"
          >
            {salon.activeUsersCount !== 0 ? (
              <CircleX className="w-6 h-6 text-red-300" />
            ) : (
              <CircleCheckBig className="w-6 h-6 text-green-300" />
            )}
          </button>

          {/* Eliminar */}
          <button
            onClick={() => handleDeleteSalon(salon)}
            className="p-2 rounded hover:bg-white/10 transition"
            title="Eliminar salón"
          >
            <Trash2 className="w-5 h-5 text-red-200" />
          </button>
        </div>
      </div>
    </div>
  );
};
