export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Скелетон хлебных крошек */}
      <div className="container-main py-4 lg:py-6">
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-white/10 rounded w-12 sm:w-16 animate-shimmer"></div>
          <div className="h-3 w-3 bg-white/10 rounded-full animate-shimmer"></div>
          <div className="h-4 bg-white/10 rounded w-16 sm:w-20 animate-shimmer"></div>
          <div className="h-3 w-3 bg-white/10 rounded-full animate-shimmer"></div>
          <div className="h-4 bg-white/10 rounded w-20 sm:w-24 animate-shimmer"></div>
          <div className="h-3 w-3 bg-white/10 rounded-full animate-shimmer"></div>
          <div className="h-4 bg-white/10 rounded w-24 sm:w-32 animate-shimmer"></div>
        </div>
      </div>

      {/* Скелетон кнопки "Назад" */}
      <section className="pb-4">
        <div className="container-main">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-white/10 rounded animate-shimmer"></div>
            <div className="h-4 w-32 sm:w-40 bg-white/10 rounded animate-shimmer"></div>
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="pb-8 lg:pb-16">
        <div className="container-main">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr,300px] xl:grid-cols-[1fr,360px] gap-4 lg:gap-6">
            
            {/* Скелетон основного контента */}
            <div className="order-1 space-y-4 lg:space-y-6">
              
              {/* Скелетон HERO карточки */}
              <div className="glass-card p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
                
                {/* Хедер с логотипом */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 lg:mb-6">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex-shrink-0 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="h-6 sm:h-7 lg:h-8 bg-white/10 rounded w-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                      </div>
                      <div className="h-4 bg-white/10 rounded w-2/3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-white/10 rounded-full flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                </div>

                {/* Бейджи */}
                <div className="flex flex-wrap gap-2 lg:gap-3 mb-4 lg:mb-6">
                  <div className="h-6 w-32 sm:w-40 bg-white/10 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                  <div className="h-6 w-16 sm:w-20 bg-white/10 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                </div>

                {/* Скидка */}
                <div className="h-10 lg:h-12 w-32 sm:w-40 bg-white/10 rounded-xl mb-4 lg:mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                </div>

                {/* Описание */}
                <div className="space-y-3 mb-6 lg:mb-8">
                  <div className="h-4 bg-white/10 rounded w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                  <div className="h-4 bg-white/10 rounded w-5/6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                  <div className="h-4 bg-white/10 rounded w-4/6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                </div>

                {/* Кнопки */}
                <div className="space-y-3 mb-6">
                  <div className="h-12 lg:h-14 bg-white/10 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                  <div className="h-10 lg:h-12 bg-white/10 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                </div>

                {/* Статистика */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 lg:pt-6 border-t border-white/10">
                  <div className="h-4 w-24 sm:w-32 bg-white/10 rounded relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                  <div className="h-6 w-16 sm:w-20 bg-white/10 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                </div>
              </div>

              {/* Скелетон подробной информации */}
              <div className="glass-card p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
                
                <div className="h-6 lg:h-7 w-48 sm:w-56 bg-white/10 rounded mb-6 lg:mb-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                </div>
                
                <div className="space-y-6 lg:space-y-8">
                  {/* Блоки подробной информации */}
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="space-y-3 lg:space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/10 rounded-xl flex-shrink-0 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                        </div>
                        <div className="h-5 w-32 sm:w-40 bg-white/10 rounded relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                        </div>
                      </div>
                      <div className="pl-11 lg:pl-13 space-y-2">
                        <div className="h-4 bg-white/10 rounded w-full relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                        </div>
                        <div className="h-4 bg-white/10 rounded w-4/5 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                        </div>
                        {index === 3 && (
                          <div className="h-4 bg-white/10 rounded w-3/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Скелетон сайдбара */}
            <div className="order-0 lg:order-2 space-y-4 lg:space-y-6">
              
              {/* Скелетон "О магазине" */}
              <div className="glass-card p-4 lg:p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
                
                <div className="h-5 lg:h-6 w-24 sm:w-28 bg-white/10 rounded mb-4 lg:mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                </div>
                
                <div className="text-center space-y-3 lg:space-y-4">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/10 rounded-2xl lg:rounded-3xl mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 lg:h-6 w-32 sm:w-36 bg-white/10 rounded mx-auto relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    </div>
                    <div className="h-4 w-20 sm:w-24 bg-white/10 rounded mx-auto relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="h-12 lg:h-14 bg-white/10 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                </div>
              </div>

              {/* Скелетон статистики */}
              <div className="glass-card p-4 lg:p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
                
                <div className="h-5 lg:h-6 w-20 sm:w-24 bg-white/10 rounded mb-4 lg:mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                </div>
                
                <div className="space-y-3 lg:space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white/3 rounded-lg border border-white/10">
                      <div className="h-4 w-20 sm:w-24 bg-white/10 rounded relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                      </div>
                      <div className={`h-${index === 2 ? '6' : '4'} w-${index === 2 ? '16' : '8'} sm:w-${index === 2 ? '20' : '10'} bg-white/10 rounded${index === 2 ? '-full' : ''} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Скелетон похожих предложений */}
          <section className="mt-12 lg:mt-16" aria-label="Похожие предложения">
            <div className="text-center mb-8 lg:mb-12">
              <div className="h-7 lg:h-8 w-64 sm:w-80 bg-white/10 rounded mx-auto mb-3 lg:mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
              </div>
              <div className="h-4 lg:h-5 w-80 sm:w-96 bg-white/10 rounded mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card p-4 sm:p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex-shrink-0 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="h-4 bg-white/10 rounded w-3/4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                      </div>
                      <div className="h-3 bg-white/10 rounded w-1/2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-white/10 rounded w-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    </div>
                    <div className="h-3 bg-white/10 rounded w-5/6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="h-10 lg:h-12 bg-white/10 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}