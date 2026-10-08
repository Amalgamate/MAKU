import { apiClient } from '../../../shared/services/api.client';
import type { Supplier, CreateSupplierRequest, ApiResponse } from '@maku/shared-types';
const BASE = '/suppliers';
export const suppliersService = {
  async list(search?: string, category?: string): Promise<Supplier[]> {
    const p = new URLSearchParams();
    if (search)   p.set('search', search);
    if (category) p.set('category', category);
    const res = await apiClient.get<{ data: Supplier[]; message: string }>(`${BASE}?${p}`);
    return res.data.data;
  },
  async create(data: CreateSupplierRequest): Promise<Supplier> {
    const res = await apiClient.post<ApiResponse<Supplier>>(BASE, data);
    return res.data.data;
  },
  async update(id: string, data: Partial<CreateSupplierRequest>): Promise<Supplier> {
    const res = await apiClient.patch<ApiResponse<Supplier>>(`${BASE}/${id}`, data);
    return res.data.data;
  },
  async deactivate(id: string): Promise<Supplier> {
    const res = await apiClient.delete<ApiResponse<Supplier>>(`${BASE}/${id}`);
    return res.data.data;
  },
};
