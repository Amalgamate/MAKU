import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffService, type StaffMember } from '../services/staff.service';
import { toast } from '../../../shared/store/toast.store';

const keys = { all: ['staff'] as const, list: (s?: string) => ['staff', 'list', s] as const };

export function useStaffList(search?: string) {
  return useQuery({ queryKey: keys.list(search), queryFn: () => staffService.list(search), staleTime: 1000 * 60 * 5 });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof staffService.create>[0]) => staffService.create(data),
    onSuccess: (s) => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Staff member added', `${s.fullName} — ${s.staffNumber}`); },
    onError: () => toast.error('Failed to add staff member'),
  });
}

export function useUpdateStaff(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StaffMember>) => staffService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Staff updated'); },
    onError: () => toast.error('Update failed'),
  });
}
