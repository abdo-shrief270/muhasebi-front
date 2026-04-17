export interface Client {
  id: number
  name: string
  trade_name: string | null
  tax_id: string | null
  commercial_register: string | null
  activity_type: string | null
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  contact_person: string | null
  contact_phone: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClientForm {
  name: string
  trade_name: string
  tax_id: string
  commercial_register: string
  activity_type: string
  address: string
  city: string
  phone: string
  email: string
  contact_person: string
  contact_phone: string
  notes: string
}

export interface PaginatedResponse<T> {
  data: T[]
  links: { first: string; last: string; prev: string | null; next: string | null }
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}
