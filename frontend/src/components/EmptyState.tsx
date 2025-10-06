import { Search, ShoppingBag, Tag, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  type?: 'search' | 'promos' | 'stores' | 'error';
  message?: string;
  submessage?: string;
  actionText?: string;
  actionHref?: string;
}

const icons = {
  search: Search,
  promos: Tag,
  stores: ShoppingBag,
  error: AlertCircle
};

export default function EmptyState({
  type = 'promos',
  message,
  submessage,
  actionText,
  actionHref
}: EmptyStateProps) {
  const Icon = icons[type];

  const defaultMessages = {
    search: 'Ничего не найдено',
    promos: 'Промокоды не найдены',
    stores: 'Магазины не найдены',
    error: 'Что-то пошло не так'
  };

  const defaultSubmessages = {
    search: 'Попробуйте изменить поисковый запрос',
    promos: 'Попробуйте выбрать другую категорию или магазин',
    stores: 'В данный момент нет доступных магазинов',
    error: 'Попробуйте перезагрузить страницу'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4 text-center">
      <div className="glass-card p-8 sm:p-12 max-w-md w-full">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white/40" />
        </div>

        <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">
          {message || defaultMessages[type]}
        </h3>

        <p className="text-white/60 mb-6 sm:mb-8 text-sm sm:text-base">
          {submessage || defaultSubmessages[type]}
        </p>

        {actionText && actionHref && (
          <Link
            href={actionHref}
            className="view-all-btn"
          >
            {actionText}
          </Link>
        )}
      </div>
    </div>
  );
}

// Специализированные Empty States
export function EmptySearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      type="search"
      message={`По запросу "${query}" ничего не найдено`}
      submessage="Попробуйте использовать другие ключевые слова"
      actionText="На главную"
      actionHref="/"
    />
  );
}

export function EmptyPromoList() {
  return (
    <EmptyState
      type="promos"
      message="Пока нет доступных промокодов"
      submessage="Скоро здесь появятся выгодные предложения"
      actionText="Посмотреть все промокоды"
      actionHref="/"
    />
  );
}

export function ErrorState({ retry }: { retry?: () => void }) {
  return (
    <EmptyState
      type="error"
      message="Не удалось загрузить данные"
      submessage="Проверьте подключение к интернету"
      actionText={retry ? "Попробовать снова" : "На главную"}
      actionHref={retry ? "#" : "/"}
    />
  );
}
