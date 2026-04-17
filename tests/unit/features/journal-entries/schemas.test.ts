import { describe, it, expect } from 'vitest'
import { journalEntryFormSchema, journalEntryLineSchema } from '~/features/journal-entries/schemas'

describe('journalEntryLineSchema', () => {
  it('accepts a debit-only line', () => {
    expect(journalEntryLineSchema.safeParse({ account_id: 1, debit: 100, credit: 0, description: '' }).success).toBe(true)
  })

  it('accepts a credit-only line', () => {
    expect(journalEntryLineSchema.safeParse({ account_id: 1, debit: 0, credit: 100, description: '' }).success).toBe(true)
  })

  it('rejects both debit and credit on same line', () => {
    expect(journalEntryLineSchema.safeParse({ account_id: 1, debit: 50, credit: 50, description: '' }).success).toBe(false)
  })

  it('rejects both debit and credit = 0', () => {
    expect(journalEntryLineSchema.safeParse({ account_id: 1, debit: 0, credit: 0, description: '' }).success).toBe(false)
  })

  it('rejects missing account_id', () => {
    expect(journalEntryLineSchema.safeParse({ account_id: 0, debit: 100, credit: 0, description: '' }).success).toBe(false)
  })

  it('rejects negative values', () => {
    expect(journalEntryLineSchema.safeParse({ account_id: 1, debit: -10, credit: 0, description: '' }).success).toBe(false)
  })
})

describe('journalEntryFormSchema', () => {
  const balanced = {
    date: '2026-04-18',
    description: 'Opening balance',
    reference: 'OB-1',
    lines: [
      { account_id: 1, debit: 500, credit: 0, description: 'cash' },
      { account_id: 2, debit: 0, credit: 500, description: 'equity' },
    ],
  }

  it('accepts a balanced entry', () => {
    expect(journalEntryFormSchema.safeParse(balanced).success).toBe(true)
  })

  it('rejects unbalanced entries', () => {
    const r = journalEntryFormSchema.safeParse({
      ...balanced,
      lines: [
        { account_id: 1, debit: 500, credit: 0, description: '' },
        { account_id: 2, debit: 0, credit: 400, description: '' },
      ],
    })
    expect(r.success).toBe(false)
  })

  it('rejects fewer than 2 lines', () => {
    const r = journalEntryFormSchema.safeParse({
      ...balanced,
      lines: [{ account_id: 1, debit: 500, credit: 0, description: '' }],
    })
    expect(r.success).toBe(false)
  })

  it('tolerates sub-cent rounding within balance check', () => {
    const r = journalEntryFormSchema.safeParse({
      ...balanced,
      lines: [
        { account_id: 1, debit: 100.005, credit: 0, description: '' },
        { account_id: 2, debit: 0, credit: 100, description: '' },
      ],
    })
    expect(r.success).toBe(true)
  })
})
