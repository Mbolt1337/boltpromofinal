module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Оптимизация CSS только в production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          minifySelectors: true,
          minifyParams: true,
        }]
      }
    })
  },
}