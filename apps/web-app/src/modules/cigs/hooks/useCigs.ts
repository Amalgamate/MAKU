import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cigsService } from '../services/cigs.service';
import type { CreateCigRequest, CreateMeetingRequest } from '@maku/shared-types';
import { toast } from '../../../shared/store/toast.store';

export const cigKeys = {
  all: ['cigs'] as const,
  list: (search?: string) => [...cigKeys.all, 'list', search ?? ''] as const,
  detail: (id: string) => [...cigKeys.all, 'detail', id] as const,
  meetings: (id: string) => [...cigKeys.all, 'meetings', id] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────
export function useCigList(search?: string) {
  return useQuery({
    queryKey: cigKeys.list(search),
    queryFn: () => cigsService.list(search),
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Single ───────────────────────────────────────────────────────────────────
export function useCig(id: string) {
  return useQuery({
    queryKey: cigKeys.detail(id),
    queryFn: () => cigsService.getById(id),
    enabled: !!id,
  });
}

// ─── Meetings ─────────────────────────────────────────────────────────────────
export function useCigMeetings(cigId: string) {
  return useQuery({
    queryKey: cigKeys.meetings(cigId),
    queryFn: () => cigsService.getMeetings(cigId),
    enabled: !!cigId,
  });
}

// ─── Create CIG ───────────────────────────────────────────────────────────────
export function useCreateCig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCigRequest) => cigsService.create(data),
    onSuccess: (cig) => {
      qc.invalidateQueries({ queryKey: cigKeys.all });
      toast.success('CIG created', `"${cig.name}" has been registered.`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error('Failed to create CIG', msg ?? 'Please try again.');
    },
  });
}

// ─── Update CIG ───────────────────────────────────────────────────────────────
export function useUpdateCig(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateCigRequest>) => cigsService.update(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(cigKeys.detail(id), (old: ReturnType<typeof cigsService.getById> | undefined) =>
        old ? { ...old, ...updated } : updated,
      );
      qc.invalidateQueries({ queryKey: cigKeys.list() });
      toast.success('CIG updated', 'Changes saved successfully.');
    },
    onError: () => toast.error('Update failed', 'Could not save CIG changes.'),
  });
}

// ─── Delete CIG ───────────────────────────────────────────────────────────────
export function useDeleteCig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cigsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: cigKeys.all }),
  });
}

// ─── Membership ───────────────────────────────────────────────────────────────
export function useAddMember(cigId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => cigsService.addMember(cigId, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: cigKeys.detail(cigId) }),
  });
}

export function useRemoveMember(cigId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => cigsService.removeMember(cigId, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: cigKeys.detail(cigId) }),
  });
}

// ─── Meetings CRUD ────────────────────────────────────────────────────────────
export function useCreateMeeting(cigId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMeetingRequest) => cigsService.createMeeting(cigId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: cigKeys.meetings(cigId) }),
  });
}

export function useUpdateMeeting(cigId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: Partial<CreateMeetingRequest> }) =>
      cigsService.updateMeeting(cigId, meetingId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: cigKeys.meetings(cigId) }),
  });
}

export function useDeleteMeeting(cigId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (meetingId: string) => cigsService.deleteMeeting(cigId, meetingId),
    onSuccess: () => qc.invalidateQueries({ queryKey: cigKeys.meetings(cigId) }),
  });
}

// ─── Documents ────────────────────────────────────────────────────────────────

export const cigDocKeys = {
  docs: (cigId: string) => [...cigKeys.all, 'docs', cigId] as const,
};

export function useCigDocuments(cigId: string) {
  return useQuery({
    queryKey: cigDocKeys.docs(cigId),
    queryFn: () => cigsService.getDocuments(cigId),
    enabled: !!cigId,
  });
}

export function useUploadCigDocument(cigId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      meta,
    }: {
      file: File;
      meta: { name: string; category?: string; year?: number; description?: string };
    }) => cigsService.uploadDocument(cigId, file, meta),
    onSuccess: () => qc.invalidateQueries({ queryKey: cigDocKeys.docs(cigId) }),
  });
}

export function useDeleteCigDocument(cigId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => cigsService.deleteDocument(cigId, docId),
    onSuccess: () => qc.invalidateQueries({ queryKey: cigDocKeys.docs(cigId) }),
  });
}
