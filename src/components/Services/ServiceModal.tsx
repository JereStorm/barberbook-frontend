import toast from "react-hot-toast";
import { CreateServiceRequest } from "../../types";
import { FormActionButton } from "../UI/FormActionButton";

type Props = {
  isOpen: boolean;
  formData: CreateServiceRequest;
  isSubmitting: boolean;
  editingService: boolean;
  durationMin: number;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setFormData: (d: CreateServiceRequest) => void;
};

export const ServiceModal: React.FC<Props> = ({
  isOpen,
  formData,
  isSubmitting,
  editingService,
  durationMin,
  onClose,
  onSubmit,
  setFormData,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateService()) {
      onSubmit(e);
    }
  };

  const validateService = (): boolean => {
    let isValid: boolean = true;
    if (formData.price && Number(formData.price) <= 0) {
      toast.error("El precio debe ser mayor a 0");
      isValid = false;
    }

    if (formData.durationMin && formData.durationMin < durationMin) {
      toast.error(`La duracion del turno debe ser al menos de ${durationMin}`);
      isValid = false;
      formData.durationMin = durationMin;
    }

    return isValid;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingService ? "Editar Servicio" : "Crear Servicio"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del servicio
                  </label>
                  <input
                    placeholder="Corte Basico"
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
                    Precio
                  </label>
                  <input
                    required
                    placeholder="16.000"
                    type="number"
                    value={formData.price ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Duración (min)
                  </label>
                  <input
                    type="text"
                    placeholder={durationMin.toString()}
                    value={formData.durationMin ?? ""}
                    onChange={(e) => {
                      Number.isNaN(Number(e.target.value)) ?
                        setFormData({
                          ...formData,
                          durationMin: durationMin
                        }) :
                        setFormData({
                          ...formData,
                          durationMin: Number(e.target.value),
                        });
                    }}
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
                    : editingService
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
