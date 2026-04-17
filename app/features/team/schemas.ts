import { z } from 'zod'

export const teamInviteSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  role: z.string().trim().min(1, 'Role is required'),
})

export type TeamInviteInput = z.input<typeof teamInviteSchema>
export type TeamInviteOutput = z.output<typeof teamInviteSchema>

export const teamInviteDefaults: TeamInviteInput = {
  name: '',
  email: '',
  role: 'accountant',
}
