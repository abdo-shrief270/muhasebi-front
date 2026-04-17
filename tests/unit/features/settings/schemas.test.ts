import { describe, it, expect } from 'vitest'
import { passwordChangeSchema } from '~/features/settings/schemas'

const base = {
  current_password: 'OldPass123',
  password: 'NewPass456',
  password_confirmation: 'NewPass456',
}

describe('passwordChangeSchema', () => {
  it('accepts a strong new password that matches confirmation', () => {
    expect(passwordChangeSchema.safeParse(base).success).toBe(true)
  })

  it('rejects mismatched confirmation', () => {
    const r = passwordChangeSchema.safeParse({ ...base, password_confirmation: 'different' })
    expect(r.success).toBe(false)
  })

  it('rejects new password identical to current', () => {
    const r = passwordChangeSchema.safeParse({
      current_password: 'Same123A',
      password: 'Same123A',
      password_confirmation: 'Same123A',
    })
    expect(r.success).toBe(false)
  })

  it('rejects passwords shorter than 8 chars', () => {
    const r = passwordChangeSchema.safeParse({ ...base, password: 'Ab1', password_confirmation: 'Ab1' })
    expect(r.success).toBe(false)
  })

  it('rejects passwords without uppercase', () => {
    const r = passwordChangeSchema.safeParse({ ...base, password: 'lowercase1', password_confirmation: 'lowercase1' })
    expect(r.success).toBe(false)
  })

  it('rejects passwords without digits', () => {
    const r = passwordChangeSchema.safeParse({ ...base, password: 'NoDigitsHere', password_confirmation: 'NoDigitsHere' })
    expect(r.success).toBe(false)
  })

  it('rejects empty current password', () => {
    const r = passwordChangeSchema.safeParse({ ...base, current_password: '' })
    expect(r.success).toBe(false)
  })
})
