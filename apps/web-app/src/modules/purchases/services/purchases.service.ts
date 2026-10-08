import { apiClient } from '../../../shared/services/api.client';
import type { PurchaseTransaction, CreatePurchaseRequest, ApiResponse, PaginatedResponse } from '@maku/shared-types';
const BASE = '/purchases';
export const purchasesService = {
  async list(filters: Record<string, string | number | undefined> = {}): Promise<PaginatedResponse<PurchaseTransaction>> {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') p.set(k, String(v)); });
    const res = await apiClient.get<{ data: PaginatedResponse<PurchaseTransaction>; message: string }>(`${BASE}?${p}`);
    return res.data.data;
  },
  async create(data: CreatePurchaseRequest): Promise<PurchaseTransaction> {
    const res = await apiClient.post<ApiResponse<PurchaseTransaction>>(BASE, data);
    return res.data.data;
  },
  async getSummary(): Promise<{ purchases: { count: number; total: number }; sales: { count: number; total: number } }> {
    const res = await apiClient.get<{ data: { purchases: { count: number; total: number }; sales: { count: number; total: number } }; message: string }>(`${BASE}/summary`);
    return res.data.data;
  },
  async recordPayment(id: string, amount: number): Promise<PurchaseTransaction> {
    const res = await apiClient.post<ApiResponse<PurchaseTransaction>>(`${BASE}/${id}/payment`, { amount });
    return res.data.data;
  },
};
