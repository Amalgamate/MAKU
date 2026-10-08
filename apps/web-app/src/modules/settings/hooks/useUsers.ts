import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersAdminService, type CreateUserPayload, type UpdateRoleStatusPayload } from '../services/users.service';
import { toast } from '../../../shared/store/toast.store';

const userKeys = {
  all: ['admin-users'] as const,
  list: (page: number) => [...userKeys.all, 'list', page] as const,
};

export function useUserList(page = 1) {
  return useQuery({
    queryKey: userKeys.list(page),
    queryFn: () => usersAdminService.list(page),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => usersAdminService.create(data),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User created', `${user.fullName} can now log in.`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error('Failed to create user', msg ?? 'Please try again.');
    },
  });
}

export function useUpdateUserRoleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleStatusPayload }) =>
      usersAdminService.updateRoleStatus(id, data),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User updated', `${user.fullName} — ${user.role}, ${user.status}.`);
    },
    onError: () => toast.error('Update failed', 'Could not update user.'),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersAdminService.deactivate(id),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.warning('User deactivated', `${user.fullName}'s account has been deactivated.`);
    },
    onError: () => toast.error('Deactivation failed', 'Could not deactivate user.'),
  });
}
