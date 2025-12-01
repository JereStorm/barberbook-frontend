import { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from '../types';
import { apiService } from './api';

// Usamos la instancia axios interna del apiService (propiedad privada -> access vía any)
const axiosInstance = (apiService as any).api as import('axios').AxiosInstance;
const BASE = "/appointments";

// Métodos para turnos
async function getAppointments(): Promise<Appointment[]> {
    const response = await axiosInstance.get<Appointment[]>(BASE);
    return response.data;
}

async function getAppointmentsToday(): Promise<Appointment[]> {
    const response = await axiosInstance.get<Appointment[]>(`${BASE}/today?cant=5`);
    return response.data;
}

async function deleteAppointment(appointmentId: number): Promise<void> {
    await axiosInstance.delete(`${BASE}/${appointmentId}`);
}

async function cancelAppointment(appointmentId: number): Promise<void> {
    await axiosInstance.patch(`${BASE}/cancel/${appointmentId}`);
}

async function createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    const response = await axiosInstance.post<Appointment>(BASE, appointmentData);
    return response.data;
}

async function editAppointment(appointmentId: number, appointmentData: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await axiosInstance.patch<Appointment>(`${BASE}/${appointmentId}`, appointmentData);
    return response.data;
}

export {
    getAppointments,
    getAppointmentsToday,
    createAppointment,
    editAppointment,
    deleteAppointment,
    cancelAppointment,
};