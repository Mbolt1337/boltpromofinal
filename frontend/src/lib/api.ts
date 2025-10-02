const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

export interface Banner {
  id: number;
  title: string;
  description?: string;
  subtitle?: string; 
  image?: string;
  link?: string;
  cta_text?: string;
  is_active: boolean;
  order: number;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  url?: string;
  is_active?: boolean;
  rating?: number;
  promocodes_count?: number;
  categories?: Category[];
  total_views?: number;
  created_at?: string;
  updated_at?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  promocodes_count?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface Partner {
  id: number;
  name: string;
  logo?: string;
  url?: string;
  order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Showcase {
  id: number;
  slug: string;
  title: string;
  description?: string;
  banner: string;
  promos_count: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Promocode {
  id: number;
  title: string;
  description?: string;
  code?: string;
  discount_text?: string;
  discount_value?: number;
  is_hot?: boolean;
  has_promocode?: boolean;
  is_recommended?: boolean;
  views_count?: number;
  action_url?: string;
  offer_type?: 'coupon' | 'deal' | 'financial' | 'cashback';
  offer_type_display?: string;
  long_description?: string;
  steps?: string;
  fine_print?: string;
  disclaimer?: string;
  expires_at?: string;
  store?: Store;
  category?: Category;
  categories?: Category[];
  created_at?: string;
  updated_at?: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  is_published: boolean;
}

export interface PromocodesParams {
  search?: string;
  category?: string;
  store?: string;
  is_hot?: boolean;
  has_promocode?: boolean;
  is_recommended?: boolean;
  offer_type?: 'coupon' | 'deal' | 'financial' | 'cashback';
  ordering?: string;
  page?: number;
  limit?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface CacheOptions {
  revalidate?: number | false;
  cache?: RequestCache;
  tags?: string[];
}

export interface GlobalStats {
  total_stores: number;
  total_promocodes: number;
  total_categories: number;
  active_stores: number;
  active_promocodes: number;
  active_categories: number;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const requestCache = new Map<string, Promise<any>>();
const DEBOUNCE_TIME = 50;

// ✅ ИСПРАВЛЕНО: Проверка существования промиса в кэше
function debounceRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  const cachedPromise = requestCache.get(key);
  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = requestFn().finally(() => {
    setTimeout(() => {
      requestCache.delete(key);
    }, DEBOUNCE_TIME);
  });
  
  requestCache.set(key, promise);
  return promise;
}

function cleanParams(params: Record<string, any>): Record<string, string> {
  const cleaned: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (
      value === undefined || 
      value === null || 
      value === '' || 
      value === 'all' ||
      value === 'undefined' ||
      (typeof value === 'number' && isNaN(value))
    ) {
      continue;
    }
    
    if (key === 'page' || key === 'page_size' || key === 'limit') {
      const numValue = parseInt(String(value), 10);
      if (isNaN(numValue) || numValue < 1) {
        if (key === 'page_size' || key === 'limit') {
          cleaned[key] = '12';
        } else {
          cleaned[key] = '1';
        }
      } else {
        if (key === 'page_size' || key === 'limit') {
          cleaned[key] = String(Math.min(numValue, 100));
        } else {
          cleaned[key] = String(numValue);
        }
      }
      continue;
    }
    
    if (key === 'ordering') {
      const validOrdering = [
        '-created_at', 'created_at', 
        '-views_count', 'views_count', 
        '-id', 'id', 
        'title', '-title',
        '-updated_at', 'updated_at',
        '-is_hot', 'is_hot',
        '-is_recommended', 'is_recommended',
        'expires_at', '-expires_at',
        '-rating', 'rating',
        'name', '-name',
        '-promocodes_count', 'promocodes_count'
      ];
      if (validOrdering.includes(String(value))) {
        cleaned[key] = String(value);
      }
      continue;
    }
    
    if (key === 'offer_type') {
      const validTypes = ['coupon', 'deal', 'financial', 'cashback'];
      if (validTypes.includes(String(value))) {
        cleaned[key] = String(value);
      }
      continue;
    }
    
    const stringValue = String(value).trim();
    if (stringValue.length > 0) {
      cleaned[key] = stringValue;
    }
  }
  
  return cleaned;
}

async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {},
  params?: Record<string, any>,
  silent: boolean = false,
  cacheOptions: CacheOptions = {}
): Promise<T> {
  const cleanedParams = params ? cleanParams(params) : {};
  const searchParams = new URLSearchParams(cleanedParams);
  const queryString = searchParams.toString();
  
  const baseUrl = `${API_BASE_URL}/api/v1`;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}${queryString ? '?' + queryString : ''}`;
  
  if (process.env.NODE_ENV === 'development' && !silent) {
    console.log(`[API] ${options.method || 'GET'} ${fullUrl}`);
    if (cacheOptions.revalidate) {
      console.log(`[CACHE] revalidate: ${cacheOptions.revalidate}s`);
    } else if (cacheOptions.cache) {
      console.log(`[CACHE] strategy: ${cacheOptions.cache}`);
    }
  }
  
  try {
    const requestOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (typeof window === 'undefined') {
      if (cacheOptions.revalidate !== undefined) {
        requestOptions.next = { 
          revalidate: cacheOptions.revalidate,
          ...(cacheOptions.tags && { tags: cacheOptions.tags })
        };
      } else if (cacheOptions.cache) {
        requestOptions.cache = cacheOptions.cache;
      }
    }

    const response = await fetch(fullUrl, requestOptions);

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development' && !silent) {
        console.warn(`[API] Warning: ${response.status} for ${cleanEndpoint}`);
      }
      throw new ApiError(response.status, `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development' && !silent) {
      console.warn(`[API] Request failed for ${cleanEndpoint}:`, error);
    }
    throw error;
  }
}

function normalizePromocode(promo: any): Promocode {
  const actionUrl = promo.external_link || 
                   promo.affiliate_url || 
                   promo.partner_url || 
                   promo.cta_url || 
                   promo.action_url || 
                   promo.link || 
                   promo.url || 
                   undefined;

  return {
    id: promo.id || 0,
    title: promo.title || 'Без названия',
    description: promo.description || promo.subtitle || undefined,
    code: promo.code || undefined,
    discount_text: promo.discount_text || promo.discount_label || (promo.discount_value ? `${promo.discount_value}%` : undefined),
    is_hot: Boolean(promo.is_hot),
    has_promocode: Boolean(promo.has_promocode || (promo.code && promo.offer_type === 'coupon')),
    is_recommended: Boolean(promo.is_recommended),
    views_count: promo.views_count || promo.views || 0,
    action_url: actionUrl,
    offer_type: promo.offer_type || 'coupon',
    offer_type_display: promo.offer_type_display || 'Промокод',
    long_description: promo.long_description || undefined,
    steps: promo.steps || undefined,
    fine_print: promo.fine_print || undefined,
    disclaimer: promo.disclaimer || undefined,
    expires_at: promo.valid_until || promo.expires_at || undefined,
    store: promo.store ? {
      id: promo.store.id || 0,
      name: promo.store.name || 'Неизвестный магазин',
      slug: promo.store.slug || '',
      logo: promo.store.logo || undefined,
      url: promo.store.url || promo.store.site_url || undefined
    } : undefined,
    category: promo.category || (promo.categories && promo.categories.length > 0 ? promo.categories[0] : undefined),
    created_at: promo.created_at || promo.updated_at || undefined
  };
}

// Настройки кеширования
const FAST_CACHE: CacheOptions = { revalidate: 60 }; // 1 минута - для каталогов
const NORMAL_CACHE: CacheOptions = { revalidate: 300 }; // 5 минут - для виджетов
const SLOW_CACHE: CacheOptions = { revalidate: 1800 }; // 30 минут - для статистики
const STATIC_CACHE: CacheOptions = { revalidate: 3600 }; // 1 час - для статичных данных
const NO_CACHE: CacheOptions = { cache: 'no-store' }; // Для поиска и пагинации

// Активно используемые функции

export async function getGlobalStats(): Promise<GlobalStats> {
  return debounceRequest('global-stats', async () => {
    try {
      const response = await apiRequest<GlobalStats>(
        '/stats/global/', 
        {}, 
        {}, 
        true, 
        { ...SLOW_CACHE, tags: ['global-stats'] }
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[API] Global stats from endpoint:', response);
      }
      
      return response;
    } catch (error) {
      console.warn('[API] Global stats endpoint failed, using fallback');
      
      try {
        const [storesPromise, promocodesPromise, categoriesPromise] = await Promise.allSettled([
          apiRequest<PaginatedResponse<Store>>('/stores/', {}, { page_size: 1 }, true, SLOW_CACHE),
          apiRequest<PaginatedResponse<Promocode>>('/promocodes/', {}, { page_size: 1 }, true, SLOW_CACHE),
          apiRequest<PaginatedResponse<Category>>('/categories/', {}, { page_size: 1 }, true, SLOW_CACHE)
        ]);

        const storesCount = storesPromise.status === 'fulfilled' ? storesPromise.value.count : 0;
        const promocodesCount = promocodesPromise.status === 'fulfilled' ? promocodesPromise.value.count : 0;
        const categoriesCount = categoriesPromise.status === 'fulfilled' ? categoriesPromise.value.count : 0;

        return {
          total_stores: storesCount,
          total_promocodes: promocodesCount,
          total_categories: categoriesCount,
          active_stores: storesCount,
          active_promocodes: promocodesCount,
          active_categories: categoriesCount
        };
      } catch (fallbackError) {
        console.error('[API] Fallback stats failed:', fallbackError);
        return {
          total_stores: 0,
          total_promocodes: 0,
          total_categories: 0,
          active_stores: 0,
          active_promocodes: 0,
          active_categories: 0
        };
      }
    }
  });
}

export async function getBanners(): Promise<Banner[]> {
  return debounceRequest('banners', async () => {
    try {
      const response = await apiRequest<PaginatedResponse<Banner>>(
        '/banners/', 
        {}, 
        {}, 
        true, 
        { ...NORMAL_CACHE, tags: ['banners'] }
      );
      return response.results || [];
    } catch (error) {
      return [];
    }
  });
}

export async function getPartners(): Promise<Partner[]> {
  return debounceRequest('partners', async () => {
    try {
      const response = await apiRequest<PaginatedResponse<Partner>>(
        '/partners/', 
        {}, 
        {}, 
        true, 
        { ...STATIC_CACHE, tags: ['partners'] }
      );
      return response.results || [];
    } catch (error) {
      return [];
    }
  });
}

export async function getPromocodes(params?: PromocodesParams): Promise<{
  results: Promocode[];
  count: number;
  next?: string;
  previous?: string;
}> {
  const cacheKey = `promocodes-${JSON.stringify(params || {})}`;
  
  return debounceRequest(cacheKey, async () => {
    try {
      // Поиск и пагинация используют no-store
      const cacheStrategy = (params?.search || params?.page) 
        ? NO_CACHE 
        : { ...NORMAL_CACHE, tags: ['promocodes'] };

      const response = await apiRequest<PaginatedResponse<any>>(
        '/promocodes/', 
        {}, 
        params, 
        false, 
        cacheStrategy
      );
      
      const normalizedResults = (response.results || []).map(normalizePromocode);

      return {
        results: normalizedResults,
        count: response.count || 0,
        next: response.next,
        previous: response.previous
      };
    } catch (error) {
      return {
        results: [],
        count: 0
      };
    }
  });
}

export async function getStores(params?: { 
  page?: number; 
  search?: string; 
  sort?: string; 
  ordering?: string; 
  page_size?: number 
}): Promise<PaginatedResponse<Store>> {
  const cacheKey = `stores-${JSON.stringify(params || {})}`;
  
  return debounceRequest(cacheKey, async () => {
    try {
      const normalizedParams = { ...params };
      
      if (params?.sort && !params?.ordering) {
        const sortMapping: Record<string, string> = {
          'name-asc': 'name',
          'name-desc': '-name',
          'rating-desc': '-rating',
          'rating-asc': 'rating',
          'newest': '-created_at'
        };
        normalizedParams.ordering = sortMapping[params.sort] || 'name';
        delete normalizedParams.sort;
      }
      
      if (!normalizedParams.ordering) {
        normalizedParams.ordering = 'name';
      }

      // Каталог магазинов - 60 сек кеш, поиск/пагинация - no-store
      const cacheStrategy = (params?.search || params?.page) 
        ? NO_CACHE 
        : { ...FAST_CACHE, tags: ['stores'] };
      
      const response = await apiRequest<PaginatedResponse<Store>>(
        '/stores/',
        {},
        normalizedParams,
        false,
        cacheStrategy
      );
      
      return response;
      
    } catch (error) {
      console.error('[API] Ошибка загрузки магазинов:', error);
      
      return {
        count: 0,
        results: []
      };
    }
  });
}

