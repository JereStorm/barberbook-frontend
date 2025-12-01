import {
  CircleCheckBig,
  CircleX,
  Edit,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { User, UserRole } from "../../types";

type Props = {
  users: User[];
  currentUser: any;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggle: (user: User) => void;
};

export const UsersCards: React.FC<Props> = ({
  users,
  currentUser,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const canEditUser = (user: User): boolean => {
    if (!currentUser) return false;

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return user.role !== UserRole.SUPER_ADMIN || currentUser.id === user.id;
    }

    // Debe ser del mismo salón
    if (currentUser.salonId !== user.salonId) {
      return false;
    }

    if (currentUser.role === UserRole.ADMIN || currentUser.id === user.id) {
      return [
        UserRole.ADMIN,
        UserRole.RECEPCIONISTA,
        UserRole.ESTILISTA,
      ].includes(user.role);
    }

    if (currentUser.role === UserRole.RECEPCIONISTA) {
      return user.role === UserRole.ESTILISTA;
    }

    return false;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <div
          key={user.id}
          className="rounded-xl p-5 shadow-lg text-white
      bg-gradient-to-br from-[#0E1F3D] via-[#0E2A60] to-[#0E3780]"
        >
          {/* Título */}
          <h2 className="text-xl font-bold mb-4">{user.name}</h2>

          {/* Datos del usuario */}
          <div className="space-y-2 text-gray-200 mb-4">
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-semibold">Telefono:</span> {user.mobile}
            </p>
          </div>

          {/* Acciones */}

          <div className="flex justify-end gap-4 pt-4 border-t border-white/20">
            {canEditUser(user) && (
              <>
                {user.role !== UserRole.SUPER_ADMIN &&
                  currentUser?.id !== user.id && (
                    <button
                      onClick={() => onDelete(user)}
                      className="hover:text-red-300 transition"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                {user.role !== UserRole.SUPER_ADMIN &&
                  currentUser?.id !== user.id && (
                    <button
                      onClick={() => onToggle(user)}
                      title={
                        user.isActive ? "Desactivar usuario" : "Activar usuario"
                      }
                      className={`${
                        user.isActive
                          ? "hover:text-red-300 transition"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {user.isActive ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </button>
                  )}

                <button
                  onClick={() => onEdit(user)}
                  className="hover:text-blue-300 transition"
                  title="Editar usuario"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {users.length === 0 && (
        <div className="col-span-full flex justify-center py-8">
          <p className="text-gray-300 text-sm">No hay usuarios</p>
        </div>
      )}
    </div>
  );
};
