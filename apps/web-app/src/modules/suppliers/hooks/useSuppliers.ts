import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { suppliersService } from '../services/suppliers.service';
import type { CreateSupplierRequest } from '@maku/shared-types';
import { toast } from '../../../shared/store/toast.store';

const keys = { all: ['suppliers'] as const, list: (s?: string, c?: string) => ['suppliers', 'list', s, c] as const };

export function useSupplierList(search?: string, category?: string) {
  return useQuery({ queryKey: keys.list(search, category), queryFn: () => suppliersService.list(search, category), staleTime: 1000 * 60 * 5 });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierRequest) => suppliersService.create(data),
    onSuccess: (s) => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Supplier registered', s.name); },
    onError: () => toast.error('Failed to register supplier'),
  });
}

export function useUpdateSupplier(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateSupplierRequest>) => suppliersService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Supplier updated'); },
    onError: () => toast.error('Update failed'),
  });
}
