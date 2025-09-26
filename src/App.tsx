//App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import UsersManagement from './pages/UsersManagement';
import SalonsManagement from './pages/SalonsManagement';
import { UserRole } from './types';

// Componente para rutas protegidas
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta publica */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas */}
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
              <ProtectedRoute 
                allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPCIONISTA]}
              >
                <UsersManagement />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/salons"
            element={
              <ProtectedRoute 
                allowedRoles={[UserRole.SUPER_ADMIN]}
              >
                <SalonsManagement />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect a dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route 
            path="*" 
            element={
              <ProtectedRoute>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Página no encontrada
                  </h1>
                  <p className="text-gray-600 mb-4">
                    La página que buscas no existe.
                  </p>
                  <a 
                    href="/dashboard" 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Volver al Dashboard
                  </a>
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>

        {/* Notificaciones globales */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#059669',
              },
            },
            error: {
              style: {
                background: '#DC2626',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

// App principal con Provider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;