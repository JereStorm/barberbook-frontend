import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

// Components / Pages
import Layout from '../components/Layout/Layout';
import Login from '../components/Auth/Login';
import Dashboard from '../pages/Dashboard';
import UsersManagement from '../pages/UsersManagement';
import SalonsManagement from '../pages/SalonsManagement';
import ClientsManagement from '../pages/ClientsManagement';
import ServicesManagement from '../pages/ServicesManagement';

// Toast
import { ToastNotifications } from '../helpers/toastNotifications/ToastService';
import AppointmentsManagement from '../pages/AppointmentsManagement';

// ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
};

// Rutas de la aplicación
const AppRoutes: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPCIONISTA]}>
                <UsersManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/salons"
            element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <SalonsManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.RECEPCIONISTA]}>
                <ClientsManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/services"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.RECEPCIONISTA]}>
                <ServicesManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.ESTILISTA]}>
                <AppointmentsManagement />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="*"
            element={
              <ProtectedRoute>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
                  <p className="text-gray-600 mb-4">La página que buscas no existe.</p>
                  <a href="/dashboard" className="text-blue-600 hover:text-blue-800">Volver al Dashboard</a>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>

        <ToastNotifications />
      </div>
    </Router>
  );
};

export default AppRoutes;