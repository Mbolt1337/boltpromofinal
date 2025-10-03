'use client';

import { useRef, useState, useEffect } from 'react';
import PromoCard from './PromoCard';
import type { Promocode } from '@/lib/api';

interface PromoCarouselMobileProps {
  promos: Promocode[];
}

export default function PromoCarouselMobile({ promos }: PromoCarouselMobileProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const itemWidth = scrollContainer.scrollWidth / promos.length;
      const index = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(index);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [promos.length]);

  const scrollToIndex = (index: number) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const itemWidth = scrollContainer.scrollWidth / promos.length;
    scrollContainer.scrollTo({
      left: itemWidth * index,
      behavior: 'smooth',
    });
  };

  if (promos.length === 0) {
    return null;
  }

  return (
    <div className="md:hidden">
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto snap-x snap-mandatory -mx-4 px-4 scrollbar-hide"
      >
        <div className="flex gap-4 pb-4">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="snap-start shrink-0 w-[320px] xs:w-[340px] sm:w-[360px]"
            >
              <PromoCard promo={promo} />
            </div>
          ))}
        </div>
      </div>

      {/* Индикаторы прокрутки */}
      {promos.length > 1 && (
        <div className="flex justify-center gap-2 mt-4 mb-6">
          {promos.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                index === currentIndex
                  ? 'w-6 h-2 bg-white shadow-lg'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/70 border border-white/30'
              }`}
              aria-label={`Перейти к промокоду ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>
      )}

      {/* Тонкий градиент слева/справа */}
      <div className="pointer-events-none relative -mt-4 md:hidden">
        <div className="absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-black/40 to-transparent" />
      </div>
    </div>
  );
}
