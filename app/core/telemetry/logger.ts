type Level = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  tenantId?: string
  featureId?: string
  userId?: number | string
  [key: string]: unknown
}

function baseContext(): LogContext {
  const tenantId = useTenantId?.() || undefined
  const userId = useAuthStore?.().user?.id
  return { tenantId, userId }
}

function emit(level: Level, message: string, ctx?: LogContext) {
  const payload = { level, message, ts: new Date().toISOString(), ...baseContext(), ...ctx }
  if (level === 'error' || level === 'warn') console[level](payload)
  else if (import.meta.dev) console[level](payload)
  // hook point: forward to Sentry / backend log ingestion
}

export const logger = {
  debug: (m: string, c?: LogContext) => emit('debug', m, c),
  info:  (m: string, c?: LogContext) => emit('info', m, c),
  warn:  (m: string, c?: LogContext) => emit('warn', m, c),
  error: (m: string, c?: LogContext) => emit('error', m, c),
}

export function captureException(err: unknown, ctx?: LogContext) {
  const e = err as Error
  emit('error', e?.message ?? 'unknown error', { ...ctx, stack: e?.stack, name: e?.name })
}
