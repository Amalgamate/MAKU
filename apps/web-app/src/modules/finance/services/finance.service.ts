import { apiClient } from '../../../shared/services/api.client';
import type {
  FinanceTransaction, CreateFinanceTransactionRequest,
  PettyCashEntry, CreatePettyCashRequest,
  LedgerSummary, ApiResponse, PaginatedResponse,
} from '@maku/shared-types';

const BASE = '/finance';

export const financeService = {
  // ── Transactions ──────────────────────────────────────────────────────────
  async listTransactions(
    filters: Record<string, string | number | undefined> = {},
  ): Promise<PaginatedResponse<FinanceTransaction>> {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') p.set(k, String(v)); });
    const res = await apiClient.get<{ data: PaginatedResponse<FinanceTransaction>; message: string }>(
      `${BASE}/transactions?${p}`,
    );
    return res.data.data;
  },

  async createTransaction(data: CreateFinanceTransactionRequest): Promise<FinanceTransaction> {
    const res = await apiClient.post<ApiResponse<FinanceTransaction>>(`${BASE}/transactions`, data);
    return res.data.data;
  },

  async getLedgerSummary(from?: string, to?: string): Promise<LedgerSummary> {
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to)   p.set('to', to);
    const res = await apiClient.get<{ data: LedgerSummary; message: string }>(
      `${BASE}/transactions/summary?${p}`,
    );
    return res.data.data;
  },

  // ── Petty Cash ────────────────────────────────────────────────────────────
  async listPettyCash(page = 1, perPage = 25): Promise<PaginatedResponse<PettyCashEntry>> {
    const res = await apiClient.get<{ data: PaginatedResponse<PettyCashEntry>; message: string }>(
      `${BASE}/petty-cash?page=${page}&perPage=${perPage}`,
    );
    return res.data.data;
  },

  async createPettyCash(data: CreatePettyCashRequest): Promise<PettyCashEntry> {
    const res = await apiClient.post<ApiResponse<PettyCashEntry>>(`${BASE}/petty-cash`, data);
    return res.data.data;
  },

  async getPettyCashBalance(): Promise<number> {
    const res = await apiClient.get<{ data: { balance: number }; message: string }>(
      `${BASE}/petty-cash/balance`,
    );
    return res.data.data.balance;
  },
};
