import { apiClient } from '../../../shared/services/api.client';
import type { ApiResponse } from '@maku/shared-types';

export type GrantStatus = 'prospecting' | 'applied' | 'awarded' | 'active' | 'completed' | 'rejected';
export interface GrantRecord {
  id: string; title: string; donorName: string; ngoId: string | null; status: GrantStatus;
  amountRequested: number; amountAwarded: number; amountDisbursed: number;
  deadline: string | null; awardDate: string | null; endDate: string | null;
  focusArea: string | null; reportingSchedule: string | null; nextReportDue: string | null;
  description: string | null; notes: string | null; createdAt: string;
}
export const grantsService = {
  async list(status?: string): Promise<GrantRecord[]> {
    const p = status ? `?status=${status}` : '';
    const res = await apiClient.get<{ data: GrantRecord[]; message: string }>(`/grants${p}`);
    return res.data.data;
  },
  async create(data: Partial<GrantRecord> & { title: string; donorName: string }): Promise<GrantRecord> {
    const res = await apiClient.post<ApiResponse<GrantRecord>>('/grants', data);
    return res.data.data;
  },
  async update(id: string, data: Partial<GrantRecord>): Promise<GrantRecord> {
    const res = await apiClient.patch<ApiResponse<GrantRecord>>(`/grants/${id}`, data);
    return res.data.data;
  },
  async getPipeline(): Promise<{ byStatus: Array<{ status: string; count: number; requested: number; awarded: number }>; totalPipeline: number }> {
    const res = await apiClient.get<{ data: { byStatus: Array<{ status: string; count: number; requested: number; awarded: number }>; totalPipeline: number }; message: string }>('/grants/pipeline');
    return res.data.data;
  },
};
