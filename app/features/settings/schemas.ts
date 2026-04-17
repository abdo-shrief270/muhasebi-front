import { z } from 'zod'

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
