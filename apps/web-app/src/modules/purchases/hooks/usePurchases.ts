import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { purchasesService } from '../services/purchases.service';
import type { CreatePurchaseRequest } from '@maku/shared-types';
import { toast } from '../../../shared/store/toast.store';

const keys = { all: ['purchases'] as const, list: (f: Record<string, unknown>) => ['purchases', 'list', f] as const, summary: ['purchases', 'summary'] as const };

export function usePurchaseList(filters: Record<string, string | number | undefined> = {}) {
  return useQuery({ queryKey: keys.list(filters), queryFn: () => purchasesService.list(filters), placeholderData: (p) => p });
}

export function usePurchaseSummary() {
  return useQuery({ queryKey: keys.summary, queryFn: purchasesService.getSummary, staleTime: 1000 * 60 * 5 });
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePurchaseRequest) => purchasesService.create(data),
    onSuccess: (tx) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`${tx.type === 'purchase' ? 'Purchase' : 'Sale'} recorded`, `${tx.referenceNumber} — KES ${tx.totalAmount.toLocaleString()}`);
    },
    onError: (e: unknown) => { const m = (e as { response?: { data?: { message?: string } } })?.response?.data?.message; toast.error('Failed to record', m); },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => purchasesService.recordPayment(id, amount),
    onSuccess: (tx) => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Payment recorded', `${tx.referenceNumber} — paid KES ${tx.amountPaid.toLocaleString()}`); },
    onError: () => toast.error('Payment failed'),
  });
}
