import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2, Users, Eye, EyeOff, Search, MapPin, Phone } from 'lucide-react';
import { apiService } from '../apisServices/api';
import { CreateSalonRequest, Salon, UpdateSalonRequest } from '../types';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { SalonsCard } from '../components/UI/SalonsCard';
import AlertService from '../helpers/sweetAlert/AlertService';


const SalonsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario
  const [formData, setFormData] = useState<CreateSalonRequest>({
    name: '',
    address: '',
    mobile: '',
    admin: {
      name: '',
      email: '',
      mobile: '',
      password: '',
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSalons();
  }, []);

  const loadSalons = async () => {
    try {
      setIsLoading(true);
      const salonsData = await apiService.getSalons();
      setSalons(salonsData);
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiService.createSalon(formData);
      toast.success(response.message);
      setIsModalOpen(false);
      resetForm();
      loadSalons();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSalon) return;

    setIsSubmitting(true);

    try {
      const updateData: UpdateSalonRequest = {
        name: formData.name,
        address: formData.address || undefined,
        mobile: formData.mobile || undefined,
      };

      const response = await apiService.updateSalon(editingSalon.id, updateData);
      toast.success(response.message);
      setIsModalOpen(false);
      setEditingSalon(null);
      resetForm();
      loadSalons();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSalon = async (salon: Salon) => {

    const confirmed = await AlertService.confirm(
      `¿Estás seguro de eliminar el salón "${salon.name}"? Esta acción eliminará todos los usuarios asociados.`
    );

    if (!confirmed) {
      toast.success("Eliminación cancelada");
      return;
    }

    if (!currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      await apiService.deleteSalon(salon.id);
      toast.success('Salón eliminado correctamente');
      loadSalons();
    } catch (error) {
      const apiError = apiService.handleError(error);
      toast.error(apiError.message);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingSalon(null);
    setIsModalOpen(true);
  };

  const openEditModal = (salon: Salon) => {
    setFormData({
      name: salon.name,
      address: salon.address || '',
      mobile: salon.mobile || '',
      admin: {
        name: '',
        email: '',
        mobile: '',
        password: '',
      },
    });
    setEditingSalon(salon);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      mobile: '',
      admin: {
        name: '',
        email: '',
        mobile: '',
        password: '',
      },
    });
    setShowPassword(false);
  };

  // Filtrar salones
  const filteredSalons = salons.filter(salon =>
    salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salon.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Salones</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Salón
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar salones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSalons.map((salon) => (
          <SalonsCard key={salon.id} salon={salon} openEditModal={openEditModal} handleDeleteSalon={handleDeleteSalon} />)
        )}
      </div>

      {filteredSalons.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay salones</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No se encontraron salones con ese criterio.' : 'Comienza creando un nuevo salón.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={editingSalon ? handleEditSalon : handleCreateSalon}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingSalon ? 'Editar Salón' : 'Crear Salón'}
                  </h3>

                  <div className="space-y-4">
                    {/* Información del Salón */}
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Información del Salón</h4>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Nombre del Salón
                          </label>
                          <input
                            placeholder="Two Brother's Barber"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Dirección
                          </label>
                          <input
                            required
                            placeholder="Calle Callao 123"
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Teléfono 
                          </label>
                          <input
                            required
                            placeholder="2284557890"
                            type="tel"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información del Admin (solo en crear) */}
                    {!editingSalon && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Administrador del Salón</h4>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Nombre del Administrador
                            </label>
                            <input
                              placeholder="Juan Pérez"
                              type="text"
                              required
                              value={formData.admin.name}
                              onChange={(e) => setFormData({
                                ...formData,
                                admin: { ...formData.admin, name: e.target.value }
                              })}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Email del Administrador
                            </label>
                            <input
                              placeholder="juan.perez@email.com"
                              type="email"
                              required
                              value={formData.admin.email}
                              onChange={(e) => setFormData({
                                ...formData,
                                admin: { ...formData.admin, email: e.target.value }
                              })}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Teléfono del Administrador
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="2284557890"
                              value={formData.admin.mobile}
                              onChange={(e) => setFormData({
                                ...formData,
                                admin: { ...formData.admin, mobile: e.target.value }
                              })}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Contraseña del Administrador
                            </label>
                            <div className="mt-1 relative">
                              <input
                                placeholder="********"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.admin.password}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  admin: { ...formData.admin, password: e.target.value }
                                })}
                                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : (editingSalon ? 'Actualizar' : 'Crear')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingSalon(null);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonsManagement;