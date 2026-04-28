import { z } from 'zod'
import {
  dateField, numericNonNeg, numericPositive, percentField, optionalTrimmed,
} from '~/shared/utils/zod-helpers'

/**
 * Bill form schema. Aligned with backend StoreBillRequest:
 *   - bill_number is auto-generated (BillService::generateBillNumber)
 *   - status is always 'draft' on create; transitions go through
 *     /approve and /cancel actions, not the form payload
 *   - line fields persisted: description, account_id, quantity,
 *     unit_price, discount_percent, vat_rate, wht_rate, sort_order
 *     (cost_center_id / project_id / eta_item_code are NOT persisted yet)
 */
export const billLineSchema = z.object({
  description: z.string().trim().max(500).optional().or(z.literal('').transform(() => null)).nullable(),
  account_id: z.number({ message: 'Account is required' }).int().positive('Account is required'),
  vendor_product_id: z.number().int().positive().nullable().optional(),
  quantity: numericPositive,
  unit_price: numericNonNeg,
  discount_percent: percentField.default(0),
  vat_rate: percentField.default(14),
  wht_rate: percentField.default(0),
  sort_order: z.number().int().min(0).optional(),
})

export const billFormSchema = z.object({
  vendor_id: z.number({ message: 'Vendor is required' }).int().positive('Vendor is required'),
  date: dateField,
  due_date: dateField,
  currency: z.string().trim().toUpperCase().length(3).default('EGP'),
  notes: optionalTrimmed,
  lines: z.array(billLineSchema).min(1, 'Add at least one line item'),
})
  .refine(
    v => new Date(v.due_date) >= new Date(v.date),
    { message: 'Due date cannot be before bill date', path: ['due_date'] },
  )

export type BillFormInput = z.input<typeof billFormSchema>
export type BillFormOutput = z.output<typeof billFormSchema>

export const billFormDefaults: BillFormInput = {
  vendor_id: 0,
  date: new Date().toISOString().slice(0, 10),
  due_date: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
  currency: 'EGP',
  notes: '',
  lines: [
    { description: '', account_id: 0, vendor_product_id: null, quantity: 1, unit_price: 0, discount_percent: 0, vat_rate: 14, wht_rate: 0 },
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
