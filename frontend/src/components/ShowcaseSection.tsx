import { getShowcases } from '@/lib/api';
import ShowcaseGrid from './ShowcaseGrid';
import ShowcaseCarouselMobile from './ShowcaseCarouselMobile';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';
import { Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const ACTION_BUTTON_CLASSES = "inline-flex items-center px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 ease-out bg-white/8 hover:bg-white/12 border border-white/15 hover:border-white/25 hover:scale-105 group shadow-lg hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none"

export default async function ShowcaseSection() {
  const { results: showcases } = await getShowcases({ page_size: 8 });

  if (showcases.length === 0) {
    return null;
  }

  return (
    <SectionContainer>
      <SectionHeader
        title="Найдите лучшие промокоды в подборках BoltPromo"
        subtitle="Специально подобранные коллекции промокодов для разных категорий"
        align="center"
      />

      {/* Desktop Grid */}
      <div className="hidden md:block">
        <ShowcaseGrid showcases={showcases} />
      </div>

      {/* Mobile Carousel */}
      <ShowcaseCarouselMobile showcases={showcases} />

      {/* View All Link */}
      <div className="mt-4 md:mt-12 flex justify-center">
        <Link href="/showcases" className={ACTION_BUTTON_CLASSES}>
          <Layers className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300 ease-out" />
          <span>Перейти к подборкам</span>
          <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
        </Link>
      </div>
    </SectionContainer>
  );
}