import { getShowcases } from '@/lib/api';
import ShowcaseGrid from './ShowcaseGrid';
import ShowcaseCarouselMobile from './ShowcaseCarouselMobile';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';
import PillLink from '@/components/ui/PillLink';
import { Layers, ArrowRight } from 'lucide-react';

export default async function ShowcaseSection() {
  const { results: showcases } = await getShowcases({ page_size: 8 });

  if (showcases.length === 0) {
    return null;
  }

  return (
    <SectionContainer data-testid="showcase-section">
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
        <PillLink href="/showcases" variant="secondary" className="group" data-testid="showcases-view-all-button">
          <Layers className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 ease-out" />
          <span>Перейти к подборкам</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
        </PillLink>
      </div>
    </SectionContainer>
  );
}