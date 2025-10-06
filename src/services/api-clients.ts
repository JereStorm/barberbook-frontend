import { apiService } from './api';
import { Client, CreateClientRequest, UpdateClientRequest } from '../types';

// Usamos la instancia axios interna del apiService (propiedad privada -> access vía any)
const axiosInstance = (apiService as any).api as import('axios').AxiosInstance;

// Métodos para clientes
async function getClients(): Promise<Client[]> {
    const response = await axiosInstance.get<Client[]>('/clients');
    return response.data;
}

async function getClient(id: number): Promise<Client> {
    const response = await axiosInstance.get<Client>(`/clients/${id}`);
    return response.data;
}

async function createClient(clientData: CreateClientRequest): Promise<Client> {
    const response = await axiosInstance.post<Client>('/clients', clientData);
    return response.data;
}

async function updateClient(id: number, clientData: UpdateClientRequest): Promise<Client> {
    const response = await axiosInstance.patch<Client>(`/clients/${id}`, clientData);
    return response.data;
}

async function deleteClient(id: number): Promise<void> {
    await axiosInstance.delete(`/clients/${id}`);
}

// Adjuntamos los métodos al apiService para compatibilidad con llamadas como apiService.getClients()
(apiService as any).getClients = getClients;
(apiService as any).getClient = getClient;
(apiService as any).createClient = createClient;
(apiService as any).updateClient = updateClient;
(apiService as any).deleteClient = deleteClient;

export {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
};