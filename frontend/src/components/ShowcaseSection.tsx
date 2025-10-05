import { getShowcases } from '@/lib/api';
import ShowcaseGrid from './ShowcaseGrid';
import ShowcaseCarouselMobile from './ShowcaseCarouselMobile';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';
import PillLink from '@/components/ui/PillLink';

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
        <PillLink href="/showcases" variant="secondary">
          Перейти к подборкам →
        </PillLink>
      </div>
    </SectionContainer>
  );
}