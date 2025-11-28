import { normalize } from "../components/Utils";
import { Appointment } from "../types";
import { useSearchFilter } from "./useSearchFilters";

export function useAppointmentSearch(
    appointments: Appointment[],
    searchTerm: string,
    extraFilters: ((a: Appointment) => boolean)[] = []
) {
    const normalizedTerm = normalize(searchTerm);

    return useSearchFilter(
        appointments,
        searchTerm,
        [
            (a) => a.client.name,
            (a) => a.client.email,
            (a) => a.employee?.name ?? "",

            // 🔥 Campo adicional: nombres de servicios concatenados
            (a) => a.services?.map((s) => s.name).join(" ") ?? "",
        ],
        extraFilters
    );
}
