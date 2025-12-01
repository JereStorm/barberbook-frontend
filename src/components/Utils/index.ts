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
  if (digitsOnly.length < 12 || digitsOnly.length > 15) return undefined;

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

export function normalize(value: any): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina tildes
    .trim();
}

export function formatDateTime(dt?: string) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export function formatHour(dt?: string) {
  if (!dt) return "-";

  const date = new Date(dt); // convierte el ISO a fecha en tu timezone
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export const formatPrice = (p: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(p ?? 0);


export const getRoleBadgeColor = (role: UserRole) => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return "bg-purple-100 text-purple-800";
    case UserRole.ADMIN:
      return "bg-blue-100 text-blue-800";
    case UserRole.RECEPCIONISTA:
      return "bg-green-100 text-green-800";
    case UserRole.ESTILISTA:
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};