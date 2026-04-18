import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  phone: z
    .string()
    .trim()
    .default('')
    .refine(v => v === '' || /^[+\d\s-]{6,20}$/.test(v), 'Invalid phone number'),
})

export type ProfileInput = z.input<typeof profileSchema>
export type ProfileOutput = z.output<typeof profileSchema>

export const profileDefaults: ProfileInput = { name: '', phone: '' }

export const SUPPORTED_LOCALES = ['ar', 'en'] as const
export const SUPPORTED_TIMEZONES = [
  'Africa/Cairo', 'Asia/Riyadh', 'UTC', 'Europe/London', 'America/New_York',
] as const

export const preferencesSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  timezone: z.enum(SUPPORTED_TIMEZONES),
})

export type PreferencesInput = z.input<typeof preferencesSchema>
export type PreferencesOutput = z.output<typeof preferencesSchema>

export const preferencesDefaults: PreferencesInput = {
  locale: 'ar',
  timezone: 'Africa/Cairo',
}

export const notificationPrefsSchema = z.object({
  email_invoice_sent: z.boolean().default(true),
  email_payment_received: z.boolean().default(true),
  email_invoice_overdue: z.boolean().default(true),
  email_weekly_summary: z.boolean().default(false),
  in_app_mentions: z.boolean().default(true),
})

export type NotificationPrefsInput = z.input<typeof notificationPrefsSchema>
export type NotificationPrefsOutput = z.output<typeof notificationPrefsSchema>

export const notificationPrefsDefaults: NotificationPrefsInput = {
  email_invoice_sent: true,
  email_payment_received: true,
  email_invoice_overdue: true,
  email_weekly_summary: false,
  in_app_mentions: true,
}

export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(v => /[a-z]/.test(v), 'Must contain a lowercase letter')
      .refine(v => /[A-Z]/.test(v), 'Must contain an uppercase letter')
      .refine(v => /\d/.test(v), 'Must contain a digit'),
    password_confirmation: z.string(),
  })
  .refine(v => v.password === v.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })
  .refine(v => v.current_password !== v.password, {
    message: 'New password must differ from current',
    path: ['password'],
  })

export type PasswordChangeInput = z.input<typeof passwordChangeSchema>
export type PasswordChangeOutput = z.output<typeof passwordChangeSchema>

export const passwordChangeDefaults: PasswordChangeInput = {
  current_password: '',
  password: '',
  password_confirmation: '',
}
