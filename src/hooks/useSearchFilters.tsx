import { useMemo } from "react";
import { normalize } from "../components/Utils";

type FieldSelector<T> = (item: T) => any;
type ExtraFilter<T> = (item: T) => boolean;

/**
 * Hook reutilizable para filtrar datos usando:
 * - término de búsqueda (texto)
 * - múltiples campos (selectores)
 * - filtros adicionales opcionales (como roles, estados, etc.)
 */
export function useSearchFilter<T>(
    data: T[],
    searchTerm: string,
    fields: FieldSelector<T>[],
    extraFilters: ExtraFilter<T>[] = []      // <-- nuevo
) {
    const term = normalize(searchTerm);

    const filteredData = useMemo(() => {
        return data.filter(item => {

            // 1) Validar filtros extra (como roles)
            const passesExtraFilters = extraFilters.every(filterFn => filterFn(item));
            if (!passesExtraFilters) return false;

            // 2) Si no hay search → devolver igual (pero ya pasó extraFilters)
            if (!term) return true;

            // 3) Validar coincidencias por texto
            return fields.some(selector =>
                normalize(selector(item)).includes(term)
            );
        });
    }, [data, term, fields, extraFilters]);

    return filteredData;
}
