'use client';

import { useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className={`flex items-center gap-3 px-5 py-4 glass-card shadow-2xl min-w-[320px] ${
        type === 'success'
          ? 'border-green-500/30 bg-green-500/10'
          : 'border-red-500/30 bg-red-500/10'
      }`}>
        <div className={`flex-shrink-0 w-5 h-5 ${
          type === 'success' ? 'text-green-300' : 'text-red-300'
        }`}>
          {type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </div>
        <p className={`flex-1 text-sm font-medium ${
          type === 'success' ? 'text-green-100' : 'text-red-100'
        }`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
          aria-label="Закрыть уведомление"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
