import type { Client } from './client'

export interface InvoiceLine {
  id?: number
  description: string
  quantity: number | string
  unit_price: number | string
  discount_percent: number | string
  vat_rate: number | string
  line_total?: string
  vat_amount?: string
  total?: string
  account_id?: number | null
}

export interface Payment {
  id: number
  invoice_id: number
  amount: string
  date: string
  method: string
  reference: string | null
  notes: string | null
  created_at: string
}

export interface Invoice {
  id: number
  invoice_number: string
  type: 'invoice' | 'credit_note' | 'debit_note'
  date: string
  due_date: string | null
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'
  client_id: number
  subtotal: string
  discount_amount: string
  vat_amount: string
  total: string
  amount_paid: string
  balance_due: number
  currency: string
  notes: string | null
  terms: string | null
  sent_at: string | null
  cancelled_at: string | null
  journal_entry_id: number | null
  created_at: string
  client?: Client
  lines?: InvoiceLine[]
  payments?: Payment[]
}

export interface InvoiceForm {
  client_id: number | null
  date: string
  due_date: string
  notes: string
  terms: string
  lines: {
    description: string
    quantity: number | string
    unit_price: number | string
    discount_percent: number | string
    vat_rate: number | string
  }[]
}

export interface PaymentForm {
  invoice_id: number
  amount: number | string
  date: string
  method: string
  reference: string
  notes: string
}
