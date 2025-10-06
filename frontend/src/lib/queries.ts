import { useQuery } from '@tanstack/react-query'
import * as api from './api'

// Query keys
export const queryKeys = {
  promocodes: {
    all: ['promocodes'] as const,
    list: (params?: api.PromocodesParams) => [...queryKeys.promocodes.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.promocodes.all, 'detail', id] as const,
    related: (id: number, storeSlug?: string, categorySlug?: string, limit?: number) =>
      [...queryKeys.promocodes.all, 'related', id, storeSlug, categorySlug, limit] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
    detail: (slug: string) => [...queryKeys.categories.all, 'detail', slug] as const,
  },
  stores: {
    all: ['stores'] as const,
    list: (params?: api.StoreFilters) => [...queryKeys.stores.all, 'list', params] as const,
    detail: (slug: string) => [...queryKeys.stores.all, 'detail', slug] as const,
    popular: () => [...queryKeys.stores.all, 'popular'] as const,
  },
  showcases: {
    all: ['showcases'] as const,
    list: () => [...queryKeys.showcases.all, 'list'] as const,
    detail: (slug: string) => [...queryKeys.showcases.all, 'detail', slug] as const,
  },
  banners: {
    all: ['banners'] as const,
    list: () => [...queryKeys.banners.all, 'list'] as const,
  },
  siteAssets: {
    all: ['siteAssets'] as const,
    get: () => [...queryKeys.siteAssets.all, 'get'] as const,
  },
}

// Promocodes
export function usePromocodes(params?: api.PromocodesParams) {
  return useQuery({
    queryKey: queryKeys.promocodes.list(params),
    queryFn: () => api.getPromocodes(params),
  })
}

export function usePromocode(id: number) {
  return useQuery({
    queryKey: queryKeys.promocodes.detail(id),
    queryFn: () => api.getPromocodeById(String(id)),
  })
}

export function useRelatedPromocodes(
  id: number,
  storeSlug?: string,
  categorySlug?: string,
  limit?: number
) {
  return useQuery({
    queryKey: queryKeys.promocodes.related(id, storeSlug, categorySlug, limit),
    queryFn: () => api.getRelatedPromocodes(id, storeSlug, categorySlug, limit),
    enabled: !!id,
  })
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => api.getCategories(),
  })
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug),
    queryFn: () => api.getCategory(slug),
    enabled: !!slug,
  })
}

// Stores
export function useStores(params?: api.StoreFilters) {
  return useQuery({
    queryKey: queryKeys.stores.list(params),
    queryFn: () => api.getStores(params),
  })
}

export function useStore(slug: string) {
  return useQuery({
    queryKey: queryKeys.stores.detail(slug),
    queryFn: () => api.getStore(slug),
    enabled: !!slug,
  })
}

export function usePopularStores() {
  return useQuery({
    queryKey: queryKeys.stores.popular(),
    queryFn: () => api.getStores({ page_size: 20 }), // Popular stores - берем первые 20
  })
}

// Showcases
export function useShowcases() {
  return useQuery({
    queryKey: queryKeys.showcases.list(),
    queryFn: () => api.getShowcases(),
  })
}

export function useShowcase(slug: string) {
  return useQuery({
    queryKey: queryKeys.showcases.detail(slug),
    queryFn: () => api.getShowcaseBySlug(slug),
    enabled: !!slug,
  })
}

// Banners
export function useBanners() {
  return useQuery({
    queryKey: queryKeys.banners.list(),
    queryFn: () => api.getBanners(),
  })
}

// Site Assets
export function useSiteAssets() {
  return useQuery({
    queryKey: queryKeys.siteAssets.get(),
    queryFn: () => api.getSiteAssets(),
  })
}
