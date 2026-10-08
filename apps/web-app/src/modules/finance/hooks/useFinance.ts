import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { CreateFinanceTransactionRequest, CreatePettyCashRequest } from '@maku/shared-types';
import { toast } from '../../../shared/store/toast.store';

const keys = {
  all:      ['finance'] as const,
  txList:   (f: Record<string, unknown>) => ['finance', 'transactions', f] as const,
  summary:  (from?: string, to?: string) => ['finance', 'summary', from, to] as const,
  pcList:   (page: number) => ['finance', 'petty-cash', page] as const,
  pcBalance: ['finance', 'petty-cash-balance'] as const,
};

export function useTransactionList(filters: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: keys.txList(filters),
    queryFn:  () => financeService.listTransactions(filters),
    placeholderData: (prev) => prev,
  });
}

export function useLedgerSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: keys.summary(from, to),
    queryFn:  () => financeService.getLedgerSummary(from, to),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFinanceTransactionRequest) => financeService.createTransaction(data),
    onSuccess: (tx) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(
        `${tx.type === 'income' ? 'Income' : 'Expense'} recorded`,
        `KES ${Number(tx.amount).toLocaleString()} — ${tx.description.slice(0, 60)}`,
      );
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error('Transaction failed', msg ?? 'Please try again.');
    },
  });
}

export function usePettyCashList(page = 1) {
  return useQuery({
    queryKey: keys.pcList(page),
    queryFn:  () => financeService.listPettyCash(page),
  });
}

export function usePettyCashBalance() {
  return useQuery({
    queryKey: keys.pcBalance,
    queryFn:  financeService.getPettyCashBalance,
    staleTime: 1000 * 30,
  });
}

export function useCreatePettyCash() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePettyCashRequest) => financeService.createPettyCash(data),
    onSuccess: (entry) => {
      qc.invalidateQueries({ queryKey: keys.all });
      const label = entry.action === 'top_up' ? 'Cash added' : entry.action === 'reconcile' ? 'Balance reconciled' : 'Expense recorded';
      toast.success(label, `Balance: KES ${Number(entry.balanceAfter).toLocaleString()}`);
    },
    onError: () => toast.error('Failed to record entry'),
  });
}
