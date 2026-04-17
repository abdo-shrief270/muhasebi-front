export function useLanding() {
  const api = useApi()

  async function getLanding() {
    try {
      const data = await api.get<{ data: LandingData }>('/landing')
      return data.data
    } catch { return null }
  }

  async function getPublicPlans() {
    try {
      const data = await api.get<{ data: Plan[] }>('/plans')
      return data.data
    } catch { return null }
  }

  async function getPublicTestimonials() {
    try {
      const data = await api.get<{ data: Testimonial[] }>('/testimonials')
      return data.data
    } catch { return [] }
  }

  async function getPublicFaqs() {
    try {
      const data = await api.get<{ data: FaqItem[] }>('/faqs')
      return data.data
    } catch { return [] }
  }

  return { getLanding, getPublicPlans, getPublicTestimonials, getPublicFaqs }
}

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
  meta: { current_page: number; last_page: number; total: number }
}
