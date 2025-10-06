# Примеры использования новых библиотек

## 📅 date-fns - Работа с датами

### Утилиты в `lib/date.ts`:

```tsx
import {
  formatRelativeTime,
  formatDate,
  formatDateTime,
  isExpiringSoon,
  isExpired,
  getUrgencyLevel,
  formatTimeUntilExpiry,
  getUrgencyColor
} from '@/lib/date'

// Пример использования в PromoCard
function PromoCard({ promo }) {
  const urgency = getUrgencyLevel(promo.expires_at)
  const urgencyColor = getUrgencyColor(urgency)

  return (
    <div>
      {/* Дата создания */}
      <p className="text-gray-400 text-sm">
        Добавлено {formatRelativeTime(promo.created_at)}
        {/* Результат: "2 дня назад" */}
      </p>

      {/* Срок истечения */}
      {promo.expires_at && (
        <div className={`badge ${urgencyColor}`}>
          {isExpired(promo.expires_at) ? (
            'Истек'
          ) : (
            <>
              Истекает {formatTimeUntilExpiry(promo.expires_at)}
              {/* Результат: "через 3 д" или "через 6 ч" */}
            </>
          )}
        </div>
      )}

      {/* Полная дата */}
      <p className="text-xs text-gray-500">
        Действует до {formatDate(promo.expires_at)}
        {/* Результат: "15 января 2025" */}
      </p>
    </div>
  )
}
```

### Цвета срочности:

```tsx
getUrgencyColor('critical')  // 'bg-red-500/20 text-red-300 border-red-500/30'
getUrgencyColor('urgent')    // 'bg-orange-500/20 text-orange-300 border-orange-500/30'
getUrgencyColor('soon')      // 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
getUrgencyColor('normal')    // 'bg-white/10 text-white/70 border-white/20'
```

---

## 🎬 framer-motion - Анимации

### Компонент `FadeIn`:

```tsx
import FadeIn from '@/components/animations/FadeIn'

// Простое появление снизу вверх
<FadeIn>
  <PromoCard promo={promo} />
</FadeIn>

// С задержкой
<FadeIn delay={0.2} direction="up">
  <h1>Заголовок</h1>
</FadeIn>

// Разные направления
<FadeIn direction="left">  // слева направо
<FadeIn direction="right"> // справа налево
<FadeIn direction="down">  // сверху вниз
<FadeIn direction="up">    // снизу вверх (по умолчанию)
<FadeIn direction="none">  // только fade без движения
```

### Компонент `StaggerChildren`:

Последовательное появление элементов списка:

```tsx
import FadeIn from '@/components/animations/FadeIn'
import StaggerChildren from '@/components/animations/StaggerChildren'

<StaggerChildren staggerDelay={0.1}>
  {promocodes.map((promo, i) => (
    <FadeIn key={promo.id} delay={i * 0.1}>
      <PromoCard promo={promo} />
    </FadeIn>
  ))}
</StaggerChildren>
```

### Пример для grid:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {promocodes.map((promo, index) => (
    <FadeIn
      key={promo.id}
      delay={index * 0.05} // Постепенное появление
      direction="up"
    >
      <PromoCard promo={promo} />
    </FadeIn>
  ))}
</div>
```

### Hover анимации (прямо в компоненте):

```tsx
import { motion } from 'framer-motion'

<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
  className="glass-card"
>
  <PromoCard />
</motion.div>
```

---

## 🪟 @radix-ui/react-dialog - Модальные окна

### Компонент `Modal`:

```tsx
import { useState } from 'react'
import Modal from '@/components/ui/Modal'

function PromoActions({ promo }) {
  const [showModal, setShowModal] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(promo.code)
    setShowModal(true)
  }

  return (
    <>
      <button onClick={handleCopy}>
        Скопировать код
      </button>

      <Modal
        open={showModal}
        onOpenChange={setShowModal}
        title="Промокод скопирован! 🎉"
        description="Код успешно скопирован в буфер обмена"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-2xl font-mono font-bold text-white mb-2">
              {promo.code}
            </p>
            <p className="text-sm text-white/70">
              Промокод от {promo.store.name}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.open(promo.link, '_blank')}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Перейти в магазин
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
```

### Размеры модального окна:

```tsx
<Modal size="sm">  // max-w-md
<Modal size="md">  // max-w-lg (по умолчанию)
<Modal size="lg">  // max-w-2xl
<Modal size="xl">  // max-w-4xl
```

### Без кнопки закрытия:

```tsx
<Modal
  open={open}
  onOpenChange={setOpen}
  showCloseButton={false}
  title="Важное уведомление"
>
  {/* Контент */}
</Modal>
```

---

## 🎯 Комбинированные примеры

### Анимированное модальное окно с датами:

```tsx
import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { formatDate, formatTimeUntilExpiry, getUrgencyColor, getUrgencyLevel } from '@/lib/date'

function PromoDetails({ promo }) {
  const [open, setOpen] = useState(false)
  const urgency = getUrgencyLevel(promo.expires_at)

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Подробнее
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={promo.title}
        size="lg"
      >
        <div className="space-y-4">
          {/* Срочность */}
          {promo.expires_at && (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${getUrgencyColor(urgency)}`}>
              ⏱️ Истекает {formatTimeUntilExpiry(promo.expires_at)}
            </div>
          )}

          {/* Описание */}
          <p className="text-white/80">{promo.description}</p>

          {/* Даты */}
          <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Действует до:</span>
              <span className="text-white">{formatDate(promo.expires_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Добавлен:</span>
              <span className="text-white">{formatDate(promo.created_at)}</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
```

### Анимированный список промокодов:

```tsx
import FadeIn from '@/components/animations/FadeIn'
import { formatRelativeTime, isExpiringSoon } from '@/lib/date'

function PromoList({ promocodes }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {promocodes.map((promo, index) => (
        <FadeIn
          key={promo.id}
          delay={index * 0.05}
          direction="up"
        >
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold mb-2">
              {promo.title}
            </h3>

            {/* Бейдж "скоро истекает" */}
            {isExpiringSoon(promo.expires_at) && (
              <span className="inline-block px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded">
                ⚡ Скоро истекает
              </span>
            )}

            {/* Относительное время */}
            <p className="text-sm text-white/60 mt-2">
              Добавлено {formatRelativeTime(promo.created_at)}
            </p>
          </div>
        </FadeIn>
      ))}
    </div>
  )
}
```

---

## 🚀 Рекомендации по применению

### Где добавить анимации:
- ✅ Главная страница - карточки промокодов
- ✅ Страница категории - список промокодов
- ✅ Страница магазина - grid промокодов
- ✅ Модальные окна при копировании кода

### Где использовать даты:
- ✅ PromoCard - бейдж срочности
- ✅ HotPromoCard - оставшееся время
- ✅ Детальная страница промокода
- ✅ Страница /hot - фильтрация по срочности

### Где использовать модальные окна:
- ✅ Подтверждение копирования промокода
- ✅ Детали промокода (вместо перехода)
- ✅ Форма обратной связи
- ✅ Уведомления об ошибках

---

Дата создания: 2025-10-06
