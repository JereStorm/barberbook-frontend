import { Service } from '../types';
import { apiService } from './api';

// Usamos la instancia axios interna del apiService (propiedad privada -> access vía any)
const axiosInstance = (apiService as any).api as import('axios').AxiosInstance;

// Métodos para servicios
async function getServices(): Promise<Service[]> {
    const response = await axiosInstance.get<Service[]>('/services');
    return response.data;
}


export {
    getServices,
}