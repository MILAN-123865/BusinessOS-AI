import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfileApi, ProfileUpdatePayload } from '../api/profile'
import { useAuthStore } from '../store/authStore'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.updateUser)

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => updateProfileApi(payload),
    onSuccess: (data) => {
      updateUser(data)
      queryClient.setQueryData(['currentUser'], data)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}
