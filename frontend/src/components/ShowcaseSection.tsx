import Link from 'next/link';
import { getShowcases } from '@/lib/api';
import ShowcaseGrid from './ShowcaseGrid';
import ShowcaseCarouselMobile from './ShowcaseCarouselMobile';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';

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
      <div className="section-footer-gap flex justify-center">
        <Link
          href="/showcases"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          Перейти к подборкам →
        </Link>
      </div>
    </SectionContainer>
  );
}