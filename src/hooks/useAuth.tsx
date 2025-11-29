// Hook de autenticación


import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiService } from '../apisServices/api';
import { AuthResponse, LoginRequest, UserRole } from '../types';
import toast from 'react-hot-toast';

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  salonId: number | null;
  salon?: {
    id: number;
    name: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Cargar usuario al iniciar la app
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verificar que el token sigue siendo válido
          await apiService.getProfile();
        } catch (error) {
          // Token inválido, limpiar datos
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const response: AuthResponse = await apiService.login(credentials);
      
      // Guardar token y usuario
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      toast.success('Inicio de sesión exitoso');
      return true;
    } catch (error: any) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Ignorar errores de logout
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Sesión cerrada correctamente');
  };

  const refreshProfile = async () => {
    try {
      const response = await apiService.getProfile();
      setUser(response.user as AuthUser);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};