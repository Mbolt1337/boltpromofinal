'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Showcase } from '@/lib/api';
import { Tag } from 'lucide-react';

interface ShowcaseCardProps {
  showcase: Showcase;
}

export default function ShowcaseCard({ showcase }: ShowcaseCardProps) {
  const bannerUrl = showcase.banner.startsWith('http')
    ? showcase.banner
    : `${process.env.NEXT_PUBLIC_API_URL}${showcase.banner}`;

  return (
    <Link
      href={`/showcases/${showcase.slug}`}
      className="group block rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10"
    >
      {/* Banner Image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl">
        <Image
          src={bannerUrl}
          alt={showcase.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
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
    </Link>
  );
}