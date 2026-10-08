import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { membersService } from '../services/members.service';
import type { CreateMemberRequest, MemberListFilters } from '@maku/shared-types';
import { toast } from '../../../shared/store/toast.store';

export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (f: MemberListFilters) => [...memberKeys.lists(), f] as const,
  pending: () => [...memberKeys.all, 'pending'] as const,
  detail: (id: string) => [...memberKeys.all, 'detail', id] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────

export function useMemberList(filters: MemberListFilters) {
  return useQuery({
    queryKey: memberKeys.list(filters),
    queryFn: () => membersService.list(filters),
    placeholderData: (prev) => prev,
  });
}

// ─── Pending ──────────────────────────────────────────────────────────────────

export function usePendingMembers() {
  return useQuery({
    queryKey: memberKeys.pending(),
    queryFn: membersService.getPending,
  });
}

// ─── Single ───────────────────────────────────────────────────────────────────

export function useMember(id: string) {
  return useQuery({
    queryKey: memberKeys.detail(id),
    queryFn: () => membersService.getById(id),
    enabled: !!id,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMemberRequest) => membersService.create(data),
    onSuccess: (m) => {
      qc.invalidateQueries({ queryKey: memberKeys.lists() });
      qc.invalidateQueries({ queryKey: memberKeys.pending() });
      toast.success('Member registered', `${m.fullName} added — pending approval.`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error('Registration failed', msg ?? 'Could not register member.');
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateMember(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateMemberRequest>) => membersService.update(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(memberKeys.detail(id), updated);
      qc.invalidateQueries({ queryKey: memberKeys.lists() });
    },
  });
}

// ─── Approve ──────────────────────────────────────────────────────────────────

export function useApproveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => membersService.approve(id),
    onSuccess: (updated) => {
      qc.setQueryData(memberKeys.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: memberKeys.lists() });
      qc.invalidateQueries({ queryKey: memberKeys.pending() });
      toast.success('Member approved', `${updated.fullName} is now active — ${updated.memberNumber}.`);
    },
    onError: () => toast.error('Approval failed', 'Could not approve member.'),
  });
}

// ─── Reject ───────────────────────────────────────────────────────────────────

export function useRejectMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      membersService.reject(id, reason),
    onSuccess: (updated) => {
      qc.setQueryData(memberKeys.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: memberKeys.lists() });
      qc.invalidateQueries({ queryKey: memberKeys.pending() });
      toast.warning('Registration rejected', `${updated.fullName}'s registration has been rejected.`);
    },
    onError: () => toast.error('Rejection failed', 'Could not reject registration.'),
  });
}

// ─── Photo ────────────────────────────────────────────────────────────────────

export function useUploadPhoto(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => membersService.uploadPhoto(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.detail(id) });
    },
  });
}

// ─── CSV Import ───────────────────────────────────────────────────────────────

export function useImportMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => membersService.importCsv(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.lists() });
      qc.invalidateQueries({ queryKey: memberKeys.pending() });
    },
  });
}
