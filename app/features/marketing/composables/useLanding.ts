/**
 * Composable for fetching landing page CMS data from the backend.
 * Falls back to null on error so components can use their hardcoded defaults.
 */
export function useLanding() {
  const api = useApi()

  /** Fetch all landing page content (public, no auth required) */
  async function getLanding() {
    try {
      const data = await api.get<{ data: LandingData }>('/landing')
      return data.data
    } catch {
      return null
    }
  }

  /** Admin: fetch landing settings for editing */
  async function getAdminLanding() {
    return api.get<{ data: LandingData }>('/admin/landing')
  }

  /** Admin: update landing settings */
  async function updateLanding(payload: Partial<LandingData>) {
    return api.put<{ data: LandingData }>('/admin/landing', payload)
  }

  /** Admin: CRUD for testimonials */
  async function getTestimonials(params?: { page?: number }) {
    return api.get<PaginatedResponse<Testimonial>>(`/admin/testimonials${params?.page ? `?page=${params.page}` : ''}`)
  }
  async function createTestimonial(payload: Partial<Testimonial>) {
    return api.post<{ data: Testimonial }>('/admin/testimonials', payload)
  }
  async function updateTestimonial(id: number, payload: Partial<Testimonial>) {
    return api.put<{ data: Testimonial }>(`/admin/testimonials/${id}`, payload)
  }
  async function deleteTestimonial(id: number) {
    return api.delete(`/admin/testimonials/${id}`)
  }

  /** Admin: CRUD for FAQs */
  async function getFaqs(params?: { page?: number }) {
    return api.get<PaginatedResponse<FaqItem>>(`/admin/faqs${params?.page ? `?page=${params.page}` : ''}`)
  }
  async function createFaq(payload: Partial<FaqItem>) {
    return api.post<{ data: FaqItem }>('/admin/faqs', payload)
  }
  async function updateFaq(id: number, payload: Partial<FaqItem>) {
    return api.put<{ data: FaqItem }>(`/admin/faqs/${id}`, payload)
  }
  async function deleteFaq(id: number) {
    return api.delete(`/admin/faqs/${id}`)
  }

  /** Admin: CRUD for plans */
  async function getPlans(params?: { page?: number }) {
    return api.get<PaginatedResponse<Plan>>(`/admin/plans${params?.page ? `?page=${params.page}` : ''}`)
  }
  async function createPlan(payload: Partial<Plan>) {
    return api.post<{ data: Plan }>('/admin/plans', payload)
  }
  async function updatePlan(id: number, payload: Partial<Plan>) {
    return api.put<{ data: Plan }>(`/admin/plans/${id}`, payload)
  }
  async function deletePlan(id: number) {
    return api.delete(`/admin/plans/${id}`)
  }

  /** Public: fetch plans for pricing display */
  async function getPublicPlans() {
    try {
      const data = await api.get<{ data: Plan[] }>('/plans')
      return data.data
    } catch {
      return null
    }
  }

  return {
    getLanding,
    getAdminLanding,
    updateLanding,
    getTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    getFaqs,
    createFaq,
    updateFaq,
    deleteFaq,
    getPlans,
    createPlan,
    updatePlan,
    deletePlan,
    getPublicPlans,
  }
}

// Types
export interface LandingData {
  hero: {
    badge: { ar: string; en: string }
    title1: { ar: string; en: string }
    title2: { ar: string; en: string }
    subtitle: { ar: string; en: string }
  }
  stats: {
    firms: string
    invoices: string
    uptime: string
  }
  features: LandingFeature[]
}

export interface LandingFeature {
  id?: number
  title: { ar: string; en: string }
  description: { ar: string; en: string }
  icon: string
  sort_order: number
}

export interface Testimonial {
  id: number
  name: { ar: string; en: string }
  role: { ar: string; en: string }
  quote: { ar: string; en: string }
  rating: number
  is_active: boolean
  sort_order: number
}

export interface FaqItem {
  id: number
  question: { ar: string; en: string }
  answer: { ar: string; en: string }
  is_active: boolean
  sort_order: number
}

export interface Plan {
  id: number
  name: { ar: string; en: string }
  description: { ar: string; en: string }
  monthly_price: number
  yearly_price: number
  currency: string
  is_popular: boolean
  is_active: boolean
  features: { ar: string[]; en: string[] }
  limits: {
    clients: number | null
    invoices: number | null
    users: number | null
  }
  sort_order: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}
