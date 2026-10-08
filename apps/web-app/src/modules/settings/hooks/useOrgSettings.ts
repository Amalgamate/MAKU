import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api.client';
import { toast } from '../../../shared/store/toast.store';

export interface OrgSettings {
  orgName: string;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
}

export function useOrgSettings() {
  return useQuery({
    queryKey: ['org-settings'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: OrgSettings; message: string }>('/settings/org');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateOrgSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<OrgSettings>) => apiClient.patch('/settings/org', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-settings'] });
      toast.success('Settings saved');
    },
    onError: () => toast.error('Failed to save settings'),
  });
}
