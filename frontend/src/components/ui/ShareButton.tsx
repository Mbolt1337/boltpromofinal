'use client';

import { Share2 } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

export default function ShareButton({ title, text, url, className = '' }: ShareButtonProps) {
  const handleShare = async () => {
    const shareData = {
      title,
      text: text || title,
      url: url || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(shareData.url);
        showToast.success('Ссылка скопирована!', 'Можете поделиться ею с друзьями');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share error:', error);
        showToast.error('Не удалось поделиться', 'Попробуйте ещё раз');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg backdrop-blur-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${className}`}
      aria-label="Поделиться"
      data-testid="share-button"
    >
      <Share2 className="w-4 h-4 text-white" />
      <span className="text-sm md:text-base text-white font-medium">Поделиться</span>
    </button>
  );
}
