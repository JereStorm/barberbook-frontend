import { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from '../types';
import { apiService } from './api';

// Usamos la instancia axios interna del apiService (propiedad privada -> access vía any)
const axiosInstance = (apiService as any).api as import('axios').AxiosInstance;

// Métodos para turnos
async function getAppointments(): Promise<Appointment[]> {
    const response = await axiosInstance.get<Appointment[]>('/appointments');
    console.log('desde api', response.data);
    return response.data;
}

async function deleteAppointment(appointmentId: number): Promise<void> {
    await axiosInstance.delete(`/appointments/${appointmentId}`);
}

async function cancelAppointment(appointmentId: number): Promise<void> {
    await axiosInstance.patch(`/appointments/cancel/${appointmentId}`);
}

async function createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    const response = await axiosInstance.post<Appointment>('/appointments', appointmentData);
    return response.data;
}

async function editAppointment(appointmentId: number, appointmentData: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await axiosInstance.patch<Appointment>(`/appointments/${appointmentId}`, appointmentData);
    return response.data;
}

export {
    getAppointments,
    createAppointment,
    editAppointment,
    deleteAppointment,
    cancelAppointment,
};