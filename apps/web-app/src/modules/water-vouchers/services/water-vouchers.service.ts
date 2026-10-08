import { apiClient } from '../../../shared/services/api.client';
import type {
  WaterVoucher, CreateWaterVoucherRequest,
  WaterVoucherSummary, ApiResponse, PaginatedResponse,
} from '@maku/shared-types';

const BASE = '/water-vouchers';

export const waterVouchersService = {
  async list(filters: Record<string, string | number | undefined> = {}): Promise<PaginatedResponse<WaterVoucher>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, String(v)); });
    const res = await apiClient.get<{ data: PaginatedResponse<WaterVoucher>; message: string }>(`${BASE}?${params}`);
    return res.data.data;
  },

  async create(data: CreateWaterVoucherRequest): Promise<WaterVoucher> {
    const res = await apiClient.post<ApiResponse<WaterVoucher>>(BASE, data);
    return res.data.data;
  },

  async markUsed(id: string, litresUsed: number): Promise<WaterVoucher> {
    const res = await apiClient.patch<ApiResponse<WaterVoucher>>(`${BASE}/${id}/use`, { litresUsed });
    return res.data.data;
  },

  async getSummary(from?: string, to?: string): Promise<WaterVoucherSummary> {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to)   params.set('to', to);
    const res = await apiClient.get<{ data: WaterVoucherSummary; message: string }>(`${BASE}/summary?${params}`);
    return res.data.data;
  },
};
