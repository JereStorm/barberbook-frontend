const DEFAULT_COUNTRY_CODE = "+54"; // cambia si lo necesitás

// Normalización muy simple: quita todo excepto + y dígitos, convierte 00... -> +..., si no empieza con + antepone DEFAULT_COUNTRY_CODE.
// Devuelve undefined si está vacío; devuelve undefined también si la cantidad de dígitos no está en rango razonable (8-15).
export const normalizeMobileVerySimple = (value?: string): string | undefined => {
    if (!value) return undefined;
    const v = value.trim();
    if (!v) return undefined;

    let cleaned = v.replace(/[^+\d]/g, ""); // queda + y dígitos
    cleaned = cleaned.replace(/^00/, "+"); // 00 -> +
    if (!cleaned.startsWith("+")) {
        // quitar ceros iniciales locales
        const digits = cleaned.replace(/^0+/, "");
        cleaned = `${DEFAULT_COUNTRY_CODE}${digits}`;
    }

    const digitsOnly = cleaned.replace(/\D/g, "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) return undefined;

    return cleaned;
};