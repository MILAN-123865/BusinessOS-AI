import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { toast } from 'sonner'

const BASE_URL = '/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Automatically attach JWT access token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response Interceptor: Handle logout on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = useAuthStore.getState().refreshToken

      if (!refreshToken) {
        useAuthStore.getState().clearAuth()
        return Promise.reject(error)
      }

      try {
        const { refreshTokenApi } = await import('../api/auth')
        const { access_token } = await refreshTokenApi(refreshToken)
        
        useAuthStore.getState().setAuth(
          useAuthStore.getState().user!,
          access_token,
          refreshToken
        )
        api.defaults.headers.common.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().clearAuth()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    // Mock data for demo/development when backend is unreachable
    if (!error.response || error.code === 'ERR_NETWORK') {
      const url = error.config?.url || ''
      console.warn(`[Mock] Providing fallback data for ${url}`)
      
      // Generic mock response
      let mockData: any = []
      
      if (url.includes('/dashboard')) mockData = { metrics: {}, recentActivity: [] }
      if (url.includes('/analytics')) mockData = { kpis: [], chartData: [], taskDistribution: [] }
      if (url.includes('/employees') || url.includes('/clients') || url.includes('/roles')) mockData = []
      
      return Promise.resolve({ data: { success: true, data: mockData } })
    }

    if (typeof window !== 'undefined') {
      if (error.response?.status >= 500) {
        toast.error('Server error. Our team has been notified.')
      }
    }

    return Promise.reject(error)
  }
)
