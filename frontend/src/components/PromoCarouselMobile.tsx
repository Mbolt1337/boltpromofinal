'use client';

import PromoCard from './PromoCard';
import CarouselBase from './CarouselBase';
import type { Promocode } from '@/lib/api';

interface PromoCarouselMobileProps {
  promos: Promocode[];
}

export default function PromoCarouselMobile({ promos }: PromoCarouselMobileProps) {
  return (
    <div className="md:hidden">
      <CarouselBase
        items={promos}
        renderItem={(promo) => <PromoCard promo={promo} />}
        itemWidth="min-w-[320px] sm:min-w-[360px]"
        gap="gap-4 sm:gap-6"
        showDots={true}
        showArrows={false}
        containerClassName="px-4 sm:px-6"
      />
    </div>
  );
}
