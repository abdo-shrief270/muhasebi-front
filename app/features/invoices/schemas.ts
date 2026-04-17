import { z } from 'zod'

const numeric = z.union([z.number(), z.string()]).transform((v, ctx) => {
  const n = typeof v === 'number' ? v : parseFloat(v)
  if (Number.isNaN(n)) {
    ctx.addIssue({ code: 'custom', message: 'Must be a number' })
    return z.NEVER
  }
  return n
})

export const invoiceLineSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  quantity: numeric.refine(n => n > 0, 'Quantity must be greater than 0'),
  unit_price: numeric.refine(n => n >= 0, 'Unit price cannot be negative'),
  discount_percent: numeric.refine(n => n >= 0 && n <= 100, 'Discount must be between 0 and 100'),
  vat_rate: numeric.refine(n => n >= 0 && n <= 100, 'VAT rate must be between 0 and 100'),
})

export const invoiceFormSchema = z.object({
  client_id: z.number({ message: 'Client is required' }).int().positive('Client is required'),
  date: z.string().min(1, 'Date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  notes: z.string().max(2000).default(''),
  terms: z.string().max(2000).default(''),
  lines: z.array(invoiceLineSchema).min(1, 'Add at least one line item'),
})

export const paymentMethods = ['cash', 'bank_transfer', 'credit_card', 'cheque', 'other'] as const

export const paymentFormSchema = z.object({
  invoice_id: z.number().int().positive(),
  amount: numeric.refine(n => n > 0, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  method: z.enum(paymentMethods),
  reference: z.string().max(100).default(''),
  notes: z.string().max(1000).default(''),
})

export type InvoiceLineInput = z.input<typeof invoiceLineSchema>
export type InvoiceLineOutput = z.output<typeof invoiceLineSchema>
export type InvoiceFormInput = z.input<typeof invoiceFormSchema>
export type InvoiceFormOutput = z.output<typeof invoiceFormSchema>
export type PaymentFormInput = z.input<typeof paymentFormSchema>
export type PaymentFormOutput = z.output<typeof paymentFormSchema>

export const invoiceFormDefaults: InvoiceFormInput = {
  client_id: 0,
  date: new Date().toISOString().slice(0, 10),
  due_date: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
  notes: '',
  terms: '',
  lines: [
    { description: '', quantity: 1, unit_price: 0, discount_percent: 0, vat_rate: 14 },
  ],
}
