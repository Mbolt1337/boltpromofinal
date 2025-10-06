'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Showcase } from '@/lib/api';
import { Tag } from 'lucide-react';
import BaseCard from '@/components/ui/BaseCard';
import { trackShowcaseOpen } from '@/lib/analytics';

interface ShowcaseCardProps {
  showcase: Showcase;
  priority?: boolean; // Для LCP оптимизации первого изображения
}

export default function ShowcaseCard({ showcase, priority = false }: ShowcaseCardProps) {
  const bannerUrl = showcase.banner.startsWith('http')
    ? showcase.banner
    : `${process.env.NEXT_PUBLIC_API_URL}${showcase.banner}`;

  const handleClick = () => {
    trackShowcaseOpen(showcase.id);
  };

  return (
    <Link
      href={`/showcases/${showcase.slug}`}
      className="group block h-full"
      onClick={handleClick}
    >
      <BaseCard className="h-full overflow-hidden flex flex-col p-0">
        {/* Banner 16:9 */}
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <Image
            src={bannerUrl}
            alt={showcase.title}
            fill
            className="object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
          {/* Разделитель */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-2 px-4 sm:px-5 py-4">
          {/* Title */}
          <h3 className="line-clamp-2 font-semibold text-base sm:text-lg text-white transition-colors">
            {showcase.title}
          </h3>

          {/* Description */}
          {showcase.description && (
            <p className="line-clamp-2 text-sm text-white/70">
              {showcase.description}
            </p>
          )}

          {/* Meta */}
          <div className="mt-2 flex items-center gap-3 text-xs text-white/60">
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 border border-white/10 bg-white/5">
              <Tag className="w-3.5 h-3.5" />
              {showcase.promos_count} промокодов
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* CTA */}
          <button className="mt-3 px-3 py-1.5 text-xs font-medium text-white/80 bg-white/5 rounded-lg border border-white/10 transition-all group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white">
            Смотреть
          </button>
        </div>
      </BaseCard>
    </Link>
  );
}