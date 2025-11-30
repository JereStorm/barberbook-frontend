// Componente de login

import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { LoginRequest } from "../../types";

const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await login(formData);
    if (success) {
      // El redirect se maneja automáticamente por el Navigate arriba
    }

    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Credenciales de cargar rapida (es para hacer pruebas rapidas con los distintos roles, todos tienen la misma contraseña)
  const exampleCredentials = [
    {
      role: "Super Admin",
      email: "superadmin@barberbook.com",
      password: "SuperAdmin123!",
    },
    {
      role: "Admin",
      email: "admin@salonelegante.com",
      password: "SuperAdmin123!",
    },
    {
      role: "Recepcionista",
      email: "maria@salonelegante.com",
      password: "SuperAdmin123!",
    },
    {
      role: "Estilista",
      email: "carlos@salonelegante.com",
      password: "SuperAdmin123!",
    },
  ];

  const fillExampleCredentials = (email: string, password: string) => {
    setFormData({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center my-auto flex flex-col md:flex-row items-center md:justify-center  md:space-x-4">
        <div className="icono-principal"></div>
        <h1 className="text-7xl font-bold fuente-principal">BarberBook</h1>
      </div>
      <div className="max-w-md w-full space-y-8 mb-auto">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6 my-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white principal-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        </div>

        <div className=" bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Credenciales de ejemplo:
          </h3>
          <div className="space-y-2">
            {exampleCredentials.map((cred, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <div className="text-xs">
                  <div className="font-medium">{cred.role}</div>
                  <div className="text-gray-500">{cred.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    fillExampleCredentials(cred.email, cred.password)
                  }
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                >
                  Usar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
