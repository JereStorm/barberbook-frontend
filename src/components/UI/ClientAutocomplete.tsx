import React, { useEffect, useMemo, useState, useRef } from "react";
import { Appointment, Client } from "../../types";

interface Props {
  disabled: boolean;
  options: Client[];
  value: string;
  editingAppointment: Appointment | null;
  onChange: (v: string) => void;
  onSelect: (client: Client) => void;
  placeholder?: string;
  className?: string;
  minChars?: number;
}

const normalize = (s: string) => s?.toLowerCase().trim() ?? "";

const ClientAutocomplete: React.FC<Props> = ({
  disabled = false,
  options,
  editingAppointment,
  value,
  onChange,
  onSelect,
  placeholder = "Buscar cliente...",
  className = "",
  minChars = 1,
}) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  // filtered options based on value
  const filtered = useMemo(() => {
    const term = normalize(value);
    if (!term || term.length < minChars) return [];
    return options.filter((c) => {
      return (
        normalize(c.name ?? "").includes(term) ||
        normalize(c.mobile ?? "").includes(term) ||
        normalize(c.email ?? "").includes(term) ||
        String(c.id ?? "").includes(term)
      );
    });
  }, [options, value, minChars]);

  useEffect(() => {
    if (filtered.length > 0) {
      setOpen(true);
      if (editingAppointment) {
        onSelect(editingAppointment.client)
      }
    } else {
      setOpen(false);
    }
    setHighlight(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = filtered[highlight];
      if (sel) {
        onSelect(sel);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

return (
    <div className={`relative ${className}`} ref={ref}>
      <label className="block text-sm font-medium text-gray-700">Cliente</label>
      <input
        disabled={disabled}
        type="text"
        // un textbox normal no es compatible con aria-expanded, defini el rol combobox, y lo vinculo a la lista con un id
        role="combobox" 
        aria-controls="client-options-list"
        aria-expanded={open}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => filtered.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        aria-autocomplete="list"
      />

      {open && filtered.length > 0 && (
        <ul 
          id="client-options-list"
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-auto"
        >
          {filtered.map((c, idx) => (
            <li
              key={c.id}
              role="option"
              aria-selected={idx === highlight}
              onMouseEnter={() => setHighlight(idx)}
              onMouseDown={(e) => {
                // use onMouseDown to select before blur
                e.preventDefault();
                onSelect(c);
                setOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${idx === highlight ? "bg-gray-100" : ""
                }`}
            >
              <div className="text-sm font-medium text-gray-900">
                {c.name ?? "Sin nombre"}
              </div>
              <div className="text-xs text-gray-500">
                {c.mobile ?? ""} {c.email ? `• ${c.email}` : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientAutocomplete;
