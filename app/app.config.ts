/**
 * Nuxt UI v4 theme aliases — §3.1 / §6 of docs/UI_UX_SPEC.md.
 * Raw color scales come from `app/assets/css/tokens.css`; this file
 * just tells Nuxt UI which scales play which semantic roles.
 *
 * Keep this file tiny. Everything visual lives in tokens.css.
 */
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      neutral: 'neutral',
      success: 'success',
      warning: 'warning',
      error:   'danger',
      info:    'info',
    },
    icons: {
      // Lucide is the single source. Do not mix icon sets (§6).
      loading:      'i-lucide-loader-2',
      chevronDown:  'i-lucide-chevron-down',
      chevronLeft:  'i-lucide-chevron-left',
      chevronRight: 'i-lucide-chevron-right',
      close:        'i-lucide-x',
      search:       'i-lucide-search',
      check:        'i-lucide-check',
      menu:         'i-lucide-menu',
    },
  },
})
