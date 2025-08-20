import { apiService } from './apiService';
import type { LoginRequest, AuthResponse, User } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    return response.data!;
  },

  async getProfile(): Promise<User> {
    const response = await apiService.get<{ success: boolean; data: User }>('/auth/profile');
    return response.data!.data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.put<{ success: boolean; data: User }>('/auth/profile', userData);
    return response.data!.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
