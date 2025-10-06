import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      gcTime: 1000 * 60 * 30, // 30 минут (было cacheTime в v4)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
