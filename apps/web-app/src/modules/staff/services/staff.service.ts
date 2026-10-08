import { apiClient } from '../../../shared/services/api.client';
import type { ApiResponse } from '@maku/shared-types';

export interface StaffMember {
  id: string; staffNumber: string | null; fullName: string; nationalId: string | null;
  role: string; department: string | null; phone: string | null; email: string | null;
  employmentType: string; status: string; hireDate: string; endDate: string | null;
  basicSalary: number; nhifNumber: string | null; nssfNumber: string | null;
  kraPin: string | null; bankName: string | null; bankAccount: string | null;
  mpesaNumber: string | null; notes: string | null; createdAt: string;
}

export const staffService = {
  async list(search?: string): Promise<StaffMember[]> {
    const p = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await apiClient.get<{ data: StaffMember[]; message: string }>(`/staff${p}`);
    return res.data.data;
  },
  async create(data: Partial<StaffMember> & { fullName: string; role: string; hireDate: string }): Promise<StaffMember> {
    const res = await apiClient.post<ApiResponse<StaffMember>>('/staff', data);
    return res.data.data;
  },
  async update(id: string, data: Partial<StaffMember>): Promise<StaffMember> {
    const res = await apiClient.patch<ApiResponse<StaffMember>>(`/staff/${id}`, data);
    return res.data.data;
  },
};
