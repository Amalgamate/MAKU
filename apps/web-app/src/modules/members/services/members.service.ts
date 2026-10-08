import { apiClient } from '../../../shared/services/api.client';
import type {
  Member,
  CreateMemberRequest,
  MemberListFilters,
  PaginatedResponse,
  ApiResponse,
} from '@maku/shared-types';

const BASE = '/members';

export const membersService = {
  // ── List (paginated + filtered) ──────────────────────────────────────────
  async list(filters: MemberListFilters): Promise<PaginatedResponse<Member>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    });
    const res = await apiClient.get<{ data: PaginatedResponse<Member>; message: string }>(
      `${BASE}?${params.toString()}`,
    );
    // TransformInterceptor wraps in { data: <payload>, message }
    // Controller returns { data: Member[], meta: {...} } directly
    return res.data.data;
  },

  // ── Single member ────────────────────────────────────────────────────────
  async getById(id: string): Promise<Member> {
    const res = await apiClient.get<ApiResponse<Member>>(`${BASE}/${id}`);
    return res.data.data;
  },

  // ── Pending members ──────────────────────────────────────────────────────
  async getPending(): Promise<Member[]> {
    const res = await apiClient.get<{ data: Member[]; message: string }>(`${BASE}/pending`);
    return res.data.data;
  },

  // ── Create ───────────────────────────────────────────────────────────────
  async create(data: CreateMemberRequest): Promise<Member> {
    const res = await apiClient.post<ApiResponse<Member>>(BASE, data);
    return res.data.data;
  },

  // ── Update ───────────────────────────────────────────────────────────────
  async update(id: string, data: Partial<CreateMemberRequest>): Promise<Member> {
    const res = await apiClient.patch<ApiResponse<Member>>(`${BASE}/${id}`, data);
    return res.data.data;
  },

  // ── Approve ──────────────────────────────────────────────────────────────
  async approve(id: string): Promise<Member> {
    const res = await apiClient.post<ApiResponse<Member>>(`${BASE}/${id}/approve`);
    return res.data.data;
  },

  // ── Reject ───────────────────────────────────────────────────────────────
  async reject(id: string, reason: string): Promise<Member> {
    const res = await apiClient.post<ApiResponse<Member>>(`${BASE}/${id}/reject`, { reason });
    return res.data.data;
  },

  // ── Photo upload ─────────────────────────────────────────────────────────
  async uploadPhoto(id: string, file: File): Promise<{ photoUrl: string }> {
    const form = new FormData();
    form.append('photo', file);
    const res = await apiClient.post<ApiResponse<{ photoUrl: string }>>(
      `${BASE}/${id}/photo`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.data;
  },

  // ── CSV import ───────────────────────────────────────────────────────────
  async importCsv(file: File): Promise<{
    imported: number;
    skipped: number;
    errors: Array<{ row: number; reason: string }>;
  }> {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post<
      ApiResponse<{ imported: number; skipped: number; errors: Array<{ row: number; reason: string }> }>
    >(`${BASE}/import`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.data;
  },

  // ── CSV export (triggers browser download) ───────────────────────────────
  exportUrl(filters: MemberListFilters = {}): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    });
    const base = import.meta.env['VITE_API_URL'] ?? '/v1';
    return `${base}/members/export?${params.toString()}`;
  },

  // ── Deactivate ───────────────────────────────────────────────────────────
  async deactivate(id: string): Promise<Member> {
    const res = await apiClient.delete<ApiResponse<Member>>(`${BASE}/${id}`);
    return res.data.data;
  },
};
