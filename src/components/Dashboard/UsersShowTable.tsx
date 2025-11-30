import { Users } from "lucide-react";
import { User } from "../../types";
import { getRoleBadgeColor, getRoleDisplayName } from "../Utils";

interface UsersShowTableProps {
    users: User[];
}
export default function UsersShowTable({ users }: UsersShowTableProps) {
    // Función para obtener el nombre del salón (igual que en dashboard)
    const getSalonName = (user: User): string => {
        // console.log("Checking salon for user:", user.name, "salon:", user.salon);
        return user.salon ? user.salon.name : "Sin salón";
    };
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">

                <table className="min-w-full bg-principal divide-y divide-gray-200">
                    <div className="px-6 py-2 text-start bg-principal fuente-clara">
                        <h1 className="flex gap-2"><Users /> Usuarios</h1>
                    </div>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {user.name}
                                    </div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                    {user.mobile && (
                                        <div className="text-sm text-gray-500">{user.mobile}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${getRoleBadgeColor(
                                            user.role
                                        )}`}
                                    >
                                        {getRoleDisplayName(user.role)}
                                    </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getSalonName(user)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

}