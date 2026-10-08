import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsService, type ProjectRecord } from '../services/projects.service';
import { toast } from '../../../shared/store/toast.store';

const keys = { all: ['projects'] as const };
export function useProjectList(status?: string) { return useQuery({ queryKey: [...keys.all, status], queryFn: () => projectsService.list(status) }); }
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof projectsService.create>[0]) => projectsService.create(data),
    onSuccess: (p) => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Project created', p.title); },
    onError: () => toast.error('Failed to create project'),
  });
}
export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectRecord> }) => projectsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Project updated'); },
    onError: () => toast.error('Update failed'),
  });
}
