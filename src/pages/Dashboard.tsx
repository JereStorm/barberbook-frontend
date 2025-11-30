//Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Users, Building2, UserCheck, UserX, Phone, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../apisServices/api';
import { User, Salon, UserRole } from '../types';
import toast from 'react-hot-toast';
import SummaryCard from '../components/UI/SummaryCard';
import { Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AppointmentsTable } from '../components/Appointments/AppointmentsTable';
import { useAppointments } from '../components/Appointments/UseAppointments';
import { TodaysAppointment } from '../components/Dashboard/TodaysAppointment';
import ServicesShowTable from '../components/Dashboard/ServicesShowTable';
import { useServices } from '../components/Services/UseServices';
import UsersShowTable from '../components/Dashboard/UsersShowTable';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSalons: 0,
    mySalon: null as Salon | null,
  });
  const { appointments } = useAppointments(user);
  const { services } = useServices(user);
  const [isLoading, setIsLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Cargar usuarios
      if ([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPCIONISTA].includes(user!.role)) {
        const users = await apiService.getUsers();
        setRecentUsers(users.slice(0, 5)); // Últimos 5 usuarios

        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive).length,
        }));
      }

      // Cargar salones (solo super admin)
      if (user!.role === UserRole.SUPER_ADMIN) {
        const salons = await apiService.getSalons();
        setStats(prev => ({
          ...prev,
          totalSalons: salons.length,
        }));
      }

      // Cargar mi salon
      if (user!.salonId) {
        try {
          const mySalon = await apiService.getMySalon();
          if (mySalon) { // Verificar que no sea null
            setStats(prev => ({
              ...prev,
              mySalon,
            }));
          }
        } catch (error) {
          console.error('Error loading my salon:', error);
        }
      }
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Admin';
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.RECEPCIONISTA:
        return 'Recepcionista';
      case UserRole.ESTILISTA:
        return 'Estilista';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'bg-purple-100 text-purple-800';
      case UserRole.ADMIN:
        return 'bg-blue-100 text-blue-800';
      case UserRole.RECEPCIONISTA:
        return 'bg-green-100 text-green-800';
      case UserRole.ESTILISTA:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-principal fuente-clara rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold">
          Bienvenido, {user!.name}!
        </h1>
        <p className="mt-1 text-gray-300">
          {getRoleDisplayName(user!.role)} - {user!.salon ? user!.salon.name : 'Sistema General'}
        </p>
      </div>

      <div className="dashboard-grid mx-3">
        {
          [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPCIONISTA].includes(user!.role) && (
            <div className="db-item-1">
              {/* PRIMERO LOS TURNOS DEL DIA */}
              <TodaysAppointment appointments={appointments} />
            </div>
          )
        }

        {/* SEGUNDO LA INFO DEL SALON (EDITABLE PARA LOS ADMIN ONLY) */}
        <div className="db-item-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Salones Totales</h3>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalSalons}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TERCERO LA VISTA DE LOS SERVICIOS ACTIVOS */}
        {[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPCIONISTA].includes(user!.role) && (
          <div className="db-item-4">
            <ServicesShowTable services={services} />
          </div>

        )}

        {/* CUARTO LA VISTA DE USUARIOS PARA TODOS MENOS LOS ESTILISTAS */}
        {![UserRole.ESTILISTA].includes(user!.role) && (
          <div className='db-item-3'>
            <UsersShowTable users={recentUsers} />

          </div>

        )}



      </div>

      {[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPCIONISTA].includes(user!.role) && recentUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Usuarios Recientes</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentUsers.map((recentUser) => (
              <div key={recentUser.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{recentUser.name}</p>
                      <p className="text-sm text-gray-500">{recentUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(recentUser.role)}`}>
                      {getRoleDisplayName(recentUser.role)}
                    </span>
                    <div className="flex items-center">
                      {recentUser.isActive ? (
                        <UserCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <UserX className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPCIONISTA].includes(user!.role) && (
              <Link
                to={"/users"}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Gestionar Usuarios</p>
                    <p className="text-sm text-gray-500">Crear, editar y administrar usuarios</p>
                  </div>
                </div>
              </Link>
            )}

            {user!.role === UserRole.SUPER_ADMIN && (
              <Link
                to={"/salons"}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900">Gestionar Salones</p>
                    <p className="text-sm text-gray-500">Crear y administrar salones</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;