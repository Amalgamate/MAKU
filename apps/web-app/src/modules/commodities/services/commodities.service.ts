import { apiClient } from '../../../shared/services/api.client';
import type { ApiResponse, PaginatedResponse } from '@maku/shared-types';

export type CommodityType = 'honey' | 'dairy' | 'hides' | 'poultry' | 'bones' | 'conservation';
export type CommodityAction = 'collection' | 'sale' | 'processing';

export interface CommodityTransaction {
  id: string; commodityType: CommodityType; action: CommodityAction;
  transactionDate: string; memberId: string | null; cigId: string | null;
  quantity: number; unit: string; qualityGrade: string | null;
  unitPrice: number; totalAmount: number; buyerName: string | null;
  paymentMethod: string | null; notes: string | null; createdAt: string;
}

export interface CommoditySummaryItem { commodityType: string; collections: number; sales: number; totalQuantity: number; totalValue: number; }

export const commoditiesService = {
  async list(filters: Record<string, string | undefined> = {}): Promise<PaginatedResponse<CommodityTransaction>> {
    const p = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== '') as [string, string][]));
    const res = await apiClient.get<{ data: PaginatedResponse<CommodityTransaction>; message: string }>(`/commodities?${p}`);
    return res.data.data;
  },
  async create(data: Omit<CommodityTransaction, 'id' | 'createdAt'> & { unitPrice?: number }): Promise<CommodityTransaction> {
    const res = await apiClient.post<ApiResponse<CommodityTransaction>>('/commodities', data);
    return res.data.data;
  },
  async getSummary(): Promise<CommoditySummaryItem[]> {
    const res = await apiClient.get<{ data: CommoditySummaryItem[]; message: string }>('/commodities/summary');
    return res.data.data;
  },
};
