'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselBaseProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemWidth?: string; // Tailwind class: 'min-w-[320px]', 'min-w-[360px]', etc
  itemClassName?: string; // Additional classes for item wrapper
  gap?: string; // Tailwind class: 'gap-4', 'gap-6', etc
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  containerClassName?: string;
  fixedSize?: { width: string; height: string } | null; // For promo cards
}

export default function CarouselBase<T>({
  items,
  renderItem,
  itemWidth = 'min-w-[320px] sm:min-w-[360px]',
  itemClassName = '',
  gap = 'gap-4 sm:gap-6',
  showDots = true,
  showArrows = false,
  className = '',
  containerClassName = '',
  fixedSize = { width: '310px', height: '460px' }
}: CarouselBaseProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const itemWidth = scrollContainer.scrollWidth / items.length;
      const index = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(index);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [items.length]);

  const scrollToIndex = (index: number) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const itemWidth = scrollContainer.scrollWidth / items.length;
    scrollContainer.scrollTo({
      left: itemWidth * index,
      behavior: 'smooth',
    });
  };

  const scrollPrev = () => {
    scrollToIndex(Math.max(0, currentIndex - 1));
  };

  const scrollNext = () => {
    scrollToIndex(Math.min(items.length - 1, currentIndex + 1));
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className={`overflow-x-auto snap-x snap-mandatory scrollbar-hide ${containerClassName}`}
      >
        <div className={`flex ${gap}`}>
          {items.map((item, index) => (
            <div
              key={index}
              className={`snap-start shrink-0 ${itemClassName} ${itemWidth}`}
              style={fixedSize ? { width: fixedSize.width, height: fixedSize.height } : undefined}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows (Desktop) */}
      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            disabled={currentIndex === 0}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Предыдущий слайд"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={scrollNext}
            disabled={currentIndex === items.length - 1}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Следующий слайд"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2 md:mt-4" role="tablist">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                index === currentIndex
                  ? 'w-2 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
              role="tab"
              aria-label={`Перейти к слайду ${index + 1}`}
              aria-current={index === currentIndex}
              aria-selected={index === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}
