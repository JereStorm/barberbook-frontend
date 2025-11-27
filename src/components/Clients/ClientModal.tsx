import React from "react";
import { CreateClientRequest } from "../../types";
import { FormActionButton } from "../UI/FormActionButton";
import { normalizeMobileVerySimple } from "../Utils";
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: CreateClientRequest;
  setFormData: (d: CreateClientRequest) => void;
  isSubmitting: boolean;
  editingClient: boolean;
};

const ClientModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isSubmitting,
  editingClient,
}) => {

  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mobile = normalizeMobileVerySimple(formData.mobile!);
    
    if (formData.mobile && mobile) {
      formData.mobile = mobile;
      onSubmit(e)
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
                {editingClient ? "Editar Cliente" : "Crear Cliente"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    placeholder="Manuel"
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
                    required
                    placeholder="manuel@email.com"
                    type="email"
                    value={formData.email ?? ""}
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
                    type="tel"
                    inputMode="tel"
                    placeholder="2284557890"
                    value={formData.mobile ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })                     
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
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
                    : editingClient
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

export default ClientModal;
