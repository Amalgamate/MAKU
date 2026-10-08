import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ngosService, type NgoRecord } from '../services/ngos.service';
import { toast } from '../../../shared/store/toast.store';

const keys = { all: ['ngos'] as const };

export function useNgoList(search?: string) {
  return useQuery({ queryKey: [...keys.all, search], queryFn: () => ngosService.list(search), staleTime: 1000 * 60 * 5 });
}

export function useCreateNgo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof ngosService.create>[0]) => ngosService.create(data),
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast.success('Partner registered', n.name);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error('Failed to register partner', msg ?? 'Please check the details and try again.');
    },
  });
}
