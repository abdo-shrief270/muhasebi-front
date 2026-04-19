import { z } from 'zod'
import { egyptianTaxId, optionalEmail, optionalPhone, optionalTrimmed } from '~/shared/utils/zod-helpers'

export const clientFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200),
  trade_name: optionalTrimmed,
  tax_id: egyptianTaxId,
  commercial_register: optionalTrimmed,
  activity_type: optionalTrimmed,
  address: optionalTrimmed,
  city: optionalTrimmed,
  phone: optionalPhone,
  email: optionalEmail,
  contact_person: optionalTrimmed,
  contact_phone: optionalPhone,
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
