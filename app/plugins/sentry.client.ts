import { logger, setTelemetrySink } from '~/core/telemetry/logger'

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const dsn = config.public.sentryDsn as string
  if (!dsn) return

  let Sentry: any
  try {
    Sentry = await import('@sentry/vue')
  } catch {
    logger.warn('sentry_dsn_set_but_sdk_missing', { hint: 'pnpm add @sentry/vue' })
    return
  }

  Sentry.init({
    app: nuxtApp.vueApp,
    dsn,
    environment: config.public.appEnv as string || 'development',
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
  })

  const authStore = useAuthStore()
  watchEffect(() => {
    Sentry.setUser(authStore.user ? { id: authStore.user.id, email: authStore.user.email } : null)
    const tenantId = useTenantId()
    if (tenantId) Sentry.setTag('tenant_id', tenantId)
  })

  setTelemetrySink({
    log(level, message, ctx) {
      if (level === 'error' || level === 'warn') {
        Sentry.captureMessage(message, { level, extra: ctx })
      }
    },
    capture(err, ctx) {
      Sentry.captureException(err, { extra: ctx })
    },
  })
})
