import { defineStore } from 'pinia'

export interface QueuedMutation {
  id: string
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  body?: unknown
  createdAt: number
  attempts: number
}

const KEY = 'offline_mutation_queue'

function load(): QueuedMutation[] {
  if (!import.meta.client) return []
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function save(q: QueuedMutation[]) {
  if (!import.meta.client) return
  localStorage.setItem(KEY, JSON.stringify(q))
}

export const useOfflineQueue = defineStore('offlineQueue', () => {
  const queue = ref<QueuedMutation[]>(load())

  function enqueue(m: Omit<QueuedMutation, 'id' | 'createdAt' | 'attempts'>) {
    const item: QueuedMutation = { ...m, id: crypto.randomUUID(), createdAt: Date.now(), attempts: 0 }
    queue.value = [...queue.value, item]
    save(queue.value)
    return item
  }

  function remove(id: string) {
    queue.value = queue.value.filter(q => q.id !== id)
    save(queue.value)
  }

  async function flush() {
    if (!queue.value.length) return
    const api = useApi()
    const pending = [...queue.value]
    for (const item of pending) {
      try {
        await (api as any)[item.method.toLowerCase()](item.url, item.body)
        remove(item.id)
      } catch {
        item.attempts += 1
        save(queue.value)
        if (item.attempts > 5) remove(item.id)
      }
    }
  }

  return { queue, enqueue, remove, flush }
})
