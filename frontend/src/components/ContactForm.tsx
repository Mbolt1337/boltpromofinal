'use client'

import { useState } from 'react'
import { Send, Check, AlertCircle, Mail, User, MessageSquare } from 'lucide-react'
import { submitContactForm, type ContactFormData } from '@/lib/api'

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  // Валидация email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Введите ваше имя'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email адрес'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Введите корректный email адрес'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Укажите тему сообщения'
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Тема должна содержать минимум 5 символов'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Напишите ваше сообщение'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Сообщение должно содержать минимум 10 символов'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Обработка изменения полей
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Очищаем ошибку для поля при изменении
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  // ✅ ИСПРАВЛЕНО: Реальная отправка формы в Django API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // ✅ ИСПРАВЛЕНО: Отправляем данные в Django API
      const result = await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      })
      
      if (result.success) {
        setSubmitStatus('success')
        setSubmitMessage(result.message)
        setFormData({ name: '', email: '', subject: '', message: '' })
        
        // Автосброс статуса через 5 секунд
        setTimeout(() => setSubmitStatus('idle'), 5000)
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.message)
        
        // Автосброс статуса через 5 секунд
        setTimeout(() => setSubmitStatus('idle'), 5000)
      }
      
    } catch (error) {
      console.error('Ошибка отправки формы:', error)
      setSubmitStatus('error')
      setSubmitMessage('Произошла неожиданная ошибка. Попробуйте позже.')
      
      // Автосброс статуса через 5 секунд
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Успешная отправка */}
      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-300 font-medium">Сообщение отправлено!</p>
            <p className="text-green-400 text-sm">{submitMessage}</p>
          </div>
        </div>
      )}

      {/* Ошибка отправки */}
      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-medium">Ошибка отправки</p>
            <p className="text-red-400 text-sm">{submitMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Имя */}
        <div>
          <label htmlFor="name" className="block text-white font-medium mb-2">
            Ваше имя *
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`pl-12 pr-4 py-3 w-full glass-input rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                errors.name 
                  ? 'border-red-500/50 focus:ring-red-500/20' 
                  : 'focus:ring-white/20'
              }`}
              placeholder="Введите ваше имя"
              disabled={isSubmitting}
            />
          </div>
          {errors.name && (
            <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-white font-medium mb-2">
            Email адрес *
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`pl-12 pr-4 py-3 w-full glass-input rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                errors.email 
                  ? 'border-red-500/50 focus:ring-red-500/20' 
                  : 'focus:ring-white/20'
              }`}
              placeholder="your@email.com"
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Тема */}
        <div>
          <label htmlFor="subject" className="block text-white font-medium mb-2">
            Тема сообщения *
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`px-4 py-3 w-full glass-input rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.subject 
                ? 'border-red-500/50 focus:ring-red-500/20' 
                : 'focus:ring-white/20'
            }`}
            disabled={isSubmitting}
          >
            <option value="" className="bg-gray-800 text-gray-400">Выберите тему...</option>
            <option value="Вопрос о промокодах" className="bg-gray-800 text-white">Вопрос о промокодах</option>
            <option value="Техническая проблема" className="bg-gray-800 text-white">Техническая проблема</option>
            <option value="Партнерство" className="bg-gray-800 text-white">Партнерство</option>
            <option value="Предложение сотрудничества" className="bg-gray-800 text-white">Предложение сотрудничества</option>
            <option value="Жалоба на магазин" className="bg-gray-800 text-white">Жалоба на магазин</option>
            <option value="Другое" className="bg-gray-800 text-white">Другое</option>
          </select>
          {errors.subject && (
            <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.subject}
            </p>
          )}
        </div>

        {/* Сообщение */}
        <div>
          <label htmlFor="message" className="block text-white font-medium mb-2">
            Ваше сообщение *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className={`pl-12 pr-4 py-3 w-full glass-input rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
                errors.message 
                  ? 'border-red-500/50 focus:ring-red-500/20' 
                  : 'focus:ring-white/20'
              }`}
              placeholder="Расскажите подробнее о вашем вопросе или проблеме..."
              disabled={isSubmitting}
            />
          </div>
          {errors.message && (
            <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.message}
            </p>
          )}
        </div>

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-blue-300 hover:text-blue-200 font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
              <span>Отправляем...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Отправить сообщение</span>
            </>
          )}
        </button>

        {/* Примечание */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-gray-400 text-sm">
            <strong>Примечание:</strong> Поля отмеченные звездочкой (*) обязательны для заполнения. 
            Мы отвечаем на все сообщения в течение 24 часов в рабочие дни.
          </p>
        </div>
      </form>
    </div>
  )
}