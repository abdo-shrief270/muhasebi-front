import { describe, it, expect } from 'vitest'
import { whtCertificateFormSchema } from '~/features/tax/schemas'

const base = {
  vendor_id: 1,
  amount: 10000,
  wht_rate: 0.05,
  certificate_type: 'service' as const,
  date: '2026-04-18',
  notes: '',
}

describe('whtCertificateFormSchema', () => {
  it('accepts a valid certificate', () => {
    expect(whtCertificateFormSchema.safeParse(base).success).toBe(true)
  })

  it('rejects rate above 25%', () => {
    expect(whtCertificateFormSchema.safeParse({ ...base, wht_rate: 0.30 }).success).toBe(false)
  })

  it('rejects zero rate', () => {
    expect(whtCertificateFormSchema.safeParse({ ...base, wht_rate: 0 }).success).toBe(false)
  })

  it('rejects unknown type', () => {
    expect(whtCertificateFormSchema.safeParse({ ...base, certificate_type: 'bogus' }).success).toBe(false)
  })

  it('rejects missing vendor', () => {
    expect(whtCertificateFormSchema.safeParse({ ...base, vendor_id: 0 }).success).toBe(false)
  })
})
