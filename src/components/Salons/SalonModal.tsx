import toast from "react-hot-toast";
import { CreateSalonRequest } from "../../types";
import { normalizeMobileVerySimple } from "../Utils";
import { Eye, EyeOff } from "lucide-react";
import { FormActionButton } from "../UI/FormActionButton";

type Props = {
  isOpen: boolean;
  formData: CreateSalonRequest;
  isSubmitting: boolean;
  editingSalon: boolean;
  showPassword: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setFormData: (d: CreateSalonRequest) => void;
  setShowPassword: (p: boolean) => void;
};

const SalonModal: React.FC<Props> = ({
  isOpen,
  isSubmitting,
  editingSalon,
  showPassword,
  formData,
  onClose,
  onSubmit,
  setFormData,
  setShowPassword,
}) => {
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mobile = normalizeMobileVerySimple(formData.mobile!);

    if (formData.mobile && mobile) {
      formData.mobile = mobile;
      onSubmit(e);
    } else {
      toast.error("Número de teléfono inválido.");
    }
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSalon ? "Editar Salón" : "Crear Salón"}
              </h3>

              <div className="space-y-4">
                {/* Información del Salón */}
                <div className="border-b pb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Información del Salón
                  </h4>

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
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mobile: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Información del Admin (solo en crear) */}
                {!editingSalon && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Administrador del Salón
                    </h4>

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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              admin: {
                                ...formData.admin,
                                name: e.target.value,
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              admin: {
                                ...formData.admin,
                                email: e.target.value,
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              admin: {
                                ...formData.admin,
                                mobile: e.target.value,
                              },
                            })
                          }
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
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.admin.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                admin: {
                                  ...formData.admin,
                                  password: e.target.value,
                                },
                              })
                            }
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
              <FormActionButton
                variant="primary"
                type="submit"
                disabled={isSubmitting}
                action={
                  isSubmitting
                    ? "Guardando..."
                    : editingSalon
                    ? "Actualizar"
                    : "Crear"
                }
              />

              <FormActionButton
                action="Cancelar"
                onClick={onClose}
                variant="secondary"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SalonModal;
