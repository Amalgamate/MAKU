import { apiClient } from '../../../shared/services/api.client';
import type { ApiResponse } from '@maku/shared-types';

export interface NgoRecord {
  id: string; name: string; country: string | null; contactName: string | null;
  contactEmail: string | null; contactPhone: string | null; focusAreas: string | null;
  partnershipStart: string | null; mouSigned: boolean; mouExpiry: string | null;
  isActive: boolean; notes: string | null; createdAt: string;
}

export const ngosService = {
  async list(search?: string): Promise<NgoRecord[]> {
    const p = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await apiClient.get<{ data: NgoRecord[]; message: string }>(`/ngos${p}`);
    return res.data.data;
  },
  async create(data: Partial<NgoRecord> & { name: string }): Promise<NgoRecord> {
    const res = await apiClient.post<ApiResponse<NgoRecord>>('/ngos', data);
    return res.data.data;
  },
  async update(id: string, data: Partial<NgoRecord>): Promise<NgoRecord> {
    const res = await apiClient.patch<ApiResponse<NgoRecord>>(`/ngos/${id}`, data);
    return res.data.data;
  },
};
