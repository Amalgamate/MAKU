import { apiClient } from '../../../shared/services/api.client';
import type { LoginRequest, LoginResponse, UserProfile } from '@maku/shared-types';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<{ data: LoginResponse }>('/auth/login', data);
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refresh(): Promise<{ accessToken: string }> {
    const res = await apiClient.post<{ data: { accessToken: string } }>('/auth/refresh');
    return res.data.data;
  },

  async forgotPassword(payload: { email?: string; phone?: string }): Promise<{ resetToken: string; message: string }> {
    const res = await apiClient.post<{ data: { resetToken: string; message: string } }>(
      '/auth/forgot-password',
      payload,
    );
    return res.data.data;
  },

  async resetPassword(payload: {
    token: string;
    otp: string;
    newPassword: string;
  }): Promise<void> {
    await apiClient.post('/auth/reset-password', payload);
  },

  async me(): Promise<UserProfile> {
    const res = await apiClient.get<{ data: UserProfile }>('/auth/me');
    return res.data.data;
  },
};
