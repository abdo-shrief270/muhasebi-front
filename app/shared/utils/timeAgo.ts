/**
 * Returns a human-readable relative time string.
 * Supports English and Arabic locales.
 */
export function timeAgo(dateStr: string, locale: string = 'en'): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return locale === 'ar' ? 'الآن' : 'just now'
  if (mins < 60) return locale === 'ar' ? `منذ ${mins} دقيقة` : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return locale === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  return locale === 'ar' ? `منذ ${days} يوم` : `${days}d ago`
}
