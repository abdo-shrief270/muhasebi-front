import { z } from 'zod'
import {
  optionalTrimmed, optionalEmail, optionalPhone, egyptianTaxId,
} from '~/shared/utils/zod-helpers'

export const vendorFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200),
  email: optionalEmail,
  phone: optionalPhone,
  tax_id: egyptianTaxId,
  commercial_registration: optionalTrimmed,
  address: optionalTrimmed,
  city: optionalTrimmed,
  country: z.string().trim().toUpperCase().length(2).default('EG'),
  default_account_id: z.number().int().positive().optional(),
  payment_terms: optionalTrimmed,
  currency: z.string().trim().toUpperCase().length(3).default('EGP'),
  contact_person: optionalTrimmed,
  notes: optionalTrimmed,
})

export type VendorFormInput = z.input<typeof vendorFormSchema>
export type VendorFormOutput = z.output<typeof vendorFormSchema>

export const vendorFormDefaults: VendorFormInput = {
  name: '',
  email: '',
  phone: '',
  tax_id: '',
  commercial_registration: '',
  address: '',
  city: '',
  country: 'EG',
  payment_terms: '',
  currency: 'EGP',
  contact_person: '',
  notes: '',
}
