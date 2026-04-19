import { fileURLToPath } from 'node:url'
import { readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

function featureDirs(sub: string): string[] {
  const root = fileURLToPath(new URL('./app/features', import.meta.url))
  if (!existsSync(root)) return []
  return readdirSync(root, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => join(root, d.name, sub))
    .filter(existsSync)
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/fontaine',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
  ],

  /**
   * Tailwind v4 is bundled by @nuxt/ui via its preset.
   * Design tokens live in app/assets/css/tokens.css (via @theme),
   * Nuxt UI aliases live in app/app.config.ts.
   */
  css: ['~/assets/css/tokens.css'],

  ui: {
    // Nuxt UI v4 module options go here if needed.
  },

  colorMode: {
    classSuffix: '',
    storageKey: 'muhasebi-color-mode',
  },

  components: {
    dirs: [
      { path: '~/shared/ui', pathPrefix: false },
      ...featureDirs('components').map(path => ({ path, pathPrefix: false })),
      { path: '~/core/rbac', pathPrefix: false, pattern: '**/*.vue' },
      { path: '~/core/subscription', pathPrefix: false, pattern: '**/*.vue' },
      { path: '~/core/reliability', pathPrefix: false, pattern: '**/*.vue' },
    ],
  },

  imports: {
    dirs: [
      'core/api',
      'core/auth',
      'core/tenant',
      'core/rbac',
      'core/subscription',
      'core/telemetry',
      'core/reliability',
      'shared/composables',
      'shared/utils',
      'features/*/composables',
      'features/*/services',
    ],
  },

  hooks: {
    'pages:extend'(pages) {
      const root = fileURLToPath(new URL('./app/features', import.meta.url))
      if (!existsSync(root)) return
      const features = readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory())

      function walk(dir: string, routeBase: string) {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const abs = join(dir, entry.name)
          if (entry.isDirectory()) {
            const seg = entry.name.replace(/^\[(\.\.\.)?([^\]]+)\]$/, (_, spread, name) => spread ? `:${name}(.*)*` : `:${name}`)
            walk(abs, routeBase === '/' ? `/${seg}` : `${routeBase}/${seg}`)
          } else if (entry.name.endsWith('.vue')) {
            const base = entry.name.replace(/\.vue$/, '')
            const seg = base === 'index'
              ? ''
              : base.replace(/^\[(\.\.\.)?([^\]]+)\]$/, (_, spread, name) => spread ? `:${name}(.*)*` : `:${name}`)
            const path = seg ? (routeBase === '/' ? `/${seg}` : `${routeBase}/${seg}`) : routeBase
            pages.push({ name: path.replace(/\//g, '-').replace(/^-/, '') || 'index', path, file: abs })
          }
        }
      }

      for (const f of features) {
        const pagesDir = join(root, f.name, 'pages')
        if (!existsSync(pagesDir)) continue
        walk(pagesDir, '/')
      }
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.muhasebi.com/api/v1',
      tenantId: process.env.NUXT_PUBLIC_TENANT_ID || '',
      primaryColor: process.env.NUXT_PUBLIC_PRIMARY_COLOR || '#2c3e50',
      secondaryColor: process.env.NUXT_PUBLIC_SECONDARY_COLOR || '#3498db',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
      appEnv: process.env.NUXT_PUBLIC_APP_ENV || 'development',
    },
  },

  i18n: {
    locales: [
      { code: 'ar', name: 'العربية', dir: 'rtl', file: 'ar.ts' },
      { code: 'en', name: 'English', dir: 'ltr', file: 'en.ts' },
    ],
    defaultLocale: 'ar',
    lazy: true,
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'ar',
    },
  },

  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        },
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'محاسبي - Muhasebi',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'نظام المحاسبة السحابي لمكاتب المحاسبة المصرية' },
        { name: 'theme-color', content: '#2c3e50' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          // Spec §3.2: Inter (Latin) + IBM Plex Sans Arabic + JetBrains Mono
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },
})
