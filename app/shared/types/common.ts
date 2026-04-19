/**
 * Canonical response envelope shapes.
 *
 * The backend returns one of two shapes:
 *   1. `{ data: T }`         for single-item responses       → ItemResponse<T>
 *   2. `{ data: T[], meta }` for paginated list responses    → ListResponse<T>
 *
 * Services type their API calls with these and call `.then(r => r.data)`
 * to unwrap where a bare T is friendlier for consumers.
 */

export interface ItemResponse<T> {
  data: T
}

/**
 * Laravel's pagination meta. Verified against `GET /api/v1/blog` on 2026-04-19.
 * `links` here is the bootstrap-style page-nav array — DISTINCT from the
 * top-level `links` on ListResponse which carries first/last/next/prev URLs.
 */
export interface ListMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from?: number | null
  to?: number | null
  path?: string
  links?: Array<{ url: string | null; label: string; page: number | null; active: boolean }>
}

export interface ListLinks {
  first?: string
  last?: string
  next?: string | null
  prev?: string | null
}

export interface ListResponse<T> {
  data: T[]
  meta: ListMeta
  links?: ListLinks
}

/**
 * Laravel-style 422 body. Verified against real backend on 2026-04-19
 * (BACKEND_QUESTIONS 4.2): includes a top-level `error: "validation_error"` slug.
 * Keys in `errors` use dot-notation for nested array fields ("lines.0.quantity").
 */
export interface ApiValidationError {
  error?: 'validation_error' | string
  message: string
  errors: Record<string, string[]>
}

/** Baseline query params every list endpoint accepts. */
export interface BaseListParams {
  page?: number
  per_page?: number
  search?: string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  [key: string]: string | number | boolean | undefined
}

/** Back-compat alias — existing code imports PaginatedResponse. Don't remove. */
export type PaginatedResponse<T> = ListResponse<T>
