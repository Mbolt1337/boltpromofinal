'use client';

import { Showcase } from '@/lib/api';
import ShowcaseCard from './cards/ShowcaseCard';

interface ShowcaseGridProps {
  showcases: Showcase[];
}

export default function ShowcaseGrid({ showcases }: ShowcaseGridProps) {
  if (showcases.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {showcases.map((showcase, index) => (
        <ShowcaseCard
          key={showcase.id}
          showcase={showcase}
          priority={index === 0}
        />
      ))}
    </div>
  );
}