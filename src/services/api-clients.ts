import { apiService } from './api';
import { Client, CreateClientRequest, UpdateClientRequest } from '../types';

// Usamos la instancia axios interna del apiService (propiedad privada -> access vía any)
const axiosInstance = (apiService as any).api as import('axios').AxiosInstance;
const BASE = "/clients";

// Métodos para clientes
async function getClients(): Promise<Client[]> {
    const response = await axiosInstance.get<Client[]>(BASE);
    return response.data;
}

async function getClient(id: number): Promise<Client> {
    const response = await axiosInstance.get<Client>(`${BASE}/${id}`);
    return response.data;
}

async function createClient(clientData: CreateClientRequest): Promise<Client> {
    const response = await axiosInstance.post<Client>(BASE, clientData);
    return response.data;
}

async function updateClient(id: number, clientData: UpdateClientRequest): Promise<Client> {
    const response = await axiosInstance.patch<Client>(`${BASE}/${id}`, clientData);
    return response.data;
}

async function deleteClient(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE}/${id}`);
}

export {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
};