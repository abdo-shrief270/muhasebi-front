import { ApiError } from './errors'

interface QueryOptions<T> {
  key: string | (() => string)
  enabled?: Ref<boolean> | ComputedRef<boolean>
  staleMs?: number
  onError?: (err: ApiError) => void
}

interface CacheEntry<T> {
  data: T
  at: number
  inflight?: Promise<T>
}

const cache = new Map<string, CacheEntry<any>>()

export function invalidateQuery(key: string | RegExp) {
  if (typeof key === 'string') {
    cache.delete(key)
    return
  }
  for (const k of cache.keys()) if (key.test(k)) cache.delete(k)
}

export function useQuery<T>(fetcher: () => Promise<T>, opts: QueryOptions<T>) {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<ApiError | null>(null)
  const loading = ref(false)

  const keyOf = () => (typeof opts.key === 'function' ? opts.key() : opts.key)
  const stale = opts.staleMs ?? 30_000

  async function run(force = false) {
    const key = keyOf()
    const cached = cache.get(key)
    if (!force && cached && Date.now() - cached.at < stale) {
      data.value = cached.data
      return cached.data
    }
    if (cached?.inflight) return cached.inflight

    loading.value = true
    error.value = null
    const promise = (async () => {
      try {
        const result = await fetcher()
        cache.set(key, { data: result, at: Date.now() })
        data.value = result
        return result
      } catch (e) {
        const err = e as ApiError
        error.value = err
        opts.onError?.(err)
        throw err
      } finally {
        const c = cache.get(key)
        if (c) c.inflight = undefined
        loading.value = false
      }
    })()
    cache.set(key, { ...(cached ?? { data: undefined as any, at: 0 }), inflight: promise })
    return promise
  }

  const enabled = opts.enabled ?? ref(true)
  watchEffect(() => {
    if (unref(enabled)) run()
  })

  return {
    data,
    error,
    loading,
    refresh: () => run(true),
    invalidate: () => invalidateQuery(keyOf()),
  }
}

export function useMutation<TInput, TOutput>(mutator: (input: TInput) => Promise<TOutput>) {
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function mutate(input: TInput): Promise<TOutput> {
    loading.value = true
    error.value = null
    try {
      return await mutator(input)
    } catch (e) {
      error.value = e as ApiError
      throw e
    } finally {
      loading.value = false
    }
  }

  return { mutate, loading, error }
}
