import { Plus } from "lucide-react"

interface Props {
  openCreateModal: () => void;
}

export const CreateButton = ({ openCreateModal }: Props) => {
  const isMobile = window.innerWidth < 640;
  return (
    <button
      aria-label="Abrir formulario"
      title="Abrir formulario"
      onClick={openCreateModal}
      className="flex gap-2 items-center px-4 py-2 principal-button text-white rounded-lg"
    >
      <Plus className="w-4 h-4" />
      {isMobile ? "" : "Crear"}
    </button>
  )
}