import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getShowcaseBySlug, getShowcasePromos } from '@/lib/api';
import PromoCard from '@/components/PromoCard';
import { SITE_CONFIG } from '@/lib/seo';
import type { Metadata } from 'next';
import { Tag } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ShareButton from '@/components/ui/ShareButton';

interface ShowcasePageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params }: ShowcasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const showcase = await getShowcaseBySlug(slug);

  if (!showcase) {
    return {
      title: 'Подборка не найдена - BoltPromo'
    };
  }

  const bannerUrl = showcase.banner.startsWith('http')
    ? showcase.banner
    : `${process.env.NEXT_PUBLIC_API_URL}${showcase.banner}`;

  return {
    title: `${showcase.title} - Подборка промокодов BoltPromo`,
    description: showcase.description || `Специальная подборка ${showcase.title} с ${showcase.promos_count} проверенными промокодами и скидками`,
    alternates: {
      canonical: `${SITE_CONFIG.url}/showcases/${showcase.slug}`
    },
    openGraph: {
      title: `${showcase.title} - BoltPromo`,
      description: showcase.description || `${showcase.promos_count} промокодов в подборке`,
      url: `${SITE_CONFIG.url}/showcases/${showcase.slug}`,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: bannerUrl,
          width: 1200,
          height: 630,
          alt: showcase.title
        }
      ],
      locale: 'ru_RU',
      type: 'website'
    }
  };
}

async function ShowcasePromos({ slug, page }: { slug: string; page: number }) {
  const { results: promocodes, count } = await getShowcasePromos(slug, {
    page,
    page_size: 24
  });

  if (promocodes.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-white/70 text-lg">В этой подборке пока нет промокодов</p>
      </div>
    );
  }

  const totalPages = Math.ceil(count / 24);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {promocodes.map((promo) => (
          <PromoCard key={promo.id} promo={promo} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {page > 1 && (
            <a
              href={`/showcases/${slug}?page=${page - 1}`}
              className="px-4 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-lg transition-all hover:bg-white/10 hover:border-white/20"
            >
              ← Назад
            </a>
          )}

          <span className="px-4 py-2 text-sm text-white/70">
            Страница {page} из {totalPages}
          </span>

          {page < totalPages && (
            <a
              href={`/showcases/${slug}?page=${page + 1}`}
              className="px-4 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-lg transition-all hover:bg-white/10 hover:border-white/20"
            >
              Вперед →
            </a>
          )}
        </div>
      )}
    </>
  );
}

export default async function ShowcasePage({ params, searchParams }: ShowcasePageProps) {
  const { slug } = await params;
  const { page } = await searchParams;

  const showcase = await getShowcaseBySlug(slug);

  if (!showcase) {
    notFound();
  }

  const currentPage = Number(page) || 1;
  const bannerUrl = showcase.banner.startsWith('http')
    ? showcase.banner
    : `${process.env.NEXT_PUBLIC_API_URL}${showcase.banner}`;

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Подборки', href: '/showcases' },
    { label: showcase.title }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Banner Section */}
      <div className="container-main pt-8 pb-12">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Hero Banner with Image */}
        <div className="relative w-full h-[220px] sm:h-[280px] lg:h-[320px] overflow-hidden rounded-2xl mb-8">
          <Image
            src={bannerUrl}
            alt={showcase.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          />
          {/* Enhanced gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />

          {/* Title Overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="p-8 md:p-12 w-full">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {showcase.title}
              </h1>
              {showcase.description && (
                <p className="text-lg md:text-xl text-white/95 max-w-3xl mb-4 drop-shadow-md">
                  {showcase.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm">
                  <Tag className="w-5 h-5 text-white" />
                  <span className="text-sm md:text-base text-white font-medium">
                    {showcase.promos_count} {showcase.promos_count === 1 ? 'промокод' : 'промокодов'}
                  </span>
                </div>
                <ShareButton
                  title={showcase.title}
                  text={showcase.description || `${showcase.promos_count} промокодов в подборке`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promocodes Section */}
      <div className="container-main pb-12">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-[400px] bg-white/5 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          }
        >
          <ShowcasePromos slug={slug} page={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}