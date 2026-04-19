import { z } from 'zod'

/**
 * Shared zod primitives used across feature schemas. Keep them here so
 * validation rules stay consistent (numeric coercion, EG tax IDs, etc.).
 */

/** Accepts a number OR numeric string, coerces to number, emits a typed error. */
export const numericField = z.union([z.number(), z.string()]).transform((v, ctx) => {
  const n = typeof v === 'number' ? v : parseFloat(v)
  if (Number.isNaN(n)) {
    ctx.addIssue({ code: 'custom', message: 'Must be a number' })
    return z.NEVER
  }
  return n
})

/** Same as numericField but rejects negatives. */
export const numericNonNeg = numericField.refine(n => n >= 0, 'Cannot be negative')

/** Same as numericField but > 0. */
export const numericPositive = numericField.refine(n => n > 0, 'Must be greater than 0')

/** Percent field: must be 0..100. */
export const percentField = numericField.refine(n => n >= 0 && n <= 100, 'Must be between 0 and 100')

/** Trimmed optional string — defaults to ''. */
export const optionalTrimmed = z.string().trim().default('')

/** Email that allows empty. */
export const optionalEmail = z
  .string()
  .trim()
  .default('')
  .refine(v => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email address')

/** Egyptian tax ID: 9 or 12 digits (ignoring separators). */
export const egyptianTaxId = z
  .string()
  .trim()
  .default('')
  .refine(v => v === '' || /^\d{9}(\d{3})?$/.test(v.replace(/[-\s]/g, '')), 'Tax ID must be 9 or 12 digits')

/** Egyptian national ID: 14 digits. */
export const egyptianNationalId = z
  .string()
  .trim()
  .default('')
  .refine(v => v === '' || /^\d{14}$/.test(v.replace(/\s/g, '')), 'National ID must be 14 digits')

/** Phone: 6–20 chars of digits, +, spaces, dashes. */
export const optionalPhone = z
  .string()
  .trim()
  .default('')
  .refine(v => v === '' || /^[+\d\s-]{6,20}$/.test(v), 'Invalid phone number')

/** ISO date string (YYYY-MM-DD). */
export const dateField = z.string().min(1, 'Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
