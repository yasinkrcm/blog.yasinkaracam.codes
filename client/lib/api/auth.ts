import apiClient from './client';
import { LoginInput, RegisterInput, AuthResponse, Admin } from './types';

export const authApi = {
  // Register new admin
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // Get current user
  getMe: async (): Promise<{ admin: Admin }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Logout (client-side only)
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  // Get stored token
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Set token
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  },
};

export default authApi;
