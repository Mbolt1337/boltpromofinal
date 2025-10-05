'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';

interface PillLinkProps {
  href: string;
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
}

/**
 * Унифицированный компонент для CTA-пилюль (кнопок-ссылок "Перейти...", "Смотреть...")
 * Используется на всех страницах для единообразия UI
 */
export default function PillLink({
  href,
  children,
  variant = 'default',
  className = '',
  onClick
}: PillLinkProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50';

  const variantClasses = {
    default: 'border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 hover:border-white/20',
    primary: 'border border-blue-500/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 hover:border-blue-500/40',
    secondary: 'border border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30'
  };

  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
