import { z } from 'zod'
import {
  dateField, numericNonNeg, numericPositive, percentField, optionalTrimmed,
} from '~/shared/utils/zod-helpers'

export const billLineSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(500),
  quantity: numericPositive,
  unit_price: numericNonNeg,
  account_id: z.number({ message: 'Account is required' }).int().positive('Account is required'),
  cost_center_id: z.number().int().positive().optional().nullable(),
  project_id: z.number().int().positive().optional().nullable(),
  vat_rate: percentField.default(14),
  wht_rate: percentField.optional(),
  eta_item_code: z.string().trim().optional().nullable(),
})

export const billFormSchema = z.object({
  vendor_id: z.number({ message: 'Vendor is required' }).int().positive('Vendor is required'),
  bill_number: z.string().trim().min(1, 'Bill number is required').max(100),
  bill_date: dateField,
  due_date: dateField,
  currency: z.string().trim().toUpperCase().length(3).default('EGP'),
  exchange_rate: numericPositive.default(1),
  reference: optionalTrimmed,
  notes: optionalTrimmed,
  attachments: z.array(z.number().int().positive()).default([]),
  lines: z.array(billLineSchema).min(1, 'Add at least one line item'),
})
  .refine(
    v => new Date(v.due_date) >= new Date(v.bill_date),
    { message: 'Due date cannot be before bill date', path: ['due_date'] },
  )

export type BillFormInput = z.input<typeof billFormSchema>
export type BillFormOutput = z.output<typeof billFormSchema>

export const billFormDefaults: BillFormInput = {
  vendor_id: 0,
  bill_number: '',
  bill_date: new Date().toISOString().slice(0, 10),
  due_date: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
  currency: 'EGP',
  exchange_rate: 1,
  reference: '',
  notes: '',
  attachments: [],
  lines: [
    { description: '', quantity: 1, unit_price: 0, account_id: 0, vat_rate: 14 },
  ],
}

export const billPaymentMethods = ['cash', 'bank_transfer', 'cheque', 'card'] as const

export const billPaymentFormSchema = z.object({
  amount: numericPositive,
  payment_date: dateField,
  payment_method: z.enum(billPaymentMethods),
  bank_account_id: z.number().int().positive().optional().nullable(),
  reference: optionalTrimmed,
  wht_amount: numericNonNeg.optional(),
  notes: optionalTrimmed,
})

export type BillPaymentFormInput = z.input<typeof billPaymentFormSchema>
export type BillPaymentFormOutput = z.output<typeof billPaymentFormSchema>

export const billPaymentFormDefaults: BillPaymentFormInput = {
  amount: 0,
  payment_date: new Date().toISOString().slice(0, 10),
  payment_method: 'bank_transfer',
  reference: '',
  notes: '',
}
