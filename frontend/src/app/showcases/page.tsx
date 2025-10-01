import { Suspense } from 'react';
import Link from 'next/link';
import { getShowcases } from '@/lib/api';
import ShowcaseGrid from '@/components/ShowcaseGrid';
import { SITE_CONFIG } from '@/lib/seo';
import type { Metadata } from 'next';
import { ChevronRight, Mail } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Все подборки промокодов - BoltPromo',
  description: 'Специально подобранные коллекции промокодов для разных категорий и случаев. Экономьте больше с подборками BoltPromo.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/showcases`
  },
  openGraph: {
    title: 'Подборки промокодов - BoltPromo',
    description: 'Специально подобранные коллекции промокодов для разных категорий и случаев',
    url: `${SITE_CONFIG.url}/showcases`,
    siteName: SITE_CONFIG.name,
    locale: 'ru_RU',
    type: 'website'
  }
};

interface ShowcasesPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

async function ShowcasesList({ page }: { page: number }) {
  const { results: showcases, count } = await getShowcases({
    page,
    page_size: 24
  });

  if (showcases.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-white/70 text-lg">Подборки промокодов скоро появятся</p>
      </div>
    );
  }

  const totalPages = Math.ceil(count / 24);

  return (
    <>
      <ShowcaseGrid showcases={showcases} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {page > 1 && (
            <a
              href={`/showcases?page=${page - 1}`}
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
              href={`/showcases?page=${page + 1}`}
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

export default async function ShowcasesPage({ searchParams }: ShowcasesPageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Подборки' }
  ];

  return (
    <div className="container-main py-12">
      <Breadcrumbs items={breadcrumbItems} className="mb-8" />

      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Все подборки промокодов
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Специально подобранные коллекции промокодов для разных категорий и случаев.
          Найдите лучшие предложения в удобных тематических подборках.
        </p>
      </div>

      {/* Showcases List */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[320px] bg-white/5 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        }
      >
        <ShowcasesList page={currentPage} />
      </Suspense>

      {/* CTA Block */}
      <div className="mt-16 glass-card p-8 text-center">
        <Mail className="w-12 h-12 text-white/60 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Не нашли нужную подборку?
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Напишите нам, какие промокоды вы ищете, и мы создадим специальную подборку для вас
        </p>
        <Link
          href="/contacts"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-xl transition-all hover:bg-white/15 hover:border-white/30 hover:scale-105"
        >
          <span>Написать нам</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}