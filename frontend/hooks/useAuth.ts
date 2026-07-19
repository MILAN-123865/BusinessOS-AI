import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { loginApi, getMeApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export function useLogin() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ username, password }: any) => loginApi(username, password),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token, data.refresh_token)
      queryClient.setQueryData(['currentUser'], data.user)
      router.replace('/dashboard')
    },
  })
}

export function useCurrentUser() {
  const { accessToken, isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getMeApi,
    enabled: !!accessToken && isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

export function useLogout() {
  const router = useRouter()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const queryClient = useQueryClient()

  return () => {
    clearAuth()
    queryClient.clear()
    router.replace('/login')
  }
}
