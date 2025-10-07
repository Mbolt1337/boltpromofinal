# FINAL UI & SEO REPORT
**Date**: 2025-10-07
**Project**: BoltPromo Frontend
**Status**: In Progress

---

## ЭТАП 0: Baseline Inventory (Инвентаризация)

### ✅ UI Components - Существующие

| Component | Location | Status | Usage Count |
|-----------|----------|--------|-------------|
| **SectionContainer** | `components/ui/SectionContainer.tsx` | ✅ Есть | Широко используется |
| **SectionHeader** | `components/ui/SectionHeader.tsx` | ✅ Есть | Широко используется |
| **PillLink** | `components/ui/PillLink.tsx` | ✅ Есть | 3 использования (НИЗКО) |
| **BaseCard** | `components/ui/BaseCard.tsx` | ✅ Есть | Широко используется |
| **Breadcrumbs** | `components/ui/Breadcrumbs.tsx` | ✅ Есть | 32 использования |

### ✅ CSS Tokens - Глобальные стили

| Token | Status | Note |
|-------|--------|------|
| `.container-main` | ✅ Используется | Контейнер с фиксированной шириной |
| `.section-y` | ✅ Используется | Вертикальные отступы секций |
| `.card-base` | ✅ Используется | Базовый стиль карточек |
| `.glass-*` | ✅ Используется | Glassmorphism эффекты |

### 📋 Pages Inventory (16 страниц)

| Page | Path | generateMetadata | JSON-LD | Breadcrumbs | Status |
|------|------|------------------|---------|-------------|--------|
| **Home** | `/` | ❌ NO (uses layout) | ✅ ItemList + WebSite | ❌ | ⚠️ Нужен ItemList |
| **About** | `/about` | ✅ YES | ❌ | ❌ | ⚠️ Нужны хлебные крошки |
| **Categories List** | `/categories` | ✅ YES | ❌ | ❌ | ⚠️ Нужен CollectionPage |
| **Category Detail** | `/categories/[slug]` | ❌ NO | ❌ | ✅ | ⚠️ Нужен metadata + JSON-LD |
| **Stores List** | `/stores` | ✅ YES | ❌ | ❌ | ⚠️ Нужен CollectionPage |
| **Store Detail** | `/stores/[slug]` | ❌ NO | ❌ | ✅ | ⚠️ Нужен metadata + Organization |
| **Showcases List** | `/showcases` | ❌ NO | ❌ | ❌ | ⚠️ Нужен metadata + CollectionPage |
| **Showcase Detail** | `/showcases/[slug]` | ✅ YES | ❌ | ✅ | ⚠️ Нужен Product JSON-LD |
| **Promo Detail** | `/promo/[id]` | ❌ NO | ❌ | ✅ | ⚠️ Нужен metadata + Offer |
| **Hot Promos** | `/hot` | ✅ YES | ❌ | ❌ | ✅ OK |
| **Search** | `/search` | ✅ YES | ❌ | ❌ | ✅ OK |
| **FAQ** | `/faq` | ✅ YES | ❌ | ❌ | ✅ OK |
| **Contacts** | `/contacts` | ✅ YES | ❌ | ❌ | ✅ OK |
| **Privacy** | `/privacy` | ✅ YES | ❌ | ❌ | ✅ OK |
| **Terms** | `/terms` | ✅ YES | ❌ | ❌ | ✅ OK |
| **Maintenance** | `/maintenance` | ❌ NO | ❌ | ❌ | ⚠️ Нужен metadata |

### 🎨 UI Patterns - Текущее состояние

**CTA Buttons:**
- ✅ `PillLink` компонент существует, но **МАЛО используется** (только 3 раза)
- ⚠️ Много мест с хардкодом кнопок вместо PillLink
- 🎯 **Action needed**: унифицировать все CTA через PillLink

**Cards:**
- ✅ `BaseCard` компонент широко используется
- ✅ PromoCard, ShowcaseCard, HotPromoCard используют единый стиль
- ✅ Карточки в каруселях имеют фиксированную высоту

**Breadcrumbs:**
- ✅ Компонент есть и используется (32 раза)
- ⚠️ Не везде применён (home, about, categories list, stores list, showcases list)
- 🎯 **Action needed**: добавить на страницы списков

### 🔍 SEO Components

