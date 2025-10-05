import axios, { AxiosInstance, AxiosError } from 'axios';
import { LoginRequest, AuthResponse, User, Salon, CreateUserRequest, UpdateUserRequest, CreateSalonRequest, UpdateSalonRequest, ApiError } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000', // Borrar luego de terminar con las pruebas
      timeout: 10000,
    });

    // Interceptor para agregar token automáticamente
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para manejar errores
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // === AUTENTICACIÓN ===
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async getProfile(): Promise<{ user: User }> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  // === USUARIOS ===
  async getUsers(): Promise<User[]> {
    const response = await this.api.get<User[]>('/users');
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response = await this.api.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.api.post<User>('/users', userData);
    return response.data;
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await this.api.patch<User>(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  // === SALONES ===
  async getSalons(): Promise<Salon[]> {
    const response = await this.api.get<Salon[]>('/salons');
    return response.data;
  }

  async getSalon(id: number): Promise<Salon> {
    const response = await this.api.get<Salon>(`/salons/${id}`);
    return response.data;
  }

  async getMySalon(): Promise<Salon | null> {
    const response = await this.api.get('/salons/my-salon');
    return response.data; // Puede ser null si no tiene salón
  }

  async createSalon(salonData: CreateSalonRequest): Promise<{ message: string; salon: Salon }> {
    const response = await this.api.post('/salons', salonData);
    return response.data;
  }

  async updateSalon(id: number, salonData: UpdateSalonRequest): Promise<{ message: string; salon: Salon }> {
    const response = await this.api.patch(`/salons/${id}`, salonData);
    return response.data;
  }

  async deleteSalon(id: number): Promise<void> {
    await this.api.delete(`/salons/${id}`);
  }

  // === MANEJO DE ERRORES ===
  handleError(error: any): ApiError {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'Error desconocido',
        statusCode: error.response.status,
        error: error.response.data.error,
      };
    }

    if (error.request) {
      return {
        message: 'Error de conexión con el servidor',
        statusCode: 0,
      };
    }

    return {
      message: error.message || 'Error desconocido',
    };
  }
}

export const apiService = new ApiService();