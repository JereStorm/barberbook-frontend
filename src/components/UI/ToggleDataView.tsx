import { IdCard, Table } from "lucide-react"

interface Props {
    setViewMode: (s: "table" | "cards") => void;
    viewMode: "table" | "cards";
}

export const ToggleDataView = ({setViewMode, viewMode}: Props) => {
    const toggleView = (mode: "table" | "cards") => {
    setViewMode(mode);
  };

    return (
<div className="md:flex hidden">
            {/* Botón vista Cards */}
            <button
              onClick={() => toggleView("cards")}
              className={`px-3 py-1 rounded-md border 
      ${
        viewMode === "cards"
          ? "bg-secundario text-white"
          : "bg-white text-gray-600"
      }
    `}
            >
              <IdCard/>
            </button>

            {/* Botón vista Tabla */}
            <button
              onClick={() => toggleView("table")}
              className={`px-3 py-1 rounded-md border 
      ${
        viewMode === "table"
          ? "bg-secundario text-white"
          : "bg-white text-gray-600"
      }
    `}
            >
              <Table/>
            </button>
          </div>
    )
} 