**JSON-LD Schemas:**
- ✅ `ItemListJsonLd` - существует для главной
- ✅ `WebSite` schema - в layout.tsx
- ❌ `OrganizationJsonLd` - НЕТ (нужен для store pages)
- ❌ `BreadcrumbListJsonLd` - НЕТ
- ❌ `CollectionPage` - НЕТ (нужен для lists)
- ❌ `Product/Offer` - НЕТ (нужен для promo detail)

**Meta Tags:**
- ✅ Layout.tsx имеет базовые OG/Twitter meta
- ✅ DynamicMetaTags компонент интегрирует SiteAssets API
- ⚠️ **7 страниц БЕЗ generateMetadata**:
  - `/` (home) - uses layout default
  - `/categories/[slug]`
  - `/stores/[slug]`
  - `/showcases`
  - `/promo/[id]`
  - `/maintenance`

### 🌐 SiteAssets API Integration

| Feature | Status | Location |
|---------|--------|----------|
| **Favicons** | ✅ Integrated | `DynamicMetaTags.tsx` |
| **manifest.webmanifest** | ✅ Integrated | `app/manifest.webmanifest/route.ts` |
| **OG Image** | ✅ Integrated | Uses `SITE_CONFIG.ogImage` |
| **Theme Color** | ✅ Integrated | `DynamicMetaTags.tsx` |
| **Fallback** | ✅ Safe | Falls back to static files in `/public` |

**Note**: SiteAssets API уже корректно интегрирован через `getSiteAssets()` в:
- `components/DynamicMetaTags.tsx`
- `app/manifest.webmanifest/route.ts`

---

## ЭТАП 1: UI Унификация (TODO)

### 🎯 Задачи:

1. **PillLink унификация**:
   - [ ] Найти все хардкод CTA кнопки
   - [ ] Заменить на PillLink
   - [ ] Проверить consistency варианты (default/primary/secondary)

2. **Breadcrumbs**:
   - [ ] Добавить на `/about`
   - [ ] Добавить на `/categories`
   - [ ] Добавить на `/stores`
   - [ ] Добавить на `/showcases`

3. **Карусели**:
   - [x] ShowcaseCarouselMobile - уже ОК
   - [ ] Проверить BannerCarousel
   - [ ] Проверить PartnersCarousel

---

## ЭТАП 2: SEO & JSON-LD (TODO)

### 🎯 Задачи:

1. **generateMetadata для динамических страниц**:
   - [ ] `/categories/[slug]/page.tsx`
   - [ ] `/stores/[slug]/page.tsx`
   - [ ] `/showcases/page.tsx`
   - [ ] `/promo/[id]/page.tsx`
   - [ ] `/maintenance/page.tsx`

2. **JSON-LD Schemas**:
   - [ ] Создать `BreadcrumbListJsonLd.tsx`
   - [ ] Создать `OrganizationJsonLd.tsx` для stores
   - [ ] Создать `CollectionPageJsonLd.tsx` для lists
   - [ ] Добавить Product/Offer schema на promo detail
   - [ ] Добавить BreadcrumbList на все страницы с хлебными крошками

3. **robots.txt & sitemap.xml**:
   - [ ] Проверить что витрины не блокируются
   - [ ] Проверить что промо не блокируются
   - [ ] Проверить sitemap включает все динамические страницы

---

## ЭТАП 3: Lighthouse Mobile ≥90 (TODO)

### 🎯 Задачи:

1. **Images Optimization**:
   - [ ] Проверить width/height на всех next/image
   - [ ] Проверить sizes атрибуты
   - [ ] Добавить lazy loading где нужно

2. **Performance**:
   - [ ] Проверить что lazy imports работают (PromoList, CategoryGrid, etc)
   - [ ] Убрать неиспользуемый код
   - [ ] Оптимизировать bundle size

3. **Audit Results**:
   - [ ] Run Lighthouse на `/` (home)
   - [ ] Run Lighthouse на `/showcases/[slug]`
   - [ ] Run Lighthouse на `/promo/[id]`
   - [ ] Run Lighthouse на `/stores/[slug]`

---

## ЭТАП 4: SiteAssets Verification (TODO)

✅ **ALREADY DONE** - SiteAssets API уже корректно интегрирован

---

## Next Steps

1. ⏳ Завершить инвентаризацию
2. ⏳ Начать UI унификацию (PillLink)
3. ⏳ Добавить generateMetadata на все страницы
4. ⏳ Создать недостающие JSON-LD компоненты
5. ⏳ Run Lighthouse audits
6. ⏳ Финальная проверка и отчёт
