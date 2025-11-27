import { useMemo } from "react";
import { normalize } from "../components/Utils";

type FieldSelector<T> = (item: T) => any;

/**
 * @param data Arreglo original de datos a filtrar.
 * @param searchTerm Cadena de búsqueda ingresada por el usuario.
 * @param fields Lista de selectores que indican qué campos se usarán para filtrar.
 *               Cada selector recibe un ítem de tipo T y devuelve el valor a comparar.
 *
 * @returns Un arreglo con los datos filtrados según el término de búsqueda.
 */
export function useSearchFilter<T>(
    data: T[],
    searchTerm: string,
    fields: FieldSelector<T>[]
) {
    // Normalizamos el término de búsqueda
    const term = normalize(searchTerm);

    const filteredData = useMemo(() => {
        // Si no hay búsqueda, devolver la lista completa
        if (!term) return data;

        // Filtrar usando los selectores provistos
        return data.filter((item) =>
            fields.some((selector) =>
                normalize(selector(item)).includes(term)
            )
        );
    }, [data, term, fields]);

    return filteredData;
}
