'use client';

import { Showcase } from '@/lib/api';
import ShowcaseCard from './cards/ShowcaseCard';
import CarouselBase from './CarouselBase';

interface ShowcaseCarouselMobileProps {
  showcases: Showcase[];
}

export default function ShowcaseCarouselMobile({ showcases }: ShowcaseCarouselMobileProps) {
  return (
    <div className="md:hidden">
      <CarouselBase
        items={showcases}
        renderItem={(showcase) => <ShowcaseCard showcase={showcase} />}
        itemWidth="min-w-[320px] sm:min-w-[360px]"
        gap="gap-4 sm:gap-6"
        showDots={true}
        showArrows={false}
        containerClassName="px-4 sm:px-6"
      />
    </div>
  );
}
