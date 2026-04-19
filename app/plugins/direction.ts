/**
 * Pre-hydration direction / font-family sync — §5.1 of docs/UI_UX_SPEC.md.
 *
 * This plugin runs BOTH on the server (SSR) and the client, so the very
 * first paint already has `<html dir>` set. Without this, Arabic users
 * would flash an LTR layout before hydration completes.
 */
export default defineNuxtPlugin({
  name: 'muhasebi:direction',
  enforce: 'pre',
  setup() {
    const { applyHtmlAttrs, current } = useLocale()

    // Initial set (runs on client hydration + on SSR via useHead below).
    applyHtmlAttrs(current.value)

    // Keep in sync when the locale switches at runtime.
    watch(current, (next) => applyHtmlAttrs(next))

    // SSR: write lang + dir into the rendered html tag.
    useHead({
      htmlAttrs: {
        lang: current.value,
        dir: current.value === 'ar' ? 'rtl' : 'ltr',
        class: current.value === 'ar' ? 'font-sans-arabic' : 'font-sans-latin',
      },
    })
  },
})
