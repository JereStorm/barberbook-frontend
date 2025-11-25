import { CreateServiceRequest, Service, UpdateServiceRequest } from '../types';
import { apiService } from './api';

// Usamos la instancia axios interna del apiService (propiedad privada -> access vía any)
const axiosInstance = (apiService as any).api as import('axios').AxiosInstance;
const BASE = "/services";

// Métodos para servicios
async function getServices(): Promise<Service[]> {
    const response = await axiosInstance.get<Service[]>(BASE);
    return response.data;
}

async function createService(serviceData: CreateServiceRequest): Promise<Service> {
    const response = await axiosInstance.post<Service>(BASE, serviceData);
    return response.data;
}

async function updateService(id: number, serviceData: UpdateServiceRequest): Promise<Service> {
    const response = await axiosInstance.patch<Service>(`${BASE}/${id}`, serviceData);
    return response.data;
}

async function deleteService(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE}/${id}`);
}

export {
    getServices,
    createService,
    updateService,
    deleteService,
}