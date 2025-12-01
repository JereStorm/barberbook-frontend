//uso de clsx para poder usar manejo de clases dinamicas en tailwind
import clsx from "clsx";

type Props = {
  action: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary"; // crear / cancelar
};

export const FormActionButton: React.FC<Props> = ({
  action,
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
}) => {
  //propiedades base que todos los botones deben poseer en comun
  const baseClasses =
    "w-full inline-flex justify-center rounded-md shadow-sm px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50";

  //colores disponibles para el boton
  const variants = {
    primary:
      "principal-button text-white border border-transparent focus:ring-blue-500",
    secondary:
      "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 focus:ring-indigo-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(baseClasses, variants[variant])}
    >
      {action}
    </button>
  );
};
