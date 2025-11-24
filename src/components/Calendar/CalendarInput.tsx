import React, { useEffect, useMemo, useRef, useState } from "react";

interface CalendarInputProps {
  initialValue?: string; // ISO string, p.ej. "2025-11-25T14:00:00.000Z"
  minDate?: string; // yyyy-MM-dd
  onChange?: (iso: string) => void; // opcional actualización en vivo
  onApply: (iso: string) => void; // aplicar selección desde dentro del calendario
  onCancel?: () => void; // cancelar selección
  className?: string;
}

const parseISOToLocal = (iso?: string) => {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
};

const combineLocalDateTimeToISO = (date: string, time: string) => {
  if (!date || !time) return "";
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return dt.toISOString();
};

const formatShortPreview = (iso?: string) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `Dia ${dd}/${mm} del ${yyyy} a las: ${hh}:${min}hs`;
  } catch {
    return iso;
  }
};

export const CalendarInput: React.FC<CalendarInputProps> = ({
  initialValue,
  minDate,
  onChange,
  onApply,
  onCancel,
  className,
}) => {
  const initial = useMemo(() => parseISOToLocal(initialValue), [initialValue]);
  const [date, setDate] = useState<string>(
    initial.date ||
      (() => {
        const t = new Date();
        return t.toISOString().slice(0, 10);
      })()
  );

  // --- Styled time picker with separate hour/minute columns ---
  const startHour = 8;
  const endHour = 22; 
  const minuteStep = 5; // minutos de precisión (puedes cambiar)
  const hours = useMemo(
    () =>
      Array.from({ length: endHour - startHour }, (_, i) =>
        String(startHour + i).padStart(2, "0")
      ),
    []
  );
  const minutes = useMemo(
    () =>
      Array.from({ length: 60 / minuteStep }, (_, i) =>
        String(i * minuteStep).padStart(2, "0")
      ),
    []
  );

  // month state for the visual calendar
  const [viewYear, setViewYear] = useState<number>(() =>
    new Date(date).getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(() =>
    new Date(date).getMonth()
  );

  const getNextTimeForDate = (dateStr: string): string => {
    const now = new Date();

    const [y, m, d] = dateStr.split("-").map(Number);
    const selectedDate = new Date(y, m - 1, d);

    const isToday =
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();

    // Si NO es hoy → primer horario del día
    if (!isToday) {
      return `0${startHour}:00`; // puedes cambiar a "08:05" si deseas respetar el step
    }

    // Si sí es hoy → siguiente múltiplo de 5
    const minutes = now.getMinutes();
    const next5 = Math.ceil(minutes / 5) * 5;

    if (next5 >= 60) {
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
    } else {
      now.setMinutes(next5);
    }

    
    return now.toTimeString().slice(0, 5);
  };

  //calculate initial time
  const [time, setTime] = useState<string>(
    initial.time || getNextTimeForDate(date)
  );

  useEffect(() => {
    // keep calendar view in sync with selected date
    const [yStr, mStr] = date.split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    setViewYear(y);
    setViewMonth(m - 1);
  }, [date]);

  useEffect(() => {
    const iso = combineLocalDateTimeToISO(date, time);
    if (onChange) onChange(iso);
  }, [date, time]);

  const handleApply = () => {
    const iso = combineLocalDateTimeToISO(date, time);
    onApply(iso);
  };

  const handleCancel = () => {
    // reset to initialValue or today+next hour
    if (initialValue) {
      const parsed = parseISOToLocal(initialValue);
      setDate(parsed.date || date);
      setTime(parsed.time || time);
    }
    if (onCancel) onCancel();
  };

  // calendar helpers
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0..6 (Sun..Sat)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const dayClick = (day: number) => {
    const y = viewYear;
    const m = viewMonth + 1;
    const dd = String(day).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const newDate = `${y}-${mm}-${dd}`;

    setDate(newDate);
    setTime(getNextTimeForDate(newDate)); 
  };

  const isSelectable = (y: number, m: number, d: number) => {
    if (!minDate) return true;
    const candidate = `${y}-${String(m + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    //TODO: Asegurarse que el minDate sea local al navegador del usuario
    return candidate >= minDate;
  };

  const selectedDateObj = (() => {
    try {
      if (!date) return null;
      const [yStr, mStr, dStr] = date.split("-");
      const y = Number(yStr);
      const m = Number(mStr);
      const d = Number(dStr);
      // Create a local date (avoid Date("YYYY-MM-DD") which is parsed as UTC)
      return new Date(y, m - 1, d);
    } catch {
      return null;
    }
  })();

  

  const [timeOpen, setTimeOpen] = useState(false);
  const timeRef = useRef<HTMLDivElement | null>(null);
  const hourScrollRef = useRef<HTMLDivElement | null>(null);
  const minuteScrollRef = useRef<HTMLDivElement | null>(null);

  // local selections inside dropdown (don't commit until confirm)
  const [selHour, setSelHour] = useState<string>(() => time.split(":")[0]);
  const [selMinute, setSelMinute] = useState<string>(() => time.split(":")[1]);
  // require user to explicitly pick both parts in the current dropdown session
  const [hasPickedHour, setHasPickedHour] = useState(false);
  const [hasPickedMinute, setHasPickedMinute] = useState(false);

  // sync selHour/selMinute when time changes externally
  useEffect(() => {
    const [hh = "00", mm = "00"] = time.split(":");
    setSelHour(hh);
    setSelMinute(mm);
  }, [time]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) {
        setTimeOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const openTimeDropdown = () => {
    // initialize selections from current time
    const [hh = "00", mm = "00"] = time.split(":");
    setSelHour(hh);
    setSelMinute(mm);
    // reset picked flags so confirmation only happens after user picks both in this session
    setHasPickedHour(false);
    setHasPickedMinute(false);
    setTimeOpen(true);
  };

  // helper: check if selected calendar date is today (local)
  const isSelectedDateToday = (() => {
    try {
      if (!date) return false;
      const [y, m, d] = date.split("-").map(Number);
      const now = new Date();
      return (
        y === now.getFullYear() &&
        m === now.getMonth() + 1 &&
        d === now.getDate()
      );
    } catch {
      return false;
    }
  })();

  const isTimeBeforeNow = (hourStr: string, minuteStr: string) => {
    if (!date) return false;
    const [y, m, d] = date.split("-").map(Number);
    const hh = Number(hourStr);
    const mm = Number(minuteStr);
    const candidate = new Date(y, m - 1, d, hh, mm, 0, 0);
    return candidate.getTime() < Date.now();
  };

  const isMinuteDisabled = (hourStr: string, minuteStr: string) => {
    // If selected date is today, disable minutes before now
    if (!isSelectedDateToday) return false;
    return isTimeBeforeNow(hourStr, minuteStr);
  };

  const isHourDisabled = (hourStr: string) => {
    // hour disabled only if ALL minute options for that hour are before now
    if (!isSelectedDateToday) return false;
    return minutes.every((mm) => isTimeBeforeNow(hourStr, mm));
  };

  //efecto scroll to selected hour/minute when opening
  useEffect(() => {
    if (!timeOpen) return;

    // Primero MINUTOS (si seleccionó minuto)
    if (minuteScrollRef.current) {
      const minItem = minuteScrollRef.current.querySelector(
        `li[data-minute="${selMinute}"]`
      );
      if (minItem) {
        minItem.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }

    // Luego HORAS
    if (hourScrollRef.current) {
      const hourItem = hourScrollRef.current.querySelector(
        `li[data-hour="${selHour}"]`
      );

      if (hourItem) {
        hourItem.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [timeOpen, selHour, selMinute]);

  return (
    <div className={className ?? "w-full"}>
      <div className="bg-white border rounded-lg shadow-sm overflow-visible">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha y hora
              </label>
              <div className="text-xs text-gray-500">
                Seleccioná día y ajusta la hora
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Mes anterior"
              >
                ‹
              </button>
              <div className="text-sm font-medium">
                {new Date(viewYear, viewMonth).toLocaleString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Mes siguiente"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500 mb-2">
            {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const y = viewYear;
              const m = viewMonth;
              const selectable = isSelectable(y, m, day);
              const isSelected =
                selectedDateObj &&
                selectedDateObj.getFullYear() === y &&
                selectedDateObj.getMonth() === m &&
                selectedDateObj.getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={!selectable}
                  onClick={() => dayClick(day)}
                  className={`py-2 text-sm rounded-full w-full flex items-center justify-center
                    ${
                      !selectable
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }
                    ${
                      isSelected
                        ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md transform scale-105"
                        : ""
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <label className="block text-xs text-gray-600 mb-1">Hora</label>

              <div className="relative" ref={timeRef}>
                <button
                  type="button"
                  onClick={() =>
                    timeOpen ? setTimeOpen(false) : openTimeDropdown()
                  }
                  className="w-full text-left px-3 py-2 border border-gray-200 rounded flex items-center justify-between bg-white hover:shadow-sm"
                  aria-haspopup="dialog"
                  aria-expanded={timeOpen}
                >
                  <span className="font-medium">{time}</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transform ${
                      timeOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {timeOpen && (
                  <div className="absolute left-0 z-50 mt-2 w-[100%] bg-white border border-gray-200 rounded shadow-lg p-0 overflow-hidden">
                    <div className="p-3 grid grid-cols-2 gap-3">
                      {/* Hours column */}
                      <div className="col-span-1 flex flex-col">
                        <div className="sticky top-0 bg-white z-20 pb-2 border-b border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">
                            Horas
                          </div>
                        </div>
                        <div
                          ref={hourScrollRef}
                          className="overflow-auto max-h-56 pt-2"
                        >
                          <ul className="space-y-1 px-1">
                            {hours.map((h) => {
                              const active = h === selHour;
                              const disabledHour = isHourDisabled(h);
                              return (
                                <li
                                  key={h}
                                  data-hour={h}
                                  onClick={() => {
                                    if (disabledHour) return;

                                    const newHour = h;
                                    setSelHour(newHour);
                                    setHasPickedHour(true);
                                    // confirmar solo si el usuario ya pickeó minutos en esta sesión
                                    // y el minuto seleccionado no está deshabilitado para la nueva hora
                                    if (
                                      hasPickedMinute &&
                                      !isMinuteDisabled(newHour, selMinute)
                                    ) {
                                      setTime(`${newHour}:${selMinute}`);
                                      setTimeOpen(false);
                                    }
                                  }}
                                  className={`px-3 py-2 rounded text-sm ${
                                    disabledHour
                                      ? "text-gray-300 cursor-not-allowed opacity-60"
                                      : active
                                      ? "bg-blue-600 text-white cursor-pointer font-semibold"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  {h}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>

                      {/* Minutes column */}
                      <div className="col-span-1 flex flex-col border-l border-r border-gray-50">
                        <div className="sticky top-0 bg-white z-20 pb-2 border-b border-gray-100 pl-2">
                          <div className="text-xs text-gray-500 mb-1">
                            Minutos
                          </div>
                        </div>
                        <div
                          ref={minuteScrollRef}
                          className="overflow-auto max-h-56 pt-2"
                        >
                          <ul className="space-y-1 px-1">
                            {minutes.map((mm) => {
                              const active = mm === selMinute;
                              const disabledMinute = isMinuteDisabled(
                                selHour,
                                mm
                              );
                              return (
                                <li
                                  key={mm}
                                  data-minute={mm}
                                  onClick={() => {
                                    if (disabledMinute) return;
                                    const newMinute = mm;
                                    setSelMinute(newMinute);
                                    setHasPickedMinute(true);
                                    // confirmar solo si el usuario ya pickeó hora en esta sesión
                                    if (hasPickedHour) {
                                      setTime(`${selHour}:${newMinute}`);
                                      setTimeOpen(false);
                                    }
                                  }}
                                  className={`px-3 py-2 rounded text-sm ${
                                    disabledMinute
                                      ? "text-gray-300 cursor-not-allowed opacity-60"
                                      : active
                                      ? "bg-blue-600 text-white cursor-pointer font-semibold"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  {mm}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-600 mt-2 mb-1">
              Datos de Seleccion Actual
            </div>
            <div className="mt-1 text-sm font-medium">
              {formatShortPreview(combineLocalDateTimeToISO(date, time))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1 bg-white border rounded text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarInput;
