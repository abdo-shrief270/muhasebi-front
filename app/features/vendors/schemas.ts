import { z } from 'zod'
import {
  optionalTrimmed, optionalEmail, optionalPhone, egyptianTaxId,
} from '~/shared/utils/zod-helpers'

/**
 * Vendor form schema. Aligned with backend `vendors` table:
 *   - bilingual `name_ar` (required) + `name_en` (optional fallback)
 *   - bilingual `address_ar` / `address_en`
 *   - `contacts` JSON array — UI exposes a single primary contact
 *     (name + role + phone + email) and stores it as `contacts[0]`.
 *   - bank info collapsed in its own section: bank_name, bank_account,
 *     iban, swift_code.
 *   - `is_active` boolean (no enum status).
 *
 * Backend StoreVendorRequest accepts the snake_case keys directly.
 */
const contactSchema = z.object({
  name: z.string().trim().max(120).default(''),
  role: z.string().trim().max(80).default(''),
  email: z.string().trim().email().or(z.literal('')).default(''),
  phone: z.string().trim().max(30).default(''),
})

export const vendorFormSchema = z.object({
  // Names — at least one of name_ar / name_en is required (validated below).
  name_ar: z.string().trim().max(200).default(''),
  name_en: z.string().trim().max(200).default(''),
  code:    z.string().trim().max(20).default(''),

  // Tax / legal
  tax_id:               egyptianTaxId,
  commercial_register:  optionalTrimmed,
  vat_registration:     optionalTrimmed,

  // Contact
  email: optionalEmail,
  phone: optionalPhone,

  // Address
  address_ar: optionalTrimmed,
  address_en: optionalTrimmed,
  city:       optionalTrimmed,
  country:    z.string().trim().toUpperCase().length(2).default('EG'),

  // Banking
  bank_name:    optionalTrimmed,
  bank_account: optionalTrimmed,
  iban:         z.string().trim().max(34).default(''),
  swift_code:   z.string().trim().max(11).default(''),

  // Commercial
  payment_terms: z.string().trim().max(20).default('net_30'),
  credit_limit:  z.number().nonnegative().or(z.literal('').transform(() => 0)).default(0),
  currency:      z.string().trim().toUpperCase().length(3).default('EGP'),

  // Primary contact (the form exposes one; backend stores contacts[]).
  primary_contact: contactSchema.default({ name: '', role: '', email: '', phone: '' }),

  notes: optionalTrimmed,
}).refine(d => (d.name_ar?.length ?? 0) >= 2 || (d.name_en?.length ?? 0) >= 2, {
  message: 'name_required',
  path: ['name_ar'],
})

export type VendorFormInput = z.input<typeof vendorFormSchema>
export type VendorFormOutput = z.output<typeof vendorFormSchema>

export const vendorFormDefaults: VendorFormInput = {
  name_ar: '',
  name_en: '',
  code: '',
  tax_id: '',
  commercial_register: '',
  vat_registration: '',
  email: '',
  phone: '',
  address_ar: '',
  address_en: '',
  city: '',
  country: 'EG',
  bank_name: '',
  bank_account: '',
  iban: '',
  swift_code: '',
  payment_terms: 'net_30',
  credit_limit: 0,
  currency: 'EGP',
  primary_contact: { name: '', role: '', email: '', phone: '' },
  notes: '',
}
