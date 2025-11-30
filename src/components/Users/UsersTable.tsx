import { Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { User, UserRole } from "../../types";
import { getRoleBadgeColor, getRoleDisplayName } from "../Utils";

type Props = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggle: (user: User) => void;
  currentUser: any;
};

export const UsersTable: React.FC<Props> = ({
  users,
  onEdit,
  onToggle,
  onDelete,
  currentUser,
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
      return [UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.ESTILISTA].includes(user.role);
    }

    if (currentUser.role === UserRole.RECEPCIONISTA) {
      return user.role === UserRole.ESTILISTA;
    }

    return false;
  };

  // Función para obtener el nombre del salón (igual que en dashboard)
  const getSalonName = (user: User): string => {
    // console.log("Checking salon for user:", user.name, "salon:", user.salon);
    return user.salon ? user.salon.name : "Sin salón";
  };



  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salón
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.mobile && (
                      <div className="text-sm text-gray-500">{user.mobile}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {getRoleDisplayName(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.isActive ? (
                      <UserCheck className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <UserX className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span
                      className={`text-sm ${user.isActive ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getSalonName(user)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end text-center space-x-2">
                    {canEditUser(user) && (
                      <>
                        {user.role !== UserRole.SUPER_ADMIN &&
                          currentUser?.id !== user.id && (
                            <button
                              onClick={() => onDelete(user)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        {user.role !== UserRole.SUPER_ADMIN &&
                          currentUser?.id !== user.id && (
                            <button
                              onClick={() => onToggle(user)}
                              title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                              className={`${user.isActive
                                ? "text-red-600 hover:text-red-900"
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
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar usuario"

                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
