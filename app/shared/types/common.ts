export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  links?: { next?: string | null; prev?: string | null }
}

export interface SingleResponse<T> {
  data: T
}

export interface ApiValidationError {
  message: string
  errors: Record<string, string[]>
}
