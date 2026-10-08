import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { grantsService, type GrantRecord } from '../services/grants.service';
import { toast } from '../../../shared/store/toast.store';

const keys = { all: ['grants'] as const };
export function useGrantList(status?: string) { return useQuery({ queryKey: [...keys.all, status], queryFn: () => grantsService.list(status) }); }
export function useGrantPipeline() { return useQuery({ queryKey: [...keys.all, 'pipeline'], queryFn: grantsService.getPipeline, staleTime: 1000 * 60 * 5 }); }
export function useCreateGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof grantsService.create>[0]) => grantsService.create(data),
    onSuccess: (g) => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Grant added', g.title); },
    onError: () => toast.error('Failed to add grant'),
  });
}
export function useUpdateGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GrantRecord> }) => grantsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Grant updated'); },
    onError: () => toast.error('Update failed'),
  });
}
