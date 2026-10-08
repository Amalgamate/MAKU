import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { waterVouchersService } from '../services/water-vouchers.service';
import type { CreateWaterVoucherRequest } from '@maku/shared-types';
import { toast } from '../../../shared/store/toast.store';

const keys = {
  all:     ['water-vouchers'] as const,
  list:    (f: Record<string, unknown>) => ['water-vouchers', 'list', f] as const,
  summary: (from?: string, to?: string) => ['water-vouchers', 'summary', from, to] as const,
};

export function useWaterVoucherList(filters: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: keys.list(filters),
    queryFn:  () => waterVouchersService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useWaterVoucherSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: keys.summary(from, to),
    queryFn:  () => waterVouchersService.getSummary(from, to),
    staleTime: 1000 * 60 * 5,
  });
}

export function useIssueVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWaterVoucherRequest) => waterVouchersService.create(data),
    onSuccess: (v) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Voucher issued', `${v.voucherNumber} — ${v.litresAllocated.toLocaleString()} L for member`);
    },
    onError: () => toast.error('Failed to issue voucher', 'Please check the details and try again.'),
  });
}

export function useMarkVoucherUsed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, litresUsed }: { id: string; litresUsed: number }) =>
      waterVouchersService.markUsed(id, litresUsed),
    onSuccess: (v) => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast.success('Voucher marked used', `${v.voucherNumber} — ${v.litresUsed.toLocaleString()} L used`);
    },
    onError: () => toast.error('Update failed'),
  });
}
