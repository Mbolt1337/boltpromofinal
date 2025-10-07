import { SITE_CONFIG } from '@/lib/seo'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbListJsonLdProps {
  items: BreadcrumbItem[]
}

export default function BreadcrumbListJsonLd({ items }: BreadcrumbListJsonLdProps) {
  if (!items || items.length === 0) return null

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.label,
      ...(item.href && {
        'item': item.href.startsWith('http')
          ? item.href
          : `${SITE_CONFIG.url}${item.href}`
      })
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList, null, 0) }}
    />
  )
}
