import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse } from '~/shared/types/common'

export interface PublicPlan {
  id: number
  slug: string
  name: string
  price_egp_monthly: number
  price_egp_yearly: number
  features: string[]
  limits: Record<string, number>
}

export interface LandingContent {
  hero: Record<string, unknown>
  modules: Array<Record<string, unknown>>
  testimonials: Array<Record<string, unknown>>
  blog_highlights: Array<Record<string, unknown>>
}

export interface CmsPage {
  slug: string
  title: string
  content: string
  meta_description: string | null
  updated_at: string
}

export interface ContactPayload {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export function marketingService() {
  const api = useApi()

  return {
    plans: () => api.get<{ data: PublicPlan[] }>(ENDPOINTS.public.plans).then(r => r.data),
    plan: (id: number | string) =>
      api.get<ItemResponse<PublicPlan>>(ENDPOINTS.public.plan(id)).then(r => r.data),
    landing: () =>
      api.get<ItemResponse<LandingContent>>(ENDPOINTS.public.landing).then(r => r.data),
    page: (slug: string) =>
      api.get<ItemResponse<CmsPage>>(ENDPOINTS.public.page(slug)).then(r => r.data),
    contact: (payload: ContactPayload, idempotencyKey?: string) =>
      api.post<{ message: string }>(ENDPOINTS.public.contact, payload, { idempotencyKey }),
    health: () => api.get<{ status: string }>(ENDPOINTS.public.health),
  }
}
