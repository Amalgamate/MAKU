import { apiClient } from '../../../shared/services/api.client';
import type {
  Cig,
  CigDetail,
  CigMeeting,
  CigDocument,
  CreateCigRequest,
  CreateMeetingRequest,
  ApiResponse,
} from '@maku/shared-types';

const BASE = '/cigs';

export const cigsService = {
  async list(search?: string): Promise<Cig[]> {
    const url = search ? `${BASE}?search=${encodeURIComponent(search)}` : BASE;
    const res = await apiClient.get<{ data: Cig[]; message: string }>(url);
    return res.data.data;
  },

  async getById(id: string): Promise<CigDetail> {
    const res = await apiClient.get<ApiResponse<CigDetail>>(`${BASE}/${id}`);
    return res.data.data;
  },

  async create(data: CreateCigRequest): Promise<Cig> {
    const res = await apiClient.post<ApiResponse<Cig>>(BASE, data);
    return res.data.data;
  },

  async update(id: string, data: Partial<CreateCigRequest>): Promise<Cig> {
    const res = await apiClient.patch<ApiResponse<Cig>>(`${BASE}/${id}`, data);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
  },

  // ── Membership ────────────────────────────────────────────────────────────

  async addMember(cigId: string, memberId: string): Promise<Cig> {
    const res = await apiClient.post<ApiResponse<Cig>>(`${BASE}/${cigId}/members/${memberId}`);
    return res.data.data;
  },

  async removeMember(cigId: string, memberId: string): Promise<Cig> {
    const res = await apiClient.delete<ApiResponse<Cig>>(`${BASE}/${cigId}/members/${memberId}`);
    return res.data.data;
  },

  // ── Meetings ──────────────────────────────────────────────────────────────

  async getMeetings(cigId: string): Promise<CigMeeting[]> {
    const res = await apiClient.get<{ data: CigMeeting[]; message: string }>(
      `${BASE}/${cigId}/meetings`,
    );
    return res.data.data;
  },

  async createMeeting(cigId: string, data: CreateMeetingRequest): Promise<CigMeeting> {
    const res = await apiClient.post<ApiResponse<CigMeeting>>(
      `${BASE}/${cigId}/meetings`,
      data,
    );
    return res.data.data;
  },

  async updateMeeting(
    cigId: string,
    meetingId: string,
    data: Partial<CreateMeetingRequest>,
  ): Promise<CigMeeting> {
    const res = await apiClient.patch<ApiResponse<CigMeeting>>(
      `${BASE}/${cigId}/meetings/${meetingId}`,
      data,
    );
    return res.data.data;
  },

  async deleteMeeting(cigId: string, meetingId: string): Promise<void> {
    await apiClient.delete(`${BASE}/${cigId}/meetings/${meetingId}`);
  },

  // ── Documents ──────────────────────────────────────────────────────────────

  async getDocuments(cigId: string): Promise<CigDocument[]> {
    const res = await apiClient.get<{ data: CigDocument[]; message: string }>(
      `${BASE}/${cigId}/documents`,
    );
    return res.data.data;
  },

  async uploadDocument(
    cigId: string,
    file: File,
    meta: { name: string; category?: string; year?: number; description?: string },
  ): Promise<CigDocument> {
    const form = new FormData();
    form.append('file', file);
    form.append('name', meta.name);
    if (meta.category) form.append('category', meta.category);
    if (meta.year) form.append('year', String(meta.year));
    if (meta.description) form.append('description', meta.description);
    const res = await apiClient.post<ApiResponse<CigDocument>>(
      `${BASE}/${cigId}/documents`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.data;
  },

  async deleteDocument(cigId: string, docId: string): Promise<void> {
    await apiClient.delete(`${BASE}/${cigId}/documents/${docId}`);
  },
};
