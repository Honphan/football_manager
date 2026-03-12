import apiClient from './client';
import type { LoginResponse, User } from '../types/type';

export const authApi = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/user/login', { username, password });
        return response.data;
    },

    adminLogin: async (username: string, password: string): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/admin/login', { username, password });
        return response.data;
    },

    signup: async (username: string, password: string): Promise<User> => {
        const response = await apiClient.post<User>('/auth/user/register', { username, password });
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    refresh: async (): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/refresh-token');
        return response.data;
    }
};
