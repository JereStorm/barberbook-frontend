import { Plus } from "lucide-react"

interface Props {
    openCreateModal: () => void;
}

export const CreateButton = ({openCreateModal}: Props) => {
    return (
        <button
          aria-label="Abrir formulario"
          title="Abrir formulario"
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 principal-button text-white rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear
        </button>
    )
}