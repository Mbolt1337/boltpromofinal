import { SITE_CONFIG } from '@/lib/seo'

interface OrganizationJsonLdProps {
  logoUrl?: string
}

export default function OrganizationJsonLd({ logoUrl }: OrganizationJsonLdProps) {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'BoltPromo',
    'url': SITE_CONFIG.url,
    'logo': logoUrl || `${SITE_CONFIG.url}/logo.png`,
    'description': 'Ведущая платформа промокодов и скидок России. Более 1000 актуальных промокодов от 500+ проверенных магазинов.',
    'foundingDate': '2025',
    'contactPoint': {
      '@type': 'ContactPoint',
      'email': 'support@boltpromo.ru',
      'contactType': 'customer service',
      'availableLanguage': 'Russian'
    },
    'sameAs': [
      'https://t.me/BoltPromoBot',
      'https://t.me/boltpromomane'
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organization, null, 0) }}
    />
  )
}
