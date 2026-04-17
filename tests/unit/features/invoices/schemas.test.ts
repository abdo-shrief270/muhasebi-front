import { describe, it, expect } from 'vitest'
import { invoiceFormSchema, invoiceLineSchema, paymentFormSchema } from '~/features/invoices/schemas'

const validLine = { description: 'Consulting', quantity: 2, unit_price: 100, discount_percent: 0, vat_rate: 14 }

describe('invoiceLineSchema', () => {
  it('parses a valid line', () => {
    const r = invoiceLineSchema.safeParse(validLine)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.quantity).toBe(2)
  })

  it('coerces numeric strings', () => {
    const r = invoiceLineSchema.safeParse({ ...validLine, quantity: '3', unit_price: '50.5' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.unit_price).toBe(50.5)
  })

  it('rejects non-numeric strings', () => {
    const r = invoiceLineSchema.safeParse({ ...validLine, quantity: 'abc' })
    expect(r.success).toBe(false)
  })

  it('rejects quantity <= 0', () => {
    const r = invoiceLineSchema.safeParse({ ...validLine, quantity: 0 })
    expect(r.success).toBe(false)
  })

  it('rejects discount > 100', () => {
    const r = invoiceLineSchema.safeParse({ ...validLine, discount_percent: 120 })
    expect(r.success).toBe(false)
  })

  it('requires a description', () => {
    const r = invoiceLineSchema.safeParse({ ...validLine, description: '' })
    expect(r.success).toBe(false)
  })
})

describe('invoiceFormSchema', () => {
  const base = {
    client_id: 1,
    date: '2026-04-18',
    due_date: '2026-05-18',
    notes: '',
    terms: '',
    lines: [validLine],
  }

  it('parses a valid form', () => {
    expect(invoiceFormSchema.safeParse(base).success).toBe(true)
  })

  it('rejects missing client_id', () => {
    const { client_id, ...rest } = base
    const r = invoiceFormSchema.safeParse(rest)
    expect(r.success).toBe(false)
  })

  it('rejects empty lines', () => {
    const r = invoiceFormSchema.safeParse({ ...base, lines: [] })
    expect(r.success).toBe(false)
  })
})

describe('paymentFormSchema', () => {
  const base = {
    invoice_id: 1,
    amount: 100,
    date: '2026-04-18',
    method: 'bank_transfer' as const,
    reference: 'REF-1',
    notes: '',
  }

  it('parses a valid payment', () => {
    expect(paymentFormSchema.safeParse(base).success).toBe(true)
  })

  it('rejects unknown method', () => {
    const r = paymentFormSchema.safeParse({ ...base, method: 'bitcoin' })
    expect(r.success).toBe(false)
  })

  it('rejects zero amount', () => {
    const r = paymentFormSchema.safeParse({ ...base, amount: 0 })
    expect(r.success).toBe(false)
  })
})
