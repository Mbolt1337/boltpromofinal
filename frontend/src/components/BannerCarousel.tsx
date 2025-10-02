'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ExternalLink, Play, Pause } from 'lucide-react';
import { getBanners, type Banner } from '@/lib/api';

interface BannerCarouselProps {
  autoplay?: boolean;
  interval?: number;
  showControls?: boolean;
  className?: string;
  priority?: boolean;
  preloadedBanners?: Banner[];
}

const MEDIA_QUERIES = {
  REDUCE_MOTION: '(prefers-reduced-motion: reduce)',
} as const

const bannersCache = new Map<string, { data: Banner[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function isInternalLink(url: string): boolean {
  try {
    return typeof url === 'string' && url.trim().startsWith('/');
  } catch {
    return false;
  }
}

function sortKey(a: any): number {
  if (typeof a?.sort_order === 'number') return a.sort_order;
  if (typeof a?.order === 'number') return a.order;
  return Number.MAX_SAFE_INTEGER;
}

function getCachedBanners(): Banner[] | null {
  const cached = bannersCache.get('banners')
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedBanners(banners: Banner[]): void {
  bannersCache.set('banners', {
    data: banners,
    timestamp: Date.now()
  })
}

export default function BannerCarousel({
  autoplay = true,
  interval = 6000,
  showControls = true,
  className = '',
  priority = false,
  preloadedBanners
}: BannerCarouselProps) {
  const [banners, setBanners] = useState<Banner[]>(preloadedBanners || []);
  const [loading, setLoading] = useState(!preloadedBanners);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MEDIA_QUERIES.REDUCE_MOTION);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setIsPlaying(false);
      }
    };

    setPrefersReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setIsPlaying(false);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setIsInView(true);
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (preloadedBanners && preloadedBanners.length > 0) {
      const activeSorted = preloadedBanners
        .filter((b: any) => b?.is_active)
        .sort((a: any, b: any) => sortKey(a) - sortKey(b));
      setBanners(activeSorted);
      setLoading(false);
      return;
    }

    const cachedBanners = getCachedBanners();
    if (cachedBanners) {
      setBanners(cachedBanners);
      setLoading(false);
      return;
    }

    let mounted = true;
    const loadBanners = async () => {
      try {
        setLoading(true);
        const data = await getBanners();

        const activeSorted = (data || [])
          .filter((b: any) => b?.is_active)
          .sort((a: any, b: any) => sortKey(a) - sortKey(b));

        if (mounted) {
          setBanners(activeSorted);
        }
      } catch (e) {
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBanners();
    return () => {
      mounted = false;
    };
  }, [preloadedBanners]);

  useEffect(() => {
    if (currentSlide >= banners.length && banners.length > 0) {
      setCurrentSlide(banners.length - 1);
    }
  }, [banners.length, currentSlide]);

  const goToNext = useCallback(() => {
    setBanners((prev) => {
      const newIndex = prev.length > 0 ? (currentSlide + 1) % prev.length : 0;
      setCurrentSlide(newIndex);
      return prev;
    });
  }, [currentSlide]);

  const goToPrevious = useCallback(() => {
    setBanners((prev) => {
      const newIndex = prev.length > 0 ? (currentSlide === 0 ? prev.length - 1 : currentSlide - 1) : 0;
      setCurrentSlide(newIndex);
      return prev;
    });
  }, [currentSlide]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < banners.length) {
      setCurrentSlide(index);
    }
  }, [banners.length]);

  useEffect(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }

    const shouldAutoplay = isPlaying && !isHovered && isInView && banners.length > 1;
    
    if (shouldAutoplay) {
      autoplayTimerRef.current = setInterval(goToNext, interval);
    }

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [isPlaying, isHovered, isInView, banners.length, interval, goToNext]);

  const getButtonConfig = useCallback((banner: any) => {
    const buttonUrl: string | undefined =
      banner?.cta_url ??
      banner?.link ??
      banner?.url ??
      banner?.href ??
      banner?.external_link ??
      undefined;

    const buttonText: string = banner?.cta_text ?? banner?.button_text ?? 'Подробнее';
    return { buttonUrl, buttonText };
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!carouselRef.current?.contains(e.target as Node)) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(banners.length - 1);
        break;
      case ' ':
        if ((e.target as HTMLElement).tagName !== 'BUTTON') {
          e.preventDefault();
          setIsPlaying(prev => !prev);
        }
        break;
    }
  }, [goToPrevious, goToNext, goToSlide, banners.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const animationStyles = useMemo(() => ({
    transition: prefersReducedMotion 
      ? 'opacity 0.15s ease-out' 
      : 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform, opacity' as const,
  }), [prefersReducedMotion]);

  const currentBanner = useMemo(() => banners[currentSlide], [banners, currentSlide]);

  const containerClasses = useMemo(() => 
    `relative w-full h-[260px] sm:h-[300px] md:h-[360px] lg:h-[420px] overflow-hidden rounded-2xl lg:rounded-3xl bg-white/3 border border-white/8 transition-all duration-300 ${className}`,
    [className]
  );

  const textShadowStyles = {
    titleShadow: {
      textShadow: '0 4px 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.7)',
      filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))'
    },
    descriptionShadow: {
      textShadow: '0 2px 6px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.6)',
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.7))'
    },
    buttonShadow: {
      textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6)',
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
    }
  };

  if (loading) {
    return (
      <section className="py-6 lg:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={containerClasses} style={{ aspectRatio: '16/9' }}>
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 border-4 border-white/15 border-t-white/40 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/50 text-sm lg:text-lg">Загрузка баннеров...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="py-6 lg:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={containerClasses} style={{ aspectRatio: '16/9' }}>
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <h3 className="text-lg lg:text-2xl font-semibold text-white mb-4">Баннеры пока не добавлены</h3>
                <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
                  Добавьте активные баннеры в админке, чтобы показывать их пользователям.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section className="py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={carouselRef}
          className={containerClasses}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          aria-roledescription="carousel"
          aria-live="polite"
          tabIndex={0}
          style={{ 
            aspectRatio: '16/9',
            minHeight: '260px'
          }}
        >
          <div className="relative w-full h-full">
            {banners.map((banner: any, index) => {
              const active = index === currentSlide;
              const isFirst = index === 0;
              const { buttonUrl, buttonText } = getButtonConfig(banner);
              const rawLink = typeof banner?.link === 'string' ? banner.link.trim() : '';
              const bannerLink = rawLink.length > 0 ? rawLink : undefined;
              const overlayAriaLabel =
                typeof banner?.title === 'string' && banner.title.trim().length > 0
                  ? banner.title.trim()
                  : 'Открыть предложение';

              const hasText = Boolean(
                (banner?.title && banner.title.trim()) ||
                (banner?.subtitle && banner.subtitle.trim()) ||
                (banner?.description && banner.description.trim()) ||
                (banner?.cta_text && banner.cta_text.trim())
              );

              const imageAlt = overlayAriaLabel;

              return (
                <div
                  key={banner?.id ?? index}
                  className={`absolute inset-0 ${active ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-10 pointer-events-none'}`}
                  style={{
                    ...animationStyles,
                    transform: active ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 0, 0) scale(1.02)',
                  }}
                  aria-hidden={!active}
                  role="tabpanel"
                >
                  {bannerLink && (
                    <a
                      href={bannerLink}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      aria-label={overlayAriaLabel}
                      className="absolute inset-0 z-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    />
                  )}
                  {banner?.image ? (
                    <div className="absolute inset-0 pointer-events-none">
                      <Image
                        src={banner.image}
                        alt={imageAlt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px"
                        className="object-cover rounded-2xl lg:rounded-3xl"
                        priority={priority && isFirst}
                        fetchPriority={priority && isFirst ? "high" : "low"}
                        loading={priority && isFirst ? "eager" : "lazy"}
                        quality={priority && isFirst ? 75 : 80}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLk4PvXFwjNvhIG"
                        style={{
                          willChange: active ? 'transform' : 'auto'
                        }}
                      />
                      {hasText ? (
                        <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-black/20" />
                      ) : null}
                    </div>
                  ) : (
                    <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 pointer-events-none" />
                  )}
                  <div className="relative h-full flex items-center z-10">
                    <div className="w-full max-w-5xl mx-auto px-8 sm:px-12 lg:px-16">
                      <div className="max-w-lg lg:max-w-xl text-center lg:text-left mx-auto lg:mx-0">
                        
                        {banner?.title && (
                          <h2 
                            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 lg:mb-4 leading-tight relative" 
                            style={{
                              ...textShadowStyles.titleShadow,
                              willChange: active ? 'transform' : 'auto'
                            }}
                          >
                            <span className="absolute inset-0 text-black opacity-30 blur-sm">{banner.title}</span>
                            <span className="relative z-10">{banner.title}</span>
                          </h2>
                        )}
                        {(banner?.description || banner?.subtitle) && (
                          <p 
                            className="text-sm sm:text-base md:text-lg text-gray-100 mb-6 lg:mb-8 leading-relaxed relative font-medium"
                            style={{
                              ...textShadowStyles.descriptionShadow,
                              willChange: active ? 'transform' : 'auto'
                            }}
                          >
                            <span className="absolute inset-0 text-black opacity-20 blur-sm">
                              {banner.description || banner.subtitle}
                            </span>
                            <span className="relative z-10">{banner.description || banner.subtitle}</span>
                          </p>
                        )}
                        {buttonUrl ? (
                          isInternalLink(buttonUrl) ? (
                            <Link
                              href={buttonUrl}
                              className="relative z-40 inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-white/15 hover:bg:white/25 border-2 border-white/30 hover:border-white/50 rounded-xl lg:rounded-2xl text-white font-bold backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-lg"
                              aria-label={buttonText}
                              prefetch
                              onClickCapture={(e) => e.stopPropagation()}
                              style={{ 
                                ...textShadowStyles.buttonShadow,
                                willChange: 'transform',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl lg:rounded-2xl -z-10" />
                              <Play className="mr-2 lg:mr-3 w-3 h-3 sm:w-4 sm:h-4 drop-shadow-md" />
                              <span className="relative z-10 drop-shadow-md">{buttonText}</span>
                              <ExternalLink className="ml-2 lg:ml-3 w-3 h-3 sm:w-4 sm:h-4 drop-shadow-md" />
                            </Link>
                          ) : (
                            <a
                              href={buttonUrl}
                              target="_blank"
                              rel="nofollow sponsored noopener noreferrer"
                              className="relative z-40 inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-white/15 hover:bg-white/25 border-2 border-white/30 hover:border-white/50 rounded-xl lg:rounded-2xl text-white font-bold backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-lg"
                              aria-label={buttonText}
                              onClickCapture={(e) => e.stopPropagation()}
                              style={{ 
                                ...textShadowStyles.buttonShadow,
                                willChange: 'transform',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl lg:rounded-2xl -z-10" />
                              <Play className="mr-2 lg:mr-3 w-3 h-3 sm:w-4 sm:h-4 drop-shadow-md" />
                              <span className="relative z-10 drop-shadow-md">{buttonText}</span>
                              <ExternalLink className="ml-2 lg:ml-3 w-3 h-3 sm:w-4 sm:h-4 drop-shadow-md" />
                            </a>
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {banners.length > 1 && showControls && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/12 hover:bg-white/20 border-2 border-white/25 hover:border-white/40 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 flex items-center justify-center text-white z-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-lg"
                style={{ 
                  willChange: 'transform',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
                role="button"
                tabIndex={0}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 drop-shadow-md" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/12 hover:bg-white/20 border-2 border-white/25 hover:border-white/40 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 flex items-center justify-center text-white z-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-lg"
                style={{ 
                  willChange: 'transform',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
                role="button"
                tabIndex={0}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 drop-shadow-md" />
              </button>

              <div
                className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40"
                role="tablist"
                aria-label="Переключение слайдов баннеров"
              >
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-md ${
                      index === currentSlide 
                        ? 'w-6 h-2 bg-white shadow-lg' 
                        : 'w-2 h-2 bg-white/50 hover:bg-white/70 border border-white/30'
                    }`}
                    aria-current={index === currentSlide}
                    style={{ 
                      willChange: 'transform',
                      boxShadow: index === currentSlide 
                        ? '0 2px 6px rgba(0,0,0,0.4)' 
                        : '0 1px 3px rgba(0,0,0,0.3)'
                    }}
                    role="tab"
                    aria-selected={index === currentSlide}
                  />
                ))}
              </div>

              {/* Панель управления отключена по требованиям дизайна */}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
