import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useIdempotencyStore } from '~/stores/idempotency'

describe('useIdempotencyStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-19T10:00:00Z'))
  })

  it('returns the same key for the same actionId within TTL', () => {
    const store = useIdempotencyStore()
    const first  = store.keyFor('post-invoice-42')
    const second = store.keyFor('post-invoice-42')
    expect(first).toBe(second)
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('returns different keys for different actionIds', () => {
    const store = useIdempotencyStore()
    const a = store.keyFor('post-invoice-42')
    const b = store.keyFor('post-invoice-43')
    expect(a).not.toBe(b)
  })

  it('rotates the key after the 30s TTL expires', () => {
    const store = useIdempotencyStore()
    const first = store.keyFor('post-invoice-42')
    vi.advanceTimersByTime(31_000)
    const second = store.keyFor('post-invoice-42')
    expect(second).not.toBe(first)
  })

  it('release() forgets a cached key', () => {
    const store = useIdempotencyStore()
    const first = store.keyFor('post-invoice-42')
    store.release('post-invoice-42')
    const second = store.keyFor('post-invoice-42')
    expect(second).not.toBe(first)
  })

  it('clear() empties the entire cache', () => {
    const store = useIdempotencyStore()
    const a = store.keyFor('post-invoice-42')
    const b = store.keyFor('post-invoice-43')
    store.clear()
    expect(store.keyFor('post-invoice-42')).not.toBe(a)
    expect(store.keyFor('post-invoice-43')).not.toBe(b)
  })
})
