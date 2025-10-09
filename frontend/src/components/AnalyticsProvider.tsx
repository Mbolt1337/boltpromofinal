import Analytics from './Analytics'

/**
 * Серверный компонент для загрузки Analytics IDs из API
 * и передачи их в клиентский компонент Analytics
 */
export default async function AnalyticsProvider() {
  let yandexMetrikaId: string | null = null
  let gaMeasurementId: string | null = null

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${baseUrl}/api/v1/settings/`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (response.ok) {
      const settings = await response.json()
      yandexMetrikaId = settings.yandex_metrika_id
      gaMeasurementId = settings.ga_measurement_id
    }
  } catch (error) {
    console.error('[AnalyticsProvider] Failed to load analytics settings:', error)
  }

  // Не рендерим компонент если нет ни одного ID
  if (!yandexMetrikaId && !gaMeasurementId) {
    return null
  }

  return <Analytics yandexMetrikaId={yandexMetrikaId} gaMeasurementId={gaMeasurementId} />
}
