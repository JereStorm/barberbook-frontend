import { UserRole } from "../../types";

const DEFAULT_COUNTRY_CODE = "+54"; // cambia si lo necesitás

// Normalización muy simple: quita todo excepto + y dígitos, convierte 00... -> +..., si no empieza con + antepone DEFAULT_COUNTRY_CODE.
// Devuelve undefined si está vacío; devuelve undefined también si la cantidad de dígitos no está en rango razonable (8-15).
export const normalizeMobileVerySimple = (
  value?: string
): string | undefined => {
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
  console.log(digitsOnly);
  if (digitsOnly.length < 10 || digitsOnly.length > 15) return undefined;

  return cleaned;
};

export const getRoleDisplayName = (role: UserRole) => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return "Super Admin";
    case UserRole.ADMIN:
      return "Administrador";
    case UserRole.RECEPCIONISTA:
      return "Recepcionista";
    case UserRole.ESTILISTA:
      return "Estilista";
    default:
      return role;
  }
};

export const getAvailableRoles = (currentUser: any): UserRole[] => {
  if (!currentUser) return [];

  switch (currentUser.role) {
    case UserRole.SUPER_ADMIN:
      return [UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.ESTILISTA];
    case UserRole.ADMIN:
      return [UserRole.RECEPCIONISTA, UserRole.ESTILISTA];
    case UserRole.RECEPCIONISTA:
      return [UserRole.ESTILISTA];
    default:
      return [];
  }
};
