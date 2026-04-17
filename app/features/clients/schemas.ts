import { z } from 'zod'

const optionalTrimmed = z.string().trim().default('')

const optionalEmail = z
  .string()
  .trim()
  .default('')
  .refine(v => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email address')

const egyptianTaxId = z
  .string()
  .trim()
  .default('')
  .refine(v => v === '' || /^\d{9}(\d{3})?$/.test(v.replace(/[-\s]/g, '')), 'Tax ID must be 9 or 12 digits')

export const clientFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200),
  trade_name: optionalTrimmed,
  tax_id: egyptianTaxId,
  commercial_register: optionalTrimmed,
  activity_type: optionalTrimmed,
  address: optionalTrimmed,
  city: optionalTrimmed,
  phone: optionalTrimmed,
  email: optionalEmail,
  contact_person: optionalTrimmed,
  contact_phone: optionalTrimmed,
  notes: optionalTrimmed,
})

export type ClientFormInput = z.input<typeof clientFormSchema>
export type ClientFormOutput = z.output<typeof clientFormSchema>

export const clientFormDefaults: ClientFormInput = {
  name: '',
  trade_name: '',
  tax_id: '',
  commercial_register: '',
  activity_type: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  contact_person: '',
  contact_phone: '',
  notes: '',
}
