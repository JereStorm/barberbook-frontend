// Tipos globales para la aplicación

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  RECEPCIONISTA = 'recepcionista',
  ESTILISTA = 'estilista',
}

export interface User {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  salonId: number | null;
  isActive: boolean;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  salon?: {
    id: number;
    name: string;
  };
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Salon {
  id: number;
  name: string;
  address?: string;
  mobile?: string;
  createdAt: string;
  usersCount?: number;
  activeUsersCount?: number;
  users?: User[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    salonId: number | null;
    salon?: {
      id: number;
      name: string;
    };
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  mobile?: string;
  password: string;
  role: UserRole;
  salonId?: number | null;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  mobile?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateSalonRequest {
  name: string;
  address?: string;
  mobile?: string;
  admin: {
    name: string;
    email: string;
    mobile?: string;
    password: string;
  };
}

export interface UpdateSalonRequest {
  name?: string;
  address?: string;
  mobile?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

//CLIENTS (ajustado al DTO y tabla backend)
export interface Client {
  id: number;
  salonId: number;
  name: string;
  email?: string | null;
  mobile?: string | null;
  createdAt?: string; // ISO string desde backend
}

export interface CreateClientRequest {
  salonId: number; // requerido por CreateClientDto
  name: string;
  email?: string | null;
  mobile?: string | null;
}

export interface UpdateClientRequest {
  name?: string;
  email?: string | null;
  mobile?: string | null;
}

//SERVICES (ajustado al DTO y tabla backend)
export interface Service {
  id: number;
  salonId: number;
  name: string;
  durationMin: number;
  price: string;
  isActive: boolean;
}

export interface CreateServiceRequest {
  salonId: number;
  name: string;
  durationMin: number;
  price: string;
}

export interface UpdateServiceRequest {
  name?: string;
  price?: string | null;
  durationMin?: number | null;
  isActive?: boolean;
}

export enum AppointmentStatus {
  ACTIVO = 'activo',
  PENDIENTE = 'pendiente',
  CONFIRMADO = 'confirmado',
  CANCELADO = 'cancelado',
  COMPLETADO = 'completado',
}

export interface CreateAppointmentRequest {
  salonId: number;
  startTime: string;
  clientId: number;
  serviceIds: number[]; // <--- Ahora es un array
  status: AppointmentStatus;
  employeeId?: number | null;
  notes?: string | null;
  createdBy: number;
}

export interface Appointment {
  id: number;
  salonId: number;
  startTime: string;
  finishTime: string;
  duration: number;
  totalPrice?: number; // <--- Precio total 
  clientId: number;
  client: ClientAppointmentData;
  employeeId: number;
  employee?: EmployeeAppointmentData | null;
  status: string;
  notes: string;
  createdBy: number;
  services: ServiceAppointmentData[]; // <--- Ahora es un array
}

export interface ServiceAppointmentData {
  id: number
  name: string
  price: string
  salonId: number
  durationMin: number,
  isActive: boolean
}

export interface ClientAppointmentData {
  id: number
  name: string
  mobile: string
  email: string
  salonId: number
}

export interface EmployeeAppointmentData {
  id: number
  name: string
  email: string
  mobile?: string
  salonId: number
  isActive: boolean
}

export interface UpdateAppointmentRequest {
  salonId?: number;
  startTime?: string;
  finishTime?: string;
  duration?: number;
  clientId?: number;
  employeeId?: number;
  serviceIds?: number[]; // <--- Ahora es un array
  status?: AppointmentStatus;
  notes?: string | null;
  createdBy?: number;
}
