import { apiClient } from '../../../shared/services/api.client';
import type { ApiResponse } from '@maku/shared-types';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export interface ProjectRecord {
  id: string; title: string; description: string | null; status: ProjectStatus;
  grantId: string | null; ngoId: string | null; startDate: string | null; endDate: string | null;
  budget: number; spent: number; progressPct: number; leadStaffId: string | null;
  milestones: Array<{ title: string; dueDate: string; completed: boolean }>;
  notes: string | null; createdAt: string;
}
export const projectsService = {
  async list(status?: string): Promise<ProjectRecord[]> {
    const p = status ? `?status=${status}` : '';
    const res = await apiClient.get<{ data: ProjectRecord[]; message: string }>(`/projects${p}`);
    return res.data.data;
  },
  async create(data: Partial<ProjectRecord> & { title: string }): Promise<ProjectRecord> {
    const res = await apiClient.post<ApiResponse<ProjectRecord>>('/projects', data);
    return res.data.data;
  },
  async update(id: string, data: Partial<ProjectRecord>): Promise<ProjectRecord> {
    const res = await apiClient.patch<ApiResponse<ProjectRecord>>(`/projects/${id}`, data);
    return res.data.data;
  },
};
