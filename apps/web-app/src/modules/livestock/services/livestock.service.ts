import { apiClient } from '../../../shared/services/api.client';
import type {
  LivestockTransaction, CreateLivestockTransactionRequest,
  LivestockSummary, ApiResponse, PaginatedResponse,
} from '@maku/shared-types';

const BASE = '/livestock';

export const livestockService = {
  async list(filters: Record<string, string | number | undefined> = {}): Promise<PaginatedResponse<LivestockTransaction>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, String(v)); });
    const res = await apiClient.get<{ data: PaginatedResponse<LivestockTransaction>; message: string }>(`${BASE}?${params}`);
    return res.data.data;
  },

  async create(data: CreateLivestockTransactionRequest): Promise<LivestockTransaction> {
    const res = await apiClient.post<ApiResponse<LivestockTransaction>>(BASE, data);
    return res.data.data;
  },

  async getSummary(from?: string, to?: string): Promise<LivestockSummary> {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to)   params.set('to', to);
    const res = await apiClient.get<{ data: LivestockSummary; message: string }>(`${BASE}/summary?${params}`);
    return res.data.data;
  },
};
