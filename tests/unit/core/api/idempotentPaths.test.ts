import { describe, it, expect } from 'vitest'
import { isMoneyMutationUrl } from '~/core/api/idempotentPaths'

describe('isMoneyMutationUrl', () => {
  it('matches bare collection paths for money-mutation modules', () => {
    expect(isMoneyMutationUrl('/invoices')).toBe(true)
    expect(isMoneyMutationUrl('/bills')).toBe(true)
    expect(isMoneyMutationUrl('/payments')).toBe(true)
    expect(isMoneyMutationUrl('/bill-payments')).toBe(true)
    expect(isMoneyMutationUrl('/journal-entries')).toBe(true)
    expect(isMoneyMutationUrl('/recurring-journal-entries')).toBe(true)
    expect(isMoneyMutationUrl('/payroll')).toBe(true)
    expect(isMoneyMutationUrl('/credit-notes')).toBe(true)
    expect(isMoneyMutationUrl('/expenses')).toBe(true)
  })

  it('matches nested paths (action routes)', () => {
    expect(isMoneyMutationUrl('/invoices/42')).toBe(true)
    expect(isMoneyMutationUrl('/invoices/42/post-to-gl')).toBe(true)
    expect(isMoneyMutationUrl('/journal-entries/9/post')).toBe(true)
    expect(isMoneyMutationUrl('/journal-entries/9/reverse')).toBe(true)
  })

  it('matches ETA money-mutation sub-paths only', () => {
    expect(isMoneyMutationUrl('/eta/submit')).toBe(true)
    expect(isMoneyMutationUrl('/eta/cancel/42')).toBe(true)
    expect(isMoneyMutationUrl('/eta/reconcile')).toBe(true)
    // Read-only ETA endpoints should NOT match.
    expect(isMoneyMutationUrl('/eta/documents')).toBe(false)
    expect(isMoneyMutationUrl('/eta/item-codes')).toBe(false)
  })

  it('matches subscription money-mutation verbs only', () => {
    expect(isMoneyMutationUrl('/subscription/upgrade')).toBe(true)
    expect(isMoneyMutationUrl('/subscription/cancel')).toBe(true)
    expect(isMoneyMutationUrl('/subscription/renew')).toBe(true)
    // Subscription read endpoints stay untouched.
    expect(isMoneyMutationUrl('/subscription')).toBe(false)
    expect(isMoneyMutationUrl('/subscription/invoices')).toBe(false)
  })

  it('handles paths with and without leading slash', () => {
    expect(isMoneyMutationUrl('invoices')).toBe(true)
    expect(isMoneyMutationUrl('/invoices')).toBe(true)
  })

  it('strips query string before matching', () => {
    expect(isMoneyMutationUrl('/invoices?filter=draft')).toBe(true)
    expect(isMoneyMutationUrl('/clients?filter=active')).toBe(false)
  })

  it('strips API prefixes (/api/v1 or /v1) before matching', () => {
    expect(isMoneyMutationUrl('/api/v1/invoices')).toBe(true)
    expect(isMoneyMutationUrl('/v1/invoices')).toBe(true)
    expect(isMoneyMutationUrl('/v1/clients')).toBe(false)
  })

  it('handles absolute URLs', () => {
    expect(isMoneyMutationUrl('https://api.muhasebi.com/api/v1/invoices')).toBe(true)
    expect(isMoneyMutationUrl('https://api.muhasebi.com/api/v1/clients')).toBe(false)
  })

  it('does NOT match read-only / non-money paths', () => {
    expect(isMoneyMutationUrl('/clients')).toBe(false)
    expect(isMoneyMutationUrl('/vendors')).toBe(false)
    expect(isMoneyMutationUrl('/reports')).toBe(false)
    expect(isMoneyMutationUrl('/me')).toBe(false)
    expect(isMoneyMutationUrl('/currencies/rates')).toBe(false)
    expect(isMoneyMutationUrl('/documents')).toBe(false)
  })

  it('does NOT match partial-substring false positives', () => {
    // "invoiced_clients" shouldn't match "/invoices"
    expect(isMoneyMutationUrl('/invoiced_clients')).toBe(false)
    // "paymentsfoo" shouldn't match "/payments"
    expect(isMoneyMutationUrl('/paymentsfoo')).toBe(false)
  })
})