export async function getCategories(): Promise<Category[]> {
  return debounceRequest('categories', async () => {
    try {
      const response = await apiRequest<PaginatedResponse<Category>>(
        '/categories/', 
        {}, 
        { page_size: 100 },
        true, 
        { ...NORMAL_CACHE, tags: ['categories'] }
      );
      return response.results || [];
    } catch (error) {
      return [];
    }
  });
}

// Потенциально неиспользуемые функции (могут использоваться в других страницах/компонентах)

export async function incrementPromoView(promoId: number): Promise<void> {
  try {
    await apiRequest(`/promocodes/${promoId}/increment-views/`, {
      method: 'POST'
    }, {}, true, { cache: 'no-store' });
  } catch (error) {
    // Тихо игнорируем ошибки счетчика
  }
}

export async function getStore(slug: string): Promise<Store | null> {
  const normalizedSlug = decodeURIComponent(slug).toLowerCase();
  
  return debounceRequest(`store-${normalizedSlug}`, async () => {
    try {
      const store = await apiRequest<Store>(
        `/stores/${normalizedSlug}/`,
        {},
        {},
        false,
        { ...NORMAL_CACHE, tags: ['stores', `store-${normalizedSlug}`] }
      );
      return store;
    } catch (error) {    
      console.error(`[API] Store not found: ${normalizedSlug}`);
      return null;
    }
  });
}

export async function getRelatedStores(slug: string, limit: number = 6): Promise<Store[]> {
  try {
    const response = await getStores({ page_size: limit + 10 });
    const filtered = response.results.filter(store => 
      store.slug !== slug && 
      store.is_active !== false
    );
    
    return filtered.slice(0, limit);
  } catch (error) {
    return [];
  }
}

export async function getStoreStats(slug: string): Promise<{
  promocodes_count: number;
  total_views: number;
  active_promocodes: number;
  hot_promocodes: number;
}> {
  return debounceRequest(`store-stats-${slug}`, async () => {
    try {
      const response = await apiRequest<{
        promocodes_count: number;
        total_views: number;
        active_promocodes: number;
        hot_promocodes: number;
      }>(
        `/stores/${slug}/stats/`, 
        {}, 
        {}, 
        true, 
        { ...NORMAL_CACHE, tags: ['store-stats', `store-${slug}`] }
      );
      return response;
    } catch (error) {
      return {
        promocodes_count: 0,
        total_views: 0,
        active_promocodes: 0,
        hot_promocodes: 0
      };
    }
  });
}

export async function getCategory(slug: string): Promise<Category | null> {
  const normalizedSlug = decodeURIComponent(slug).toLowerCase();
  
  return debounceRequest(`category-${normalizedSlug}`, async () => {
    try {
      const category = await apiRequest<Category>(
        `/categories/${normalizedSlug}/`, 
        {}, 
        {}, 
        true, 
        { ...NORMAL_CACHE, tags: ['categories', `category-${normalizedSlug}`] }
      );
      return category;
    } catch (error) {
      console.error(`[API] Category not found: ${normalizedSlug}`);
      return null;
    }
  });
}

export async function getCategoryPromocodes(
  slug: string, 
  params?: Omit<PromocodesParams, 'category'>
): Promise<{
  results: Promocode[];
  count: number;
  next?: string;
  previous?: string;
  category?: Category;
}> {
  const cacheKey = `category-promocodes-${slug}-${JSON.stringify(params || {})}`;
  
  return debounceRequest(cacheKey, async () => {
    try {
      // Поиск и пагинация в категориях также используют no-store
      const cacheStrategy = (params?.search || params?.page) 
        ? NO_CACHE 
        : { ...NORMAL_CACHE, tags: ['category-promocodes', `category-${slug}`] };

      const response = await apiRequest<{
        count: number;
        next?: string;
        previous?: string;
        results: any[];
        category?: Category;
      }>(
        `/categories/${slug}/promocodes/`,
        {},
        params,
        false,
        cacheStrategy
      );

      const normalizedResults = (response.results || []).map(normalizePromocode);

      return {
        results: normalizedResults,
        count: response.count || 0,
        next: response.next,
        previous: response.previous,
        category: response.category
      };
    } catch (error) {
      console.error(`Ошибка загрузки промокодов категории ${slug}:`, error);
      
      if (error instanceof ApiError && error.status === 404) {
        try {
          const category = await getCategory(slug);
          return {
            results: [],
            count: 0,
            category: category || undefined
          };
        } catch (categoryError) {
          return {
            results: [],
            count: 0
          };
        }
      }
      
      return {
        results: [],
        count: 0
      };
    }
  });
}

