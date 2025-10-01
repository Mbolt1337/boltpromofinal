'use client'

import React from 'react'
import { Flame, Home, Gift, Zap } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <div className="container-main">
            <div className="glass-card p-12 text-center max-w-2xl mx-auto shadow-glass">
              {/* Иконка */}
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Gift className="w-10 h-10 text-white" />
              </div>
              
              {/* Заголовок */}
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Упс! Что-то пошло не так
              </h1>
              
              {/* Описание */}
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Но не переживайте! У нас есть тысячи выгодных промокодов и скидок, 
                которые ждут вас на главной странице.
              </p>
              
              {/* Детали ошибки (только в development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-8 p-4 glass-card border border-red-500/20 bg-red-500/5 text-left">
                  <p className="text-red-400 text-sm font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              {/* Действия */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:border-green-500/50 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Home className="w-5 h-5 mr-2" />
                  <span>На главную</span>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/hot'}
                  className="inline-flex items-center px-8 py-4 glass-button-small rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Flame className="w-5 h-5 mr-2" />
                  <span>Горячие промокоды</span>
                </button>
              </div>

              {/* Призыв к действию */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span>1000+ промокодов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-blue-400" />
                    <span>Проверенные скидки</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>Ежедневные обновления</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary