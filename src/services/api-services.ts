import { CreateServiceRequest, Service, UpdateServiceRequest } from '../types';
import { apiService } from './api';

// Usamos la instancia axios interna del apiService (propiedad privada -> access vía any)
const axiosInstance = (apiService as any).api as import('axios').AxiosInstance;

// Métodos para servicios
async function getServices(): Promise<Service[]> {
    const response = await axiosInstance.get<Service[]>('/services');
    return response.data;
}

async function createService(serviceData: CreateServiceRequest): Promise<Service> {
    const response = await axiosInstance.post<Service>('/services', serviceData);
    return response.data;
}

async function updateService(id: number, serviceData: UpdateServiceRequest): Promise<Service> {
    const response = await axiosInstance.patch<Service>(`/services/${id}`, serviceData);
    return response.data;
}

async function deleteService(id: number): Promise<void> {
    await axiosInstance.delete(`/services/${id}`);
}

export {
    getServices,
    createService,
    updateService,
    deleteService,
}