export async function getPage(slug: string): Promise<Page> {
  return debounceRequest(`page-${slug}`, async () => {
    try {
      return await apiRequest<Page>(
        `/pages/${slug}/`, 
        {}, 
        {}, 
        true, 
        { ...STATIC_CACHE, tags: ['pages', `page-${slug}`] }
      );
    } catch (error) {
      throw error;
    }
  });
}

export async function getPromocodeById(id: string): Promise<Promocode | null> {
  return debounceRequest(`promocode-${id}`, async () => {
    try {
      const promocode = await apiRequest<any>(
        `/promocodes/${id}/`,
        {},
        {},
        false,
        { ...NORMAL_CACHE, tags: ['promocodes', `promocode-${id}`] }
      );
      return normalizePromocode(promocode);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      console.error(`[API] Error fetching promocode ${id}:`, error);
      return null;
    }
  });
}

export async function getRelatedPromocodes(
  promoId: number,
  storeSlug?: string,
  categorySlug?: string,
  limit: number = 6
): Promise<Promocode[]> {
  const cacheKey = `related-promocodes-${promoId}-${storeSlug}-${categorySlug}-${limit}`;

  return debounceRequest(cacheKey, async () => {
    try {
      if (storeSlug) {
        const storePromos = await getPromocodes({
          store: storeSlug,
          page_size: limit + 1,
          ordering: '-is_recommended,-views_count'
        });
        const filtered = storePromos.results.filter(p => p.id !== promoId);
        if (filtered.length >= 3) {
          return filtered.slice(0, limit);
        }
        if (categorySlug && filtered.length < limit) {
          const remainingCount = Math.max(1, limit - filtered.length);
          const categoryPromos = await getPromocodes({
            category: categorySlug,
            page_size: remainingCount,
            ordering: '-is_recommended,-views_count'
          });
          const additionalPromos = categoryPromos.results.filter(p =>
            p.id !== promoId && !filtered.find(fp => fp.id === p.id)
          );
          return [...filtered, ...additionalPromos].slice(0, limit);
        }
        return filtered.slice(0, limit);
      }
      if (categorySlug) {
        const categoryPromos = await getPromocodes({
          category: categorySlug,
          page_size: limit + 1,
          ordering: '-is_recommended,-views_count'
        });
        return categoryPromos.results
          .filter(p => p.id !== promoId)
          .slice(0, limit);
      }
      const popularPromos = await getPromocodes({
        page_size: limit + 1,
        ordering: '-views_count'
      });
      return popularPromos.results
        .filter(p => p.id !== promoId)
        .slice(0, limit);
    } catch (error) {
      console.error('[API] Error fetching related promocodes:', error);
      return [];
    }
  });
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactForm(formData: ContactFormData): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log('[DEBUG] Отправляем данные:', JSON.stringify(formData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/v1/contact/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    console.log('[DEBUG] Статус ответа:', response.status);
    const responseText = await response.text();
    console.log('[DEBUG] Ответ сервера (текст):', responseText);

    if (response.ok) {
      try {
        const responseJson = JSON.parse(responseText);
        console.log('[DEBUG] Успешный JSON ответ:', responseJson);
        
        if (responseJson.success) {
          return {
            success: true,
            message: responseJson.message || 'Сообщение успешно отправлено! Мы ответим в течение 24 часов.'
          };
        } else {
          return {
            success: false,
            message: responseJson.message || 'Ошибка при обработке сообщения'
          };
        }
      } catch (parseError) {
        console.error('[DEBUG] Ошибка парсинга JSON:', parseError);
        return {
          success: true,
          message: 'Сообщение отправлено, но ответ сервера в неожиданном формате'
        };
      }
    } else {
      console.error('[DEBUG] HTTP ошибка:', response.status, responseText);
      
      try {
        const errorJson = JSON.parse(responseText);
        console.error('[DEBUG] Детали ошибки:', errorJson);
        
        return {
          success: false,
          message: errorJson.message || `Ошибка ${response.status}: ${response.statusText}`
        };
      } catch {
        return {
          success: false,
          message: `Ошибка ${response.status}: ${response.statusText}`
        };
      }
    }

  } catch (error) {
    console.error('[API] Ошибка сети:', error);
    return {
      success: false,
      message: 'Ошибка подключения к серверу. Проверьте интернет-соединение.'
    };
  }
}

// ==================== SHOWCASES API ====================

export async function getShowcases(params?: {
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<Showcase>> {
  const cacheKey = `showcases-${JSON.stringify(params || {})}`;

  return debounceRequest(cacheKey, async () => {
    try {
      const cacheStrategy = params?.page
        ? NO_CACHE
        : { ...NORMAL_CACHE, tags: ['showcases'] };

      const response = await apiRequest<PaginatedResponse<Showcase>>(
        '/showcases/',
        {},
        params,
        false,
        cacheStrategy
      );

      return response;
    } catch (error) {
      console.error('[API] Error loading showcases:', error);
      return {
        count: 0,
        results: []
      };
    }
  });
}

export async function getShowcaseBySlug(slug: string): Promise<Showcase | null> {
  const normalizedSlug = decodeURIComponent(slug).toLowerCase();

  return debounceRequest(`showcase-${normalizedSlug}`, async () => {
    try {
      const showcase = await apiRequest<Showcase>(
        `/showcases/${normalizedSlug}/`,
        {},
        {},
        false,
        { ...NORMAL_CACHE, tags: ['showcases', `showcase-${normalizedSlug}`] }
      );
      return showcase;
    } catch (error) {
      console.error(`[API] Showcase not found: ${normalizedSlug}`);
      return null;
    }
  });
}

export async function getShowcasePromos(
  slug: string,
  params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  }
): Promise<PaginatedResponse<Promocode>> {
  const cacheKey = `showcase-promos-${slug}-${JSON.stringify(params || {})}`;

  return debounceRequest(cacheKey, async () => {
    try {
      const cacheStrategy = params?.page
        ? NO_CACHE
        : { ...NORMAL_CACHE, tags: ['showcase-promos', `showcase-${slug}`] };

      const response = await apiRequest<PaginatedResponse<any>>(
        `/showcases/${slug}/promos/`,
        {},
        params,
        false,
        cacheStrategy
      );

      const normalizedResults = (response.results || []).map(normalizePromocode);

      return {
        count: response.count || 0,
        next: response.next,
        previous: response.previous,
        results: normalizedResults
      };
    } catch (error) {
      console.error(`[API] Error loading showcase promos for ${slug}:`, error);
      return {
        count: 0,
        results: []
      };
    }
  });
}

// ========================================
// Site Assets API
// ========================================

export interface SiteAssets {
  favicon_ico?: string;
  favicon_16?: string;
  favicon_32?: string;
  og_default?: string;
  twitter_default?: string;
  apple_touch_icon?: string;
  pwa_192?: string;
  pwa_512?: string;
  pwa_maskable?: string;
  safari_pinned_svg?: string;
  theme_color: string;
  background_color: string;
  last_generated_at?: string;
}

/**
 * Получение медиа-ресурсов сайта (favicon, OG images, PWA icons)
 * Используется в layout.tsx для динамической подстановки
 */
export async function getSiteAssets(): Promise<SiteAssets> {
  return debounceRequest('site-assets', async () => {
    try {
      const cacheStrategy = {
        ...NORMAL_CACHE,
        revalidate: 3600, // 1 час - эти данные редко меняются
        tags: ['site-assets']
      };

      const response = await apiRequest<SiteAssets>(
        '/site/assets/',
        {},
        {},
        false,
        cacheStrategy
      );

      return response;
    } catch (error) {
      console.error('[API] Error loading site assets:', error);
      // Возвращаем дефолтные значения при ошибке
      return {
        theme_color: '#0b1020',
        background_color: '#0b1020'
      };
    }
  });
}