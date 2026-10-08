import { apiClient } from '../../../shared/services/api.client';
import type { ProcurementOrder, CreateProcurementRequest, ProcurementStatus, ApiResponse, PaginatedResponse } from '@maku/shared-types';
const BASE = '/procurement';
export const procurementService = {
  async list(filters: Record<string, string | number | undefined> = {}): Promise<PaginatedResponse<ProcurementOrder>> {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') p.set(k, String(v)); });
    const res = await apiClient.get<{ data: PaginatedResponse<ProcurementOrder>; message: string }>(`${BASE}?${p}`);
    return res.data.data;
  },
  async create(data: CreateProcurementRequest): Promise<ProcurementOrder> {
    const res = await apiClient.post<ApiResponse<ProcurementOrder>>(BASE, data);
    return res.data.data;
  },
  async getSummary(): Promise<{ byStatus: Array<{ status: string; count: number; budget: number }>; totalOrders: number; totalBudget: number }> {
    const res = await apiClient.get<{ data: { byStatus: Array<{ status: string; count: number; budget: number }>; totalOrders: number; totalBudget: number }; message: string }>(`${BASE}/summary`);
    return res.data.data;
  },
  async updateStatus(id: string, status: ProcurementStatus): Promise<ProcurementOrder> {
    const res = await apiClient.patch<ApiResponse<ProcurementOrder>>(`${BASE}/${id}/status`, { status });
    return res.data.data;
  },
  async addQuote(id: string, quote: { supplier: string; amount: number; notes?: string }): Promise<ProcurementOrder> {
    const res = await apiClient.post<ApiResponse<ProcurementOrder>>(`${BASE}/${id}/quotes`, quote);
    return res.data.data;
  },
};
