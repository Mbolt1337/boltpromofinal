'use client';

import { Showcase } from '@/lib/api';
import ShowcaseCard from './cards/ShowcaseCard';

interface ShowcaseCarouselMobileProps {
  showcases: Showcase[];
}

export default function ShowcaseCarouselMobile({ showcases }: ShowcaseCarouselMobileProps) {
  if (showcases.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto snap-x snap-mandatory -mx-4 px-4 md:hidden">
      <div className="flex gap-4 pb-4">
        {showcases.map((showcase) => (
          <div
            key={showcase.id}
            className="snap-start shrink-0 w-[320px] sm:w-[360px]"
          >
            <ShowcaseCard showcase={showcase} />
          </div>
        ))}
      </div>
    </div>
  );
}