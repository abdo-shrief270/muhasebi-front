/**
 * Canonical locale composable — §5.1 of docs/UI_UX_SPEC.md.
 * Also applies the font-family class to `<html>` per §3.2.
 */
export type SupportedLocale = 'ar' | 'en'

export function useLocale() {
  const { locale, setLocale, locales } = useI18n()

  const current = computed<SupportedLocale>(() => (locale.value as SupportedLocale))
  const isArabic = computed(() => current.value === 'ar')

  function applyHtmlAttrs(next: SupportedLocale = current.value) {
    if (!import.meta.client) return
    const html = document.documentElement
    html.setAttribute('lang', next)
    html.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr')
    html.classList.toggle('font-sans-arabic', next === 'ar')
    html.classList.toggle('font-sans-latin', next !== 'ar')
  }

  async function switchTo(next: SupportedLocale) {
    await setLocale(next)
    applyHtmlAttrs(next)
  }

  return { current, isArabic, locales, applyHtmlAttrs, switchTo }
}
