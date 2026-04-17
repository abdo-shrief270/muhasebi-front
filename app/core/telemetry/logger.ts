type Level = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  tenantId?: string
  featureId?: string
  userId?: number | string
  [key: string]: unknown
}

export interface TelemetrySink {
  log?: (level: Level, message: string, ctx: LogContext) => void
  capture?: (err: unknown, ctx: LogContext) => void
}

let sink: TelemetrySink = {}

export function setTelemetrySink(next: TelemetrySink) {
  sink = next
}

function baseContext(): LogContext {
  const tenantId = (() => { try { return useTenantId() } catch { return undefined } })() || undefined
  const userId = (() => { try { return useAuthStore().user?.id } catch { return undefined } })()
  return { tenantId, userId }
}

function emit(level: Level, message: string, ctx?: LogContext) {
  const fullCtx: LogContext = { ...baseContext(), ...ctx }
  const payload = { level, message, ts: new Date().toISOString(), ...fullCtx }
  if (level === 'error' || level === 'warn') console[level](payload)
  else if (import.meta.dev) console[level](payload)
  try { sink.log?.(level, message, fullCtx) } catch {}
}

export const logger = {
  debug: (m: string, c?: LogContext) => emit('debug', m, c),
  info:  (m: string, c?: LogContext) => emit('info', m, c),
  warn:  (m: string, c?: LogContext) => emit('warn', m, c),
  error: (m: string, c?: LogContext) => emit('error', m, c),
}

export function captureException(err: unknown, ctx?: LogContext) {
  const e = err as Error
  const fullCtx: LogContext = { ...baseContext(), ...ctx, stack: e?.stack, name: e?.name }
  emit('error', e?.message ?? 'unknown error', fullCtx)
  try { sink.capture?.(err, fullCtx) } catch {}
}
