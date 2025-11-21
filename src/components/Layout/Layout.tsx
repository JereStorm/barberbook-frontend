import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Building2, LogOut, Home, Menu, X, Contact, SquareScissors, CalendarCog } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import SidebarLink from '../UI/SidebarLink';
interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    //navigate('/login');
  };

  // Navegación según rol
  const getNavigationItems = () => {
    const items = [
      { name: 'Dashboard', href: '/dashboard', icon: Home, show: true },
    ];

    // Usuarios - según permisos
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPCIONISTA].includes(user.role)) {
      items.push({
        name: 'Usuarios',
        href: '/users',
        icon: Users,
        show: true,
      });
    }

    // Turnos - según permisos
    if ([UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.ESTILISTA].includes(user.role)) {
      items.push({
        name: 'Turnos',
        href: '/appointments',
        icon: CalendarCog,
        show: true,
      });
    }

    // Servicios - según permisos
    if ([UserRole.ADMIN, UserRole.RECEPCIONISTA].includes(user.role)) {
      items.push({
        name: 'Servicios',
        href: '/services',
        icon: SquareScissors,
        show: true,
      });
    }

    // Clientes - según permisos
    if ([UserRole.ADMIN, UserRole.RECEPCIONISTA].includes(user.role)) {
      items.push({
        name: 'Clientes',
        href: '/clients',
        icon: Contact,
        show: true,
      });
    }

    // Salones - solo super admin
    if (user.role === UserRole.SUPER_ADMIN) {
      items.push({
        name: 'Salones',
        href: '/salons',
        icon: Building2,
        show: true,
      });
    }

    return items.filter(item => item.show);
  };

  const navigationItems = getNavigationItems();

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case UserRole.ADMIN:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case UserRole.RECEPCIONISTA:
        return 'bg-green-100 text-green-800 border border-green-200';
      case UserRole.ESTILISTA:
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
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

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold">BarberBook</h1>
          </div>
          <button
            className="lg:hidden p-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
              {getRoleDisplayName(user.role)}
            </span>
          </div>

          {user.salon && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-800">
                Salón: {user.salon.name}
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <SidebarLink key={item.name} sidebarStatus={setSidebarOpen} item={item} isActive={isActive}></SidebarLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-500 group-hover:text-red-600" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {navigationItems.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Gestiona tu negocio de manera eficiente
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.name}
              </p>
              <p className="text-xs text-gray-500">
                {getRoleDisplayName(user.role)}
              </p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="h-full p-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;