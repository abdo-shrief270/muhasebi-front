/**
 * Keep Nuxt UI's `useColorMode()` in lock-step with the ui store's
 * `colorMode` preference — §4 of docs/UI_UX_SPEC.md.
 *
 * The store is the source of truth for user intent ('system' | 'light' | 'dark').
 * `useColorMode()` applies it to `<html class="dark">` at render time.
 */
import { useUiStore } from '~/stores/ui'

export default defineNuxtPlugin(() => {
  const ui = useUiStore()
  const mode = useColorMode()

  // Seed Nuxt UI's runtime mode from the persisted preference.
  mode.preference = ui.colorMode

  // Keep them in sync both ways. Store → Nuxt UI.
  watch(
    () => ui.colorMode,
    (next) => { mode.preference = next },
  )
})
