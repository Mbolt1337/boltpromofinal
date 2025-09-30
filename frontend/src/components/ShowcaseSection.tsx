import Link from 'next/link';
import { getShowcases } from '@/lib/api';
import ShowcaseGrid from './ShowcaseGrid';
import ShowcaseCarouselMobile from './ShowcaseCarouselMobile';
import { ChevronRight } from 'lucide-react';

export default async function ShowcaseSection() {
  const { results: showcases } = await getShowcases({ page_size: 8 });

  if (showcases.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container-main">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="heading-lg text-gradient mb-4">
            Найдите лучшие промокоды в подборках BoltPromo
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Специально подобранные коллекции промокодов для разных категорий
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:block">
          <ShowcaseGrid showcases={showcases} />
        </div>

        {/* Mobile Carousel */}
        <ShowcaseCarouselMobile showcases={showcases} />

        {/* View All Link */}
        <div className="mt-6 text-center">
          <Link
            href="/showcases"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl transition-all hover:bg-white/10 hover:border-white/20 hover:gap-3"
          >
            <span>Перейти к подборкам</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}