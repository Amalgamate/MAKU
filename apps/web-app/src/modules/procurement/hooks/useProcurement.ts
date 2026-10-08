import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { procurementService } from '../services/procurement.service';
import type { CreateProcurementRequest, ProcurementStatus } from '@maku/shared-types';
import { toast } from '../../../shared/store/toast.store';

const keys = { all: ['procurement'] as const, list: (f: Record<string, unknown>) => ['procurement', 'list', f] as const, summary: ['procurement', 'summary'] as const };

export function useProcurementList(filters: Record<string, string | number | undefined> = {}) {
  return useQuery({ queryKey: keys.list(filters), queryFn: () => procurementService.list(filters), placeholderData: (p) => p });
}

export function useProcurementSummary() {
  return useQuery({ queryKey: keys.summary, queryFn: procurementService.getSummary, staleTime: 1000 * 60 * 5 });
}

export function useCreateProcurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProcurementRequest) => procurementService.create(data),
    onSuccess: (o) => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Requisition raised', `${o.poNumber} — ${o.title}`); },
    onError: () => toast.error('Failed to raise requisition'),
  });
}

export function useUpdateProcurementStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProcurementStatus }) => procurementService.updateStatus(id, status),
    onSuccess: (o) => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Status updated', `${o.poNumber} is now ${o.status}`); },
    onError: () => toast.error('Status update failed'),
  });
}

export function useAddQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quote }: { id: string; quote: { supplier: string; amount: number; notes?: string } }) => procurementService.addQuote(id, quote),
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Quote added'); },
    onError: () => toast.error('Failed to add quote'),
  });
}
