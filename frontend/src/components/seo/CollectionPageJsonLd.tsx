import { SITE_CONFIG } from '@/lib/seo'

interface CollectionPageJsonLdProps {
  name: string
  description: string
  url: string
  numberOfItems: number
}

export default function CollectionPageJsonLd({
  name,
  description,
  url,
  numberOfItems
}: CollectionPageJsonLdProps) {
  const collectionPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': name,
    'description': description,
    'url': url.startsWith('http') ? url : `${SITE_CONFIG.url}${url}`,
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': numberOfItems
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPage, null, 0) }}
    />
  )
}
