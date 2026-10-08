import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { livestockService } from '../services/livestock.service';
import type { CreateLivestockTransactionRequest } from '@maku/shared-types';
import { toast } from '../../../shared/store/toast.store';

const keys = {
  all:     ['livestock'] as const,
  list:    (f: Record<string, unknown>) => ['livestock', 'list', f] as const,
  summary: (from?: string, to?: string) => ['livestock', 'summary', from, to] as const,
};

export function useLivestockList(filters: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: keys.list(filters),
    queryFn:  () => livestockService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useLivestockSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: keys.summary(from, to),
    queryFn:  () => livestockService.getSummary(from, to),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateLivestockTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLivestockTransactionRequest) => livestockService.create(data),
    onSuccess: (tx) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(
        'Transaction recorded',
        `${tx.quantity} ${tx.species}(s) sold to ${tx.buyerName} — KES ${Number(tx.totalAmount).toLocaleString()}`,
      );
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error('Failed to record transaction', msg ?? 'Please try again.');
    },
  });
}
