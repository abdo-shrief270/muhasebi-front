/**
 * Marketing-site composable. Adapts the REAL backend shapes (verified against
 * api.muhasebi.com on 2026-04-19) to the bilingual-first shape the landing
 * components (Pricing.vue, Features.vue, Hero.vue, Testimonials.vue, Faq.vue)
 * already consume. Keeping the adapter here means components don't need to
 * learn backend idiosyncrasies (price as string, separate name_en/name_ar, etc).
 *
 * Endpoints that 500 or 404 today (documented in BACKEND_QUESTIONS §):
 *   - /landing          → 500 (server_error). Components receive null + render fallbacks.
 *   - /testimonials     → 404 (not implemented). Returns [].
 *   - /faqs             → 404 (not implemented). Returns [].
 *   - /pages/{not-terms/privacy} → 404. Only terms + privacy CMS pages exist today.
 */
import type { PublicPlan, BilingualText } from '~/features/marketing/services/marketingService'

export interface LandingData {
  hero: {
    badge: BilingualText
    title1: BilingualText
    title2: BilingualText
    subtitle: BilingualText
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
  title: BilingualText
  description: BilingualText
  icon: string
  sort_order: number
}

export interface Testimonial {
  id: number
  name: BilingualText
  role: BilingualText
  quote: BilingualText
  rating: number
  is_active: boolean
  sort_order: number
}

export interface FaqItem {
  id: number
  question: BilingualText
  answer: BilingualText
  is_active: boolean
  sort_order: number
}

/** Adapter-friendly shape: bilingual names + derived bilingual feature bullets so Pricing.vue unchanged. */
export interface Plan {
  id: number
  slug: string
  name: BilingualText
  description: BilingualText
  monthly_price: number
  yearly_price: number
  currency: string
  is_popular: boolean
  is_active: boolean
  /** Raw enabled flag slugs (authoritative). */
  enabled_features: string[]
  /** Marketing-bullet labels derived from enabled_features. Empty for disabled flags. */
  features: { ar: string[]; en: string[] }
  limits: {
    max_users: number | null
    max_clients: number | null
    max_invoices_per_month: number | null
    max_storage_bytes: number | null
  }
  sort_order: number
}

/** Feature-flag → marketing-bullet label. Keep in sync with FEATURE_FLAGS catalog. */
const FLAG_LABELS: Record<string, BilingualText> = {
  accounting:       { ar: 'محاسبة وقيود يومية', en: 'Accounting & journal entries' },
  api_access:       { ar: 'واجهة API للدمج', en: 'Developer API access' },
  audit_log:        { ar: 'سجل التدقيق الكامل', en: 'Full audit log' },
  banking:          { ar: 'تسوية بنكية', en: 'Bank reconciliation' },
  bills_vendors:    { ar: 'الفواتير والموردون', en: 'Bills & vendors' },
  budgeting:        { ar: 'إعداد الموازنات', en: 'Budgeting' },
  clients:          { ar: 'إدارة العملاء', en: 'Client management' },
  client_portal:    { ar: 'بوابة العملاء', en: 'Client portal' },
  collections:      { ar: 'إدارة التحصيل', en: 'Collections management' },
  cost_centers:     { ar: 'مراكز التكلفة', en: 'Cost centers' },
  custom_reports:   { ar: 'تقارير مخصصة', en: 'Custom reports' },
  documents:        { ar: 'إدارة المستندات', en: 'Documents' },
  e_invoice:        { ar: 'الفاتورة الإلكترونية (ETA)', en: 'E-invoicing (ETA)' },
  ecommerce:        { ar: 'تكامل التجارة الإلكترونية', en: 'E-commerce integration' },
  expenses:         { ar: 'إدارة المصروفات', en: 'Expense management' },
  fixed_assets:     { ar: 'الأصول الثابتة والإهلاك', en: 'Fixed assets & depreciation' },
  inventory:        { ar: 'إدارة المخزون', en: 'Inventory management' },
  invoicing:        { ar: 'الفوترة والمدفوعات', en: 'Invoicing & payments' },
  payroll:          { ar: 'الرواتب والموظفين', en: 'Payroll & HR' },
  priority_support: { ar: 'دعم فني ذو أولوية', en: 'Priority support' },
  reports:          { ar: 'التقارير المالية', en: 'Financial reports' },
  tax:              { ar: 'إدارة الضرائب', en: 'Tax management' },
  timesheets:       { ar: 'الجداول الزمنية', en: 'Timesheets' },
}

function adaptPlan(p: PublicPlan): Plan {
  const enabled = Object.entries(p.features ?? {})
    .filter(([, v]) => v)
    .map(([k]) => k)
    .sort()
  const bullets = {
    ar: enabled.map(k => FLAG_LABELS[k]?.ar ?? k),
    en: enabled.map(k => FLAG_LABELS[k]?.en ?? k),
  }
  return {
    id: p.id,
    slug: p.slug,
    name: { ar: p.name_ar ?? '', en: p.name_en ?? '' },
    description: { ar: p.description_ar ?? '', en: p.description_en ?? '' },
    monthly_price: Number(p.price_monthly) || 0,
    yearly_price:  Number(p.price_annual)  || 0,
    currency: p.currency,
    is_popular: (p as any).is_popular ?? false,
    is_active: p.is_active,
    enabled_features: enabled,
    features: bullets,
    limits: {
      max_users:              p.limits?.max_users              ?? null,
      max_clients:            p.limits?.max_clients            ?? null,
      max_invoices_per_month: p.limits?.max_invoices_per_month ?? null,
      max_storage_bytes:      p.limits?.max_storage_bytes      ?? null,
    },
    sort_order: p.sort_order,
  }
}

export function useLanding() {
  const api = useApi()

  async function getLanding() {
    try {
      const data = await api.get<{ data: LandingData }>('/landing')
      return data.data
    } catch { return null }
  }

  async function getPublicPlans(): Promise<Plan[] | null> {
    try {
      const raw = await api.get<{ data: PublicPlan[] }>('/plans')
      return (raw.data ?? []).map(adaptPlan)
    } catch { return null }
  }

  async function getPublicTestimonials(): Promise<Testimonial[]> {
    try {
      const data = await api.get<{ data: Testimonial[] }>('/testimonials')
      return data.data ?? []
    } catch { return [] }
  }

  async function getPublicFaqs(): Promise<FaqItem[]> {
    try {
      const data = await api.get<{ data: FaqItem[] }>('/faqs')
      return data.data ?? []
    } catch { return [] }
  }

  return { getLanding, getPublicPlans, getPublicTestimonials, getPublicFaqs }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number }
}
