import { z } from 'zod'
import { dateField, numericPositive, optionalTrimmed } from '~/shared/utils/zod-helpers'

export const whtCertificateTypes = ['service', 'royalty', 'professional_fee', 'other'] as const

/**
 * WHT rate in Egypt varies by service type (0.5%–5%). Allowing 0.001–0.25 keeps
 * room for rate changes without hard-coding each bracket.
 */
export const whtCertificateFormSchema = z
  .object({
    vendor_id: z.number({ message: 'Vendor is required' }).int().positive('Vendor is required'),
    bill_id: z.number().int().positive().optional().nullable(),
    payment_id: z.number().int().positive().optional().nullable(),
    amount: numericPositive,
    wht_rate: z.union([z.number(), z.string()]).transform((v, ctx) => {
      const n = typeof v === 'number' ? v : parseFloat(v)
      if (Number.isNaN(n) || n <= 0 || n > 0.25) {
        ctx.addIssue({ code: 'custom', message: 'Rate must be between 0 and 25%' })
        return z.NEVER
      }
      return n
    }),
    certificate_type: z.enum(whtCertificateTypes),
    date: dateField,
    notes: optionalTrimmed,
  })

export type WhtCertificateFormInput = z.input<typeof whtCertificateFormSchema>
export type WhtCertificateFormOutput = z.output<typeof whtCertificateFormSchema>

export const whtCertificateFormDefaults: WhtCertificateFormInput = {
  vendor_id: 0,
  amount: 0,
  wht_rate: 0.05,
  certificate_type: 'service',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
}

export const taxAdjustmentTypes = [
  'add_back', 'deduction', 'deferred_tax', 'permanent_difference',
] as const

export const taxAdjustmentFormSchema = z.object({
  fiscal_year_id: z.number({ message: 'Fiscal year is required' }).int().positive(),
  description: z.string().trim().min(1, 'Description is required').max(500),
  amount: numericPositive,
  account_id: z.number().int().positive().optional().nullable(),
  adjustment_type: z.enum(taxAdjustmentTypes),
  notes: optionalTrimmed,
})

export type TaxAdjustmentFormInput = z.input<typeof taxAdjustmentFormSchema>

export const taxAdjustmentFormDefaults: TaxAdjustmentFormInput = {
  fiscal_year_id: 0,
  description: '',
  amount: 0,
  adjustment_type: 'add_back',
  notes: '',
}
