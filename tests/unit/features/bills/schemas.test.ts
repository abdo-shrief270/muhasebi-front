import { describe, it, expect } from 'vitest'
import { billFormSchema, billLineSchema, billPaymentFormSchema } from '~/features/bills/schemas'

const validLine = {
  description: 'Office supplies',
  quantity: 10,
  unit_price: 50,
  account_id: 5100,
  vat_rate: 14,
}

const validBill = {
  vendor_id: 1,
  bill_number: 'V-2026-001',
  bill_date: '2026-04-18',
  due_date: '2026-05-18',
  currency: 'EGP',
  exchange_rate: 1,
  reference: '',
  notes: '',
  attachments: [],
  lines: [validLine],
}

describe('billLineSchema', () => {
  it('accepts a valid line', () => {
    expect(billLineSchema.safeParse(validLine).success).toBe(true)
  })

  it('rejects missing account_id', () => {
    const { account_id, ...rest } = validLine
    expect(billLineSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects negative quantity', () => {
    expect(billLineSchema.safeParse({ ...validLine, quantity: -1 }).success).toBe(false)
  })

  it('rejects VAT > 100', () => {
    expect(billLineSchema.safeParse({ ...validLine, vat_rate: 150 }).success).toBe(false)
  })
})

describe('billFormSchema', () => {
  it('accepts a valid bill', () => {
    expect(billFormSchema.safeParse(validBill).success).toBe(true)
  })

  it('rejects due date before bill date', () => {
    const r = billFormSchema.safeParse({ ...validBill, due_date: '2026-04-01' })
    expect(r.success).toBe(false)
  })

  it('rejects empty lines', () => {
    expect(billFormSchema.safeParse({ ...validBill, lines: [] }).success).toBe(false)
  })

  it('rejects missing bill_number', () => {
    expect(billFormSchema.safeParse({ ...validBill, bill_number: '' }).success).toBe(false)
  })
})

describe('billPaymentFormSchema', () => {
  const base = {
    amount: 500,
    payment_date: '2026-04-18',
    payment_method: 'bank_transfer' as const,
    reference: 'TXN-1',
    notes: '',
  }

  it('accepts a valid payment', () => {
    expect(billPaymentFormSchema.safeParse(base).success).toBe(true)
  })

  it('rejects unknown method', () => {
    const r = billPaymentFormSchema.safeParse({ ...base, payment_method: 'bitcoin' })
    expect(r.success).toBe(false)
  })

  it('rejects zero amount', () => {
    expect(billPaymentFormSchema.safeParse({ ...base, amount: 0 }).success).toBe(false)
  })
})
