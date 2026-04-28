import { fileURLToPath } from 'node:url'
import { readdirSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

function featureDirs(sub: string): string[] {
  const root = fileURLToPath(new URL('./app/features', import.meta.url))
  if (!existsSync(root)) return []
  return readdirSync(root, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => join(root, d.name, sub))
    .filter(existsSync)
}

/**
 * Read a feature's `routePrefix` from its feature.ts by regex. The hook runs
 * synchronously during config load so we can't dynamic-import the manifest.
 * Falls back to `/<folder-name>` so a feature without a manifest still mounts
 * under its folder name instead of colliding at `/`.
 */
function readFeatureRoutePrefix(featureDir: string, folderName: string): string {
  const manifest = join(featureDir, 'feature.ts')
  if (existsSync(manifest)) {
    const src = readFileSync(manifest, 'utf8')
    const m = /routePrefix\s*:\s*['"`]([^'"`]+)['"`]/.exec(src)
    if (m) return m[1]
  }
  return `/${folderName}`
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
      // Pages historically reference shared primitives as <UiAppButton>, <UiSlideOver>,
      // <UiPageHeader>, etc. The `Ui` prefix must be declared here — the files in
      // shared/ui/ are named AppButton.vue, SlideOver.vue, … without the prefix.
      { path: '~/shared/ui', prefix: 'Ui', pathPrefix: false },
      // The marketing landing page uses <LandingNavbar>, <LandingHero>, … style
      // references (features/marketing/pages/index.vue) but the files are
      // named Navbar.vue, Hero.vue, … without a prefix. Register the folder
      // once with the `Landing` prefix so those references resolve. The
      // unprefixed auto-registration via `featureDirs('components')` below
      // still picks them up as `<Navbar>`, `<Hero>`, … for any code that uses
      // the bare names.
      { path: '~/features/marketing/components', prefix: 'Landing', pathPrefix: false },
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
        const featureDir = join(root, f.name)
        const pagesDir = join(featureDir, 'pages')
        if (!existsSync(pagesDir)) continue
        // Respect each feature's routePrefix so `features/auth/pages/login.vue`
        // mounts at `/auth/login`, not `/login`, and the two dozen
        // `pages/index.vue` files don't all collide at `/`.
        const prefix = readFeatureRoutePrefix(featureDir, f.name)
        walk(pagesDir, prefix)
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

  // Vite 5+ blocks any Host header not on the allowlist. nginx proxies
  // muhasebi.com → 127.0.0.1:3000, so the public hostnames must be listed
  // or dev serves a "Blocked request" error instead of the app.
  vite: {
    server: {
      allowedHosts: ['muhasebi.com', 'www.muhasebi.com', 'api.muhasebi.com', 'localhost', '127.0.0.1'],
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
