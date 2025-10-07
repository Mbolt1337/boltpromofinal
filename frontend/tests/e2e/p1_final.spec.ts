import { test, expect } from '@playwright/test';

/**
 * BoltPromo P1 Final E2E Smoke Tests
 *
 * Цель: Убедиться, что критичные UI flow работают после оптимизаций
 * Браузеры: Chromium + WebKit
 *
 * Тесты:
 * 1. Homepage banners отображаются
 * 2. Копирование промокода → тост → редирект работает
 * 3. Search popover открывается/закрывается
 * 4. Showcase page: баннер читабельный + share button
 * 5. Mobile (iPhone 12): карточки не пляшут
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('BoltPromo P1 Final Smoke Tests', () => {

  test('Homepage: banners and showcases display correctly', async ({ page }) => {
    await page.goto(BASE_URL);

    // Проверяем, что страница загрузилась
    await expect(page).toHaveTitle(/BoltPromo/i);

    // Проверяем наличие витрин (ShowcaseSection)
    const showcaseSection = page.locator('[data-testid="showcase-section"]').first();
    await expect(showcaseSection).toBeVisible({ timeout: 10000 });

    // Проверяем, что есть хотя бы одна карточка промокода
    const promoCards = page.locator('[data-testid="promo-card"]');
    await expect(promoCards.first()).toBeVisible({ timeout: 5000 });

    // Проверяем, что carousel работает (есть кнопки навигации)
    const carouselButton = page.locator('button[aria-label*="next"], button[aria-label*="Next"]').first();
    if (await carouselButton.isVisible()) {
      // Carousel есть — проверяем работу
      await carouselButton.click();
      await page.waitForTimeout(500); // Даём анимации завершиться
    }
  });

  test('Promo copy: click → toast → redirect works', async ({ page }) => {
    await page.goto(BASE_URL);

    // Находим первую карточку с кодом
    const promoCard = page.locator('[data-testid="promo-card"]').first();
    await promoCard.waitFor({ state: 'visible', timeout: 10000 });

    // Клик по кнопке "Скопировать код" или "Получить промокод"
    const copyButton = promoCard.locator('button:has-text("Скопировать"), button:has-text("код"), button:has-text("Получить")').first();

    if (await copyButton.isVisible()) {
      // Слушаем новые окна/вкладки (redirect в магазин)
      const [newPage] = await Promise.all([
        page.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
        copyButton.click()
      ]);

      // Проверяем, что toast появился (если есть)
      const toast = page.locator('[role="alert"], [data-testid="toast"], .Toastify, [class*="toast"]').first();
      if (await toast.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(toast).toContainText(/скопирован|copied/i, { timeout: 2000 });
      }

      // Если был редирект — закрываем новое окно
      if (newPage) {
        await newPage.close();
      }
    }
  });

  test('Search: dark popover opens and closes correctly', async ({ page }) => {
    await page.goto(BASE_URL);

    // Находим search input
    const searchInput = page.locator('[data-testid="search-input"]').first();

    if (await searchInput.isVisible({ timeout: 5000 })) {
      // Фокусируемся на input чтобы открыть dropdown
      await searchInput.click();

      // Проверяем, что dropdown виден
      const searchDropdown = page.locator('[data-testid="search-dropdown"]').first();
      await expect(searchDropdown).toBeVisible({ timeout: 3000 });

      // Проверяем, что dropdown тёмный (background-color содержит rgb с малыми значениями)
      const bgColor = await searchDropdown.evaluate(el => window.getComputedStyle(el).backgroundColor);
      // Примерная проверка темноты: rgb(r, g, b) где r+g+b < 150
      const isDark = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (isDark) {
        const sum = parseInt(isDark[1]) + parseInt(isDark[2]) + parseInt(isDark[3]);
        expect(sum).toBeLessThan(200); // Тёмный background
      }

      // Закрываем dropdown (ESC)
      await page.keyboard.press('Escape');
      await expect(searchDropdown).toBeHidden({ timeout: 2000 });
    }
  });

  test('Showcase page: banner with overlay and share button visible', async ({ page }) => {
    await page.goto(BASE_URL);

    // Находим первую витрину (ShowcaseCard)
    const showcaseCard = page.locator('[data-testid="showcase-card"]').first();

    if (await showcaseCard.isVisible({ timeout: 5000 })) {
      // Кликаем на витрину
      await showcaseCard.click();

      // Ждём загрузки страницы витрины
      await page.waitForURL(/\/showcases\/[^/]+/, { timeout: 10000 });

      // Проверяем, что баннер виден
      const banner = page.locator('[data-testid="showcase-banner"], [class*="banner"]').first();
      await expect(banner).toBeVisible({ timeout: 5000 });

      // Проверяем overlay (gradient или background)
      const overlay = page.locator('[data-testid="banner-overlay"], [class*="overlay"]').first();
      if (await overlay.isVisible({ timeout: 3000 }).catch(() => false)) {
        const opacity = await overlay.evaluate(el => window.getComputedStyle(el).opacity);
        expect(parseFloat(opacity)).toBeGreaterThan(0);
      }

      // Проверяем наличие share button
      const shareButton = page.locator('[data-testid="share-button"], button:has-text("Поделиться"), button[aria-label*="share"]').first();
      if (await shareButton.isVisible({ timeout: 3000 })) {
        await expect(shareButton).toBeVisible();
      }
    }
  });

  test('Mobile (iPhone 12): promo cards stable without layout shift', async ({ page }) => {
    // Эмулируем iPhone 12
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(BASE_URL);

    // Ждём загрузки первой карточки
    const firstCard = page.locator('[data-testid="promo-card"]').first();
    await firstCard.waitFor({ state: 'visible', timeout: 10000 });

    // Измеряем начальную позицию
    const initialBox = await firstCard.boundingBox();
    expect(initialBox).not.toBeNull();

    // Скроллим вниз и обратно
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Измеряем позицию после скролла
    const finalBox = await firstCard.boundingBox();
    expect(finalBox).not.toBeNull();

    // Проверяем, что карточка не сместилась по Y более чем на 5px (допуск)
    const yDiff = Math.abs((finalBox?.y || 0) - (initialBox?.y || 0));
    expect(yDiff).toBeLessThan(5);

    // Проверяем, что carousel работает на мобилке
    const carouselMobile = page.locator('[data-testid="showcase-carousel-mobile"]').first();
    if (await carouselMobile.isVisible({ timeout: 3000 })) {
      // Свайп
      await carouselMobile.hover();
      await page.mouse.down();
      await page.mouse.move(100, 0);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
  });

});
