//Dashboard.tsx
import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  UserCheck,
  UserX,
  Phone,
  Calendar,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../apisServices/api";
import { User, Salon, UserRole, Appointment } from "../types";
import toast from "react-hot-toast";
import SummaryCard from "../components/UI/SummaryCard";
import { Route } from "react-router-dom";
import { Link } from "react-router-dom";
import { AppointmentsTable } from "../components/Appointments/AppointmentsTable";
import { useAppointments } from "../components/Appointments/UseAppointments";
import { TodaysAppointment } from "../components/Dashboard/TodaysAppointment";
import ServicesShowTable from "../components/Dashboard/ServicesShowTable";
import { useServices } from "../components/Services/UseServices";
import UsersShowTable from "../components/Dashboard/UsersShowTable";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSalons: 0,
    mySalon: null as Salon | null,
  });
  const { loadAppointmentsToday } = useAppointments(user);
  const { services } = useServices(user);
  const [isLoading, setIsLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  const [appointmentsToday, setAppointmentsToday] = useState<Appointment[]>();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      //Carga turnos de hoy
      if (!isSuperAdmin) {
        const apsT = await loadAppointmentsToday();
        if (apsT) {
          setAppointmentsToday(apsT);
        }
      }

      // Cargar usuarios
      if (
        [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPCIONISTA].includes(
          user!.role
        )
      ) {
        const users = await apiService.getUsers();
        setRecentUsers(users.slice(0, 5)); // Últimos 5 usuarios

        setStats((prev) => ({
          ...prev,
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.isActive).length,
        }));
      }

      // Cargar salones (solo super admin)
      if (isSuperAdmin) {
        const salons = await apiService.getSalons();
        setStats((prev) => ({
          ...prev,
          totalSalons: salons.length,
        }));
      }

      // Cargar mi salon
      if (user!.salonId) {
        try {
          const mySalon = await apiService.getMySalon();
          if (mySalon) {
            // Verificar que no sea null
            setStats((prev) => ({
              ...prev,
              mySalon,
            }));
          }
        } catch (error) {
          console.error("Error loading my salon:", error);
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
        return "Super Admin";
      case UserRole.ADMIN:
        return "Administrador";
      case UserRole.RECEPCIONISTA:
        return "Recepcionista";
      case UserRole.ESTILISTA:
        return "Estilista";
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getGridByRol = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "dashboard-grid-superadmin";

      case UserRole.ADMIN:
        return "dashboard-grid-admin";

      case UserRole.RECEPCIONISTA:
        return "dashboard-grid-admin";

      case UserRole.ESTILISTA:
        return "dashboard-grid-estilista";

      default:
        return "flex flex-col";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-principal fuente-clara rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold">Bienvenido, {user!.name}!</h1>
        <p className="mt-1 text-gray-300">
          {getRoleDisplayName(user!.role)} -{" "}
          {user!.salon ? user!.salon.name : "Sistema General"}
        </p>
      </div>

      <div
        className={`dashboard-grid mx-1 md:mx-3 ${getGridByRol(user!.role)}`}
      >
        {!isSuperAdmin && (
          <div className="area-A">
            <TodaysAppointment appointments={appointmentsToday!} />
          </div>
        )}

        <div className="area-B">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Salones Totales
                </h3>
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.totalSalons}
                </p>
              </div>
            </div>
          </div>
        </div>

        {user?.role !== UserRole.ESTILISTA && (
          <div className="area-C">
            <UsersShowTable users={recentUsers} isSuperAdmin={isSuperAdmin} />
          </div>
        )}

        {!isSuperAdmin && (
          <div className="area-D">
            <ServicesShowTable services={services} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
