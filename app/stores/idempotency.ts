import { defineStore } from 'pinia'
import { generateIdempotencyKey } from '~/core/api/requestId'

// Caches the UUID v4 generated for a given action signature so a user who
// double-clicks a 'post invoice' button reuses the same Idempotency-Key and
// the backend dedup catches the duplicate. See spec section 13.2.
//
// Keys expire 30s after creation — matching the backend's idempotency window.
// Longer replays (tab refresh, navigation) get a fresh UUID, as intended.

interface Entry {
  key: string
  createdAt: number
}

const TTL_MS = 30_000

export const useIdempotencyStore = defineStore('idempotency', () => {
  const entries = ref<Record<string, Entry>>({})

  function pruneExpired(now: number) {
    for (const [id, entry] of Object.entries(entries.value)) {
      if (now - entry.createdAt > TTL_MS) delete entries.value[id]
    }
  }

  function keyFor(actionId: string): string {
    const now = Date.now()
    pruneExpired(now)
    const existing = entries.value[actionId]
    if (existing) return existing.key
    const key = generateIdempotencyKey()
    entries.value[actionId] = { key, createdAt: now }
    return key
  }

  function release(actionId: string) {
    delete entries.value[actionId]
  }

  function clear() {
    entries.value = {}
  }

  return { keyFor, release, clear }
})
