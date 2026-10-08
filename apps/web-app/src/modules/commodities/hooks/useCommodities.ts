import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commoditiesService, type CommodityTransaction } from '../services/commodities.service';
import { toast } from '../../../shared/store/toast.store';

const keys = {
  all: ['commodities'] as const,
  list: (f: Record<string, string | undefined>) => ['commodities', 'list', f] as const,
  summary: ['commodities', 'summary'] as const,
};

export function useCommodityList(filters: Record<string, string | undefined> = {}) {
  return useQuery({ queryKey: keys.list(filters), queryFn: () => commoditiesService.list(filters), placeholderData: (p) => p });
}

export function useCommoditySummary() {
  return useQuery({ queryKey: keys.summary, queryFn: commoditiesService.getSummary, staleTime: 1000 * 60 * 5 });
}

export function useCreateCommodityTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof commoditiesService.create>[0]) => commoditiesService.create(data),
    onSuccess: (tx) => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast.success(`${tx.action} recorded`, `${tx.quantity} ${tx.unit} of ${tx.commodityType}`);
    },
    onError: () => toast.error('Failed to record transaction'),
  });
}
