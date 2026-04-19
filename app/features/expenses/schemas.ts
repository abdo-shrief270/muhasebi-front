import { z } from 'zod'
import {
  dateField, numericPositive, percentField, optionalTrimmed,
} from '~/shared/utils/zod-helpers'

export const expensePaymentMethods = ['cash', 'bank_transfer', 'company_card', 'personal'] as const

export const expenseFormSchema = z.object({
  expense_category_id: z.number({ message: 'Category is required' }).int().positive('Category is required'),
  amount: numericPositive,
  currency: z.string().trim().toUpperCase().length(3).default('EGP'),
  exchange_rate: numericPositive.default(1),
  date: dateField,
  vendor_name: optionalTrimmed,
  vendor_id: z.number().int().positive().optional().nullable(),
  description: z.string().trim().min(1, 'Description is required').max(1000),
  cost_center_id: z.number().int().positive().optional().nullable(),
  project_id: z.number().int().positive().optional().nullable(),
  payment_method: z.enum(expensePaymentMethods),
  vat_rate: percentField.optional(),
  notes: optionalTrimmed,
})

export type ExpenseFormInput = z.input<typeof expenseFormSchema>
export type ExpenseFormOutput = z.output<typeof expenseFormSchema>

export const expenseFormDefaults: ExpenseFormInput = {
  expense_category_id: 0,
  amount: 0,
  currency: 'EGP',
  exchange_rate: 1,
  date: new Date().toISOString().slice(0, 10),
  vendor_name: '',
  description: '',
  payment_method: 'cash',
  notes: '',
}

export const expenseCategoryFormSchema = z.object({
  name_ar: z.string().trim().min(2, 'Arabic name is required').max(120),
  name_en: z.string().trim().max(120).optional().nullable(),
  code: z.string().trim().max(60).optional().nullable(),
  description: optionalTrimmed,
  account_id: z.number().int().positive().optional().nullable(),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional().nullable(),
})

export type ExpenseCategoryFormInput = z.input<typeof expenseCategoryFormSchema>

export const expenseCategoryFormDefaults: ExpenseCategoryFormInput = {
  name_ar: '',
  description: '',
}

/** Report bundle form. */
export const expenseReportFormSchema = z
  .object({
    title: z.string().trim().min(2, 'Title is required').max(200),
    description: optionalTrimmed,
    period_from: dateField,
    period_to: dateField,
    expense_ids: z.array(z.number().int().positive()).min(1, 'Select at least one expense'),
    notes: optionalTrimmed,
  })
  .refine(
    v => new Date(v.period_to) >= new Date(v.period_from),
    { message: 'End date must be after start date', path: ['period_to'] },
  )

export type ExpenseReportFormInput = z.input<typeof expenseReportFormSchema>
