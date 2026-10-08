import { apiClient } from '../../../shared/services/api.client';
import type { UserProfile, ApiResponse } from '@maku/shared-types';
import { UserRole, UserStatus } from '@maku/shared-types';

export interface CreateUserPayload {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
}

export interface UpdateRoleStatusPayload {
  role?: UserRole;
  status?: UserStatus;
}

export interface UsersListResponse {
  data: UserProfile[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
}

export const usersAdminService = {
  async list(page = 1, perPage = 50): Promise<UsersListResponse> {
    const res = await apiClient.get<{ data: UsersListResponse; message: string }>(
      `/users?page=${page}&perPage=${perPage}`,
    );
    return res.data.data;
  },

  async create(data: CreateUserPayload): Promise<UserProfile> {
    const res = await apiClient.post<ApiResponse<UserProfile>>('/users', data);
    return res.data.data;
  },

  async updateRoleStatus(id: string, data: UpdateRoleStatusPayload): Promise<UserProfile> {
    const res = await apiClient.patch<ApiResponse<UserProfile>>(
      `/users/${id}/role-status`,
      data,
    );
    return res.data.data;
  },

  async deactivate(id: string): Promise<UserProfile> {
    const res = await apiClient.delete<ApiResponse<UserProfile>>(`/users/${id}`);
    return res.data.data;
  },
};
