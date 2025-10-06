import { Metadata } from 'next'
import MaintenanceContent from './MaintenanceContent'

export const metadata: Metadata = {
  title: 'Технические работы | BoltPromo',
  description: 'Сайт временно недоступен из-за технических работ',
  robots: 'noindex, nofollow',
}

export default function MaintenancePage() {
  return <MaintenanceContent />
}
