'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string;
  className?: string;
}

export default function CountdownTimer({ expiresAt, className = '' }: CountdownTimerProps) {
  const target = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Старт после монтирования -> на сервере значения нет
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // До гидратации показываем стабильный плейсхолдер, чтобы SSR==CSR
  if (now === null) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs font-semibold ${className}`}
        suppressHydrationWarning
      >
        <Clock className="w-3.5 h-3.5" />
        <span className="font-mono" suppressHydrationWarning>--:--:--</span>
      </div>
    );
  }

  const diff = Math.max(target - now, 0);

  // Если время истекло, не показываем таймер
  if (diff === 0) {
    return null;
  }

  const total = Math.floor(diff / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs font-semibold ${className}`}
      suppressHydrationWarning
    >
      <Clock className="w-3.5 h-3.5" />
      <span className="font-mono" suppressHydrationWarning>
        {days > 0 && `${days}д `}
        {h}:{m}:{s}
      </span>
    </div>
  );
}
