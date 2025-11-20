import { Appointment } from '../types';
import { apiService } from './api';

// Usamos la instancia axios interna del apiService (propiedad privada -> access vía any)
const axiosInstance = (apiService as any).api as import('axios').AxiosInstance;

// Métodos para turnos
async function getAppointments(): Promise<Appointment[]> {
    const response = await axiosInstance.get<Appointment[]>('/appointments');
    return response.data;
}

async function deleteAppointment(appointmentId: number): Promise<void> {
    await axiosInstance.delete(`/appointments/${appointmentId}`);
}


export {
    getAppointments,
    deleteAppointment,
};