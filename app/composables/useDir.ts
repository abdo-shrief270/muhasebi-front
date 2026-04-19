/**
 * Directional state for the current request/session. Matches §5.1 of
 * docs/UI_UX_SPEC.md — `<html dir>` is set pre-hydration by the
 * `setDirection` plugin; this composable is the read-only accessor.
 */
export type Direction = 'rtl' | 'ltr'

export function useDir() {
  const { locale } = useI18n()

  const dir = computed<Direction>(() =>
    locale.value === 'ar' ? 'rtl' : 'ltr',
  )

  const isRtl = computed(() => dir.value === 'rtl')
  const isLtr = computed(() => dir.value === 'ltr')

  return { dir, isRtl, isLtr }
}
