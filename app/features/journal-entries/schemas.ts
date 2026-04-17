import { z } from 'zod'

const numericNonNeg = z.union([z.number(), z.string()]).transform((v, ctx) => {
  const n = typeof v === 'number' ? v : parseFloat(v)
  if (Number.isNaN(n)) {
    ctx.addIssue({ code: 'custom', message: 'Must be a number' })
    return z.NEVER
  }
  if (n < 0) {
    ctx.addIssue({ code: 'custom', message: 'Cannot be negative' })
    return z.NEVER
  }
  return n
})

export const journalEntryLineSchema = z
  .object({
    account_id: z.number({ message: 'Account is required' }).int().positive('Account is required'),
    debit: numericNonNeg,
    credit: numericNonNeg,
    description: z.string().trim().max(500).default(''),
  })
  .refine(l => l.debit > 0 || l.credit > 0, { message: 'Debit or credit must be greater than 0' })
  .refine(l => !(l.debit > 0 && l.credit > 0), { message: 'A line cannot have both debit and credit' })

export const journalEntryFormSchema = z
  .object({
    date: z.string().min(1, 'Date is required'),
    description: z.string().trim().min(1, 'Description is required').max(1000),
    reference: z.string().trim().max(100).default(''),
    lines: z.array(journalEntryLineSchema).min(2, 'At least two lines are required'),
  })
  .refine(
    (v) => {
      const totalDebit = v.lines.reduce((s, l) => s + l.debit, 0)
      const totalCredit = v.lines.reduce((s, l) => s + l.credit, 0)
      return Math.abs(totalDebit - totalCredit) < 0.01
    },
    { message: 'Debit and credit totals must balance', path: ['lines'] },
  )

export type JournalEntryLineInput = z.input<typeof journalEntryLineSchema>
export type JournalEntryFormInput = z.input<typeof journalEntryFormSchema>
export type JournalEntryFormOutput = z.output<typeof journalEntryFormSchema>

export const journalEntryFormDefaults: JournalEntryFormInput = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  reference: '',
  lines: [
    { account_id: 0, debit: 0, credit: 0, description: '' },
    { account_id: 0, debit: 0, credit: 0, description: '' },
  ],
}
