'use client';

import { Showcase } from '@/lib/api';
import ShowcaseCard from './cards/ShowcaseCard';
import CarouselBase from './CarouselBase';

interface ShowcaseCarouselMobileProps {
  showcases: Showcase[];
}

export default function ShowcaseCarouselMobile({ showcases }: ShowcaseCarouselMobileProps) {
  return (
    <div className="md:hidden mb-4 sm:mb-6" data-testid="showcase-carousel-mobile">
      <CarouselBase
        items={showcases}
        renderItem={(showcase, index) => (
          <ShowcaseCard
            showcase={showcase}
            priority={index === 0}
          />
        )}
        itemWidth="min-w-[320px] sm:min-w-[360px] max-w-[360px]"
        itemClassName="h-full"
        gap="gap-4 sm:gap-6"
        showDots={true}
        showArrows={false}
        containerClassName="px-4 sm:px-6"
        fixedSize={null}
      />
    </div>
  );
}
