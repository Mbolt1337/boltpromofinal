import { getSiteAssets } from '@/lib/api'

export default async function DynamicMetaTags() {
  let assets

  try {
    assets = await getSiteAssets()
  } catch (error) {
    console.error('[DynamicMetaTags] Failed to load site assets:', error)
    // Fallback to defaults
    assets = {
      theme_color: '#0b1020',
      background_color: '#0b1020'
    }
  }

  const {
    favicon_ico,
    favicon_16,
    favicon_32,
    apple_touch_icon,
    safari_pinned_svg,
    theme_color = '#0b1020',
    background_color = '#0b1020'
  } = assets

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

  return (
    <>
      {/* Favicon */}
      {favicon_ico && (
        <link
          rel="shortcut icon"
          href={`${baseUrl}${favicon_ico}`}
          type="image/x-icon"
        />
      )}
      {favicon_32 && (
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${baseUrl}${favicon_32}`}
        />
      )}
      {favicon_16 && (
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`${baseUrl}${favicon_16}`}
        />
      )}

      {/* Apple Touch Icon */}
      {apple_touch_icon && (
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${baseUrl}${apple_touch_icon}`}
        />
      )}

      {/* Safari Pinned Tab */}
      {safari_pinned_svg && (
        <link
          rel="mask-icon"
          href={`${baseUrl}${safari_pinned_svg}`}
          color={theme_color}
        />
      )}

      {/* Theme Color */}
      <meta name="theme-color" content={theme_color} />
      <meta name="msapplication-TileColor" content={background_color} />
    </>
  )
}
