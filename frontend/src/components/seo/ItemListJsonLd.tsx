import { getPromocodes } from '@/lib/api';
import { SITE_CONFIG } from '@/lib/seo';

/**
 * Server Component для генерации JSON-LD ItemList
 * Используется на главной странице для топ промокодов
 */
export default async function ItemListJsonLd({ limit = 10 }: { limit?: number }) {
  try {
    const promoResponse = await getPromocodes({
      page_size: limit,
      ordering: 'popular' // топ промокоды
    });

    const promos = promoResponse.results || [];

    if (promos.length === 0) {
      return null;
    }

    const itemListJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'Популярные промокоды и скидки',
      'description': 'Топ промокодов от популярных интернет-магазинов России',
      'numberOfItems': promos.length,
      'itemListElement': promos.map((promo, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Product',
          'name': promo.title,
          'url': `${SITE_CONFIG.url}/promo/${promo.id}`,
          'description': promo.description || promo.title,
          ...(promo.store && {
            'brand': {
              '@type': 'Brand',
              'name': promo.store.name
            }
          }),
          'offers': {
            '@type': 'Offer',
            'availability': promo.expires_at && new Date(promo.expires_at) < new Date()
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
            'url': `${SITE_CONFIG.url}/promo/${promo.id}`,
            ...(promo.expires_at && {
              'priceValidUntil': promo.expires_at
            })
          }
        }
      }))
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd, null, 0)
        }}
      />
    );
  } catch (error) {
    console.error('Error generating ItemList JSON-LD:', error);
    return null;
  }
}
