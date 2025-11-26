import { CreateUserRequest, Salon, UserRole } from "../../types";
import { Eye, EyeOff } from "lucide-react";
import { getAvailableRoles, getRoleDisplayName } from "../Utils";
import { FormActionButton } from "../UI/FormActionButton";
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  formData: CreateUserRequest;
  isSubmitting: boolean;
  editingUser: boolean;
  currentUser: any;
  salons: Salon[];
  showPassword: boolean;
  usersEmails: string[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setFormData: (d: CreateUserRequest) => void;
  setShowPassword: (p: boolean) => void;
};

export const UserModal: React.FC<Props> = ({
  isOpen,
  formData,
  isSubmitting,
  editingUser,
  currentUser,
  salons,
  showPassword,
  usersEmails,
  onClose,
  onSubmit,
  setFormData,
  setShowPassword,
}) => {
  if (!isOpen) return null;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUser()) {
      onSubmit(e);
    }
  };

  /* Este validate user valida localmente los datos a enviar al backend */

  const validatePass = (): boolean => {
    //Valida la longitud de la contrasena
    if (formData.password.length < 8 || formData.password.length > 15) {
      toast.error("La contraseña debe contener entre 8 y 15 caracteres.");
      return false;
    }

    //Valida caracteres especiales en la contrasena
    if (!passwordRegex.test(formData.password)) {
      toast.error(
        "La contraseña debe contar al menos con 1 minuscula, 1 mayuscula y 1 caracter especial."
      );
      return false;
    }

    return true;
  };

  const validateEmail = (): boolean => {
    //Emails de usuarios ya registrados, filtrando el del usuario logueado
    if (editingUser) {
      //Aca se puede frenar el envio d un usuario mal editado
    } else {
      if (usersEmails.includes(formData.email)) {
        toast.error("Ese mail ya existe.");
        return false;
      }
    }

    return true;
  };

  const validateUser = (): boolean => {
    if (editingUser) {
      //aca se edita el usuario
      if (formData.password.length > 0) {
        //Estamos editando y cambiamos la passw
        if (!validatePass()) {
          return false;
        }
      }
    } else {
      //aca se crea el usuario
      if (!validatePass()) {
        return false;
      }
    }

    if (!validateEmail()) {
      return false;
    }

    return true;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? "Editar Usuario" : "Crear Usuario"}
              </h3>

              <div className="space-y-4">
                {currentUser?.role === UserRole.SUPER_ADMIN && !editingUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Salon
                      </label>
                      <select
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => {
                          console.log(
                            "Selected salon ID:",
                            e.target.value,
                            typeof e.target.value
                          );
                          setFormData({
                            ...formData,
                            salonId: Number(e.target.value),
                          });
                        }}
                        defaultValue={""}
                      >
                        <option disabled value="">
                          Selecciona una Barberia
                        </option>
                        {salons.map((salon) => (
                          <option key={salon.id} value={salon.id}>
                            {salon.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    placeholder="Josefina"
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
                    Email
                  </label>
                  <input
                    placeholder="josefina@email.com"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
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
                    placeholder="2284602570"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña{" "}
                    {editingUser && "(dejar vacío para mantener la actual)"}
                  </label>
                  <div className="mt-1 relative">
                    <input
                      placeholder="********"
                      type={showPassword ? "text" : "password"}
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
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
                  <div className="mx-1 text-gray-400">
                    <small>
                      Debe contener minimo ocho caracteres, incluyendo al menos,
                      una minuscula, una mayuscula y un caracter especial.
                    </small>
                  </div>
                </div>

                {currentUser?.role === UserRole.SUPER_ADMIN &&
                formData.role === UserRole.SUPER_ADMIN ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rol
                    </label>
                    <select
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled
                    >
                      <option value="">Super Administrador</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rol
                    </label>
                    <select
                      required
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as UserRole,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={editingUser ? formData.role : ""}
                    >
                      <option disabled value="">
                        Selecciona un Rol
                      </option>

                      {getAvailableRoles(currentUser).map((role) => (
                        <option key={role} value={role}>
                          {getRoleDisplayName(role)}
                        </option>
                      ))}
                    </select>
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
                    : editingUser
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
