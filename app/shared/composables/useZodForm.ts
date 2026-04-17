import { z, type ZodType } from 'zod'
import type { ApiError } from '~/core/api/errors'

type FieldErrors<T> = Partial<Record<keyof T & string, string>>

export interface UseZodFormOptions<T> {
  schema: ZodType<T>
  initial: T
}

export function useZodForm<T extends Record<string, unknown>>(opts: UseZodFormOptions<T>) {
  const values = reactive({ ...opts.initial }) as T
  const errors = ref<FieldErrors<T>>({})
  const submitting = ref(false)

  function setValues(patch: Partial<T>) {
    Object.assign(values, patch)
  }

  function reset() {
    Object.assign(values, opts.initial)
    errors.value = {}
  }

  function clearError(field: keyof T & string) {
    if (errors.value[field]) {
      const next = { ...errors.value }
      delete next[field]
      errors.value = next
    }
  }

  function validate(): { ok: true; data: T } | { ok: false; errors: FieldErrors<T> } {
    const parsed = opts.schema.safeParse(values)
    if (parsed.success) {
      errors.value = {}
      return { ok: true, data: parsed.data }
    }
    const fieldErrors: FieldErrors<T> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !fieldErrors[key as keyof T & string]) {
        fieldErrors[key as keyof T & string] = issue.message
      }
    }
    errors.value = fieldErrors
    return { ok: false, errors: fieldErrors }
  }

  function applyApiErrors(err: ApiError) {
    if (err.code !== 'validation' || !err.fieldErrors) return
    const next: FieldErrors<T> = {}
    for (const [field, msgs] of Object.entries(err.fieldErrors)) {
      next[field as keyof T & string] = Array.isArray(msgs) ? msgs[0] : String(msgs)
    }
    errors.value = next
  }

  async function handleSubmit(submit: (data: T) => Promise<unknown>) {
    const result = validate()
    if (!result.ok) return { ok: false as const, errors: result.errors }
    submitting.value = true
    try {
      await submit(result.data)
      return { ok: true as const }
    } catch (e) {
      applyApiErrors(e as ApiError)
      return { ok: false as const, error: e as ApiError }
    } finally {
      submitting.value = false
    }
  }

  return {
    values,
    errors,
    submitting,
    setValues,
    reset,
    clearError,
    validate,
    applyApiErrors,
    handleSubmit,
  }
}

export { z }
