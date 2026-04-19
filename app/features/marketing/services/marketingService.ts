import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse } from '~/shared/types/common'

/** Bilingual text field — the backend uses this shape for every CMS/blog field. */
export interface BilingualText {
  ar: string | null
  en: string | null
}

/**
 * Real shape verified against `GET /api/v1/plans` on 2026-04-19.
 * Money fields are strings ("0.00"), not numbers (Laravel decimal serialization).
 * `features` is a Record<slug, boolean>, NOT a string[] of enabled slugs.
 */
export interface PublicPlan {
  id: number
  slug: string
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  /** Decimal string — parse with Number() or Intl.NumberFormat. */
  price_monthly: string
  price_annual: string
  currency: string
  trial_days: number
  limits: {
    max_users?: number | null
    max_clients?: number | null
    max_storage_bytes?: number | null
    max_invoices_per_month?: number | null
    [key: string]: number | null | undefined
  }
  /** Boolean map keyed by feature-flag slug (see core/subscription/flags.ts). */
  features: Record<string, boolean>
  is_active: boolean
  sort_order: number
}

/** `LandingContent` shape is backend-specific and the endpoint 500s as of 2026-04-19. */
export interface LandingContent {
  hero?: Record<string, unknown>
  stats?: Record<string, unknown>
  features?: Array<Record<string, unknown>>
  modules?: Array<Record<string, unknown>>
  testimonials?: Array<Record<string, unknown>>
  blog_highlights?: Array<Record<string, unknown>>
  [key: string]: unknown
}

export interface CmsPage {
  id: number
  slug: string
  title: BilingualText
  content: BilingualText
  meta_description?: BilingualText
  created_at?: string
  updated_at?: string
}

export interface ContactPayload {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy' | string
  checks: {
    database: 'ok' | 'error' | string
    cache: 'ok' | 'error' | string
    redis?: 'ok' | 'error' | string
    queue?: 'ok' | 'error' | string
    queue_size?: number
    storage?: 'ok' | 'error' | string
  }
  version: string
  timestamp: string
}

export function marketingService() {
  const api = useApi()

  return {
    plans: () =>
      api.get<{ data: PublicPlan[] }>(ENDPOINTS.public.plans).then(r => r.data),
    plan: (id: number | string) =>
      api.get<ItemResponse<PublicPlan>>(ENDPOINTS.public.plan(id)).then(r => r.data),
    landing: () =>
      api.get<ItemResponse<LandingContent>>(ENDPOINTS.public.landing).then(r => r.data),
    page: (slug: string) =>
      api.get<ItemResponse<CmsPage>>(ENDPOINTS.public.page(slug)).then(r => r.data),
    contact: (payload: ContactPayload, idempotencyKey?: string) =>
      api.post<{ message: string }>(ENDPOINTS.public.contact, payload, { idempotencyKey }),
    /** `/health` is NOT under /api/v1 base — this will 404 via the configured client. Use fetch directly if needed. */
    health: () => api.get<HealthCheck>(ENDPOINTS.public.health),
  }
}
