import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProjectsApi,
  getProjectApi,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  getProjectMembersApi,
  addProjectMemberApi,
  removeProjectMemberApi,
  getProjectMilestonesApi,
  createProjectMilestoneApi,
  updateProjectMilestoneApi,
  deleteProjectMilestoneApi,
} from '../api/project'
import { Project, ProjectMember, ProjectMilestone } from '../types/project'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: getProjectsApi,
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectApi(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<Project>) => createProjectApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Project> }) =>
      updateProjectApi(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProjectApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Members
export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => getProjectMembersApi(projectId),
    enabled: !!projectId,
  })
}

export function useAddProjectMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: { user_id: string; role?: string } }) =>
      addProjectMemberApi(projectId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectMembers', variables.projectId] })
    },
  })
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) =>
      removeProjectMemberApi(projectId, memberId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectMembers', variables.projectId] })
    },
  })
}

// Milestones
export function useProjectMilestones(projectId: string) {
  return useQuery({
    queryKey: ['projectMilestones', projectId],
    queryFn: () => getProjectMilestonesApi(projectId),
    enabled: !!projectId,
  })
}

export function useCreateProjectMilestone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: Partial<ProjectMilestone> }) =>
      createProjectMilestoneApi(projectId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', variables.projectId] })
    },
  })
}

export function useUpdateProjectMilestone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      milestoneId,
      payload,
    }: {
      projectId: string;
      milestoneId: string;
      payload: Partial<ProjectMilestone>;
    }) => updateProjectMilestoneApi(projectId, milestoneId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', variables.projectId] })
    },
  })
}

export function useDeleteProjectMilestone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, milestoneId }: { projectId: string; milestoneId: string }) =>
      deleteProjectMilestoneApi(projectId, milestoneId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', variables.projectId] })
    },
  })
}
