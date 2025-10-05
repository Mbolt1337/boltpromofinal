/**
 * Unified toast notification helper
 * Uses sonner library for all toast notifications
 */

import { toast } from 'sonner'

export const showToast = {
  /**
   * Show success toast
   */
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
      position: 'bottom-center',
    })
  },

  /**
   * Show error toast
   */
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 4000,
      position: 'bottom-center',
    })
  },

  /**
   * Show info toast
   */
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3000,
      position: 'bottom-center',
    })
  },

  /**
   * Show promo code copied toast
   */
  promoCopied: (code: string, storeName: string) => {
    toast.success(`Промокод ${code} скопирован!`, {
      description: `Открываем ${storeName}...`,
      duration: 3000,
      position: 'bottom-center',
    })
  },
}
