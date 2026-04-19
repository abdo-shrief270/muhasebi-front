/**
 * Direction / font-family sync — §5.1 of docs/UI_UX_SPEC.md.
 *
 * Plugins can't call `useI18n()` directly (it's setup-only). We reach into
 * `nuxtApp.$i18n` exposed by @nuxtjs/i18n instead. Runs BOTH on the server
 * (SSR) and the client, so the very first paint already has `<html dir>` set.
 */
export default defineNuxtPlugin({
  name: 'muhasebi:direction',
  dependsOn: ['i18n:plugin'],
  setup(nuxtApp) {
    const i18n = nuxtApp.$i18n as any
    if (!i18n) return

    const localeRef = i18n.locale as { value: string } & Ref<string>

    function apply(next: string) {
      const dir = next === 'ar' ? 'rtl' : 'ltr'
      const fontClass = next === 'ar' ? 'font-sans-arabic' : 'font-sans-latin'

      if (import.meta.client) {
        const html = document.documentElement
        html.setAttribute('lang', next)
        html.setAttribute('dir', dir)
        html.classList.toggle('font-sans-arabic', next === 'ar')
        html.classList.toggle('font-sans-latin', next !== 'ar')
      }
      // SSR: write lang + dir into the rendered html tag via useHead.
      useHead({
        htmlAttrs: { lang: next, dir, class: fontClass },
      })
    }

    apply(localeRef.value)

    watch(localeRef, (next) => apply(next))
  },
})
