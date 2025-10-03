'use client';

import Link from 'next/link';
import { Showcase } from '@/lib/api';
import { Tag } from 'lucide-react';
import BaseCard from '@/components/ui/BaseCard';
import CardImage from '@/components/ui/CardImage';
import { trackShowcaseOpen } from '@/lib/analytics';

interface ShowcaseCardProps {
  showcase: Showcase;
}

export default function ShowcaseCard({ showcase }: ShowcaseCardProps) {
  const bannerUrl = showcase.banner.startsWith('http')
    ? showcase.banner
    : `${process.env.NEXT_PUBLIC_API_URL}${showcase.banner}`;

  const handleClick = () => {
    trackShowcaseOpen(showcase.id);
  };

  return (
    <Link
      href={`/showcases/${showcase.slug}`}
      className="group block"
      onClick={handleClick}
    >
      <BaseCard className="card-pad overflow-hidden">
        {/* Banner Image */}
        <div className="relative">
          <CardImage
            src={bannerUrl}
            alt={showcase.title}
            aspect="16/9"
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Content */}
        <div className="space-y-3 mt-4">
          {/* Title */}
          <h3 className="text-base font-semibold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
            {showcase.title}
          </h3>

          {/* Description */}
          {showcase.description && (
            <p className="text-sm text-white/70 line-clamp-2">
              {showcase.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Promo Count */}
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <Tag className="w-3.5 h-3.5" />
              <span>{showcase.promos_count} промокодов</span>
            </div>

            {/* CTA Button */}
            <button className="px-3 py-1.5 text-xs font-medium text-white/80 bg-white/5 rounded-lg border border-white/10 transition-all group-hover:bg-purple-500/20 group-hover:border-purple-500/30 group-hover:text-white">
              Смотреть
            </button>
          </div>
        </div>
      </BaseCard>
    </Link>
  );
}