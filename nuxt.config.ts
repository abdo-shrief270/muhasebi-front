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
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
  ],

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
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://muhasebi.test/v1',
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

  tailwindcss: {
    config: {
      theme: {
        extend: {
          fontFamily: {
            cairo: ['Cairo', 'sans-serif'],
          },
          colors: {
            primary: {
              50: '#eef2f7', 100: '#d5dde8', 200: '#a8b8ce', 300: '#7b93b4', 400: '#4e6e9a',
              500: '#2c3e50', 600: '#243445', 700: '#1c293a', 800: '#141e2f', 900: '#0c1424',
            },
            secondary: {
              50: '#ebf5fc', 100: '#cee5f6', 200: '#9dcbee', 300: '#6cb1e5', 400: '#3498db',
              500: '#2980b9', 600: '#1f6897', 700: '#155075', 800: '#0b3853', 900: '#012031',
            },
          },
        },
      },
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
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },
})
