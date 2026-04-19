function hex(n: number): string {
  return n.toString(16).padStart(2, '0')
}

/**
 * Short, grep-friendly correlation ID for the `X-Request-ID` header.
 * Format: `<8-hex>-<ts-base36>`. Purely for log correlation — not a UUID.
 */
export function generateRequestId(): string {
  const bytes = new Uint8Array(4)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  const rand = Array.from(bytes, hex).join('')
  return `${rand}-${Date.now().toString(36)}`
}

/**
 * Cryptographically random UUID v4 — REQUIRED format for `Idempotency-Key`.
 * Backend rejects anything that doesn't match UUID v4 with HTTP 422.
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  // RFC 4122 v4
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const h = Array.from(bytes, hex).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
