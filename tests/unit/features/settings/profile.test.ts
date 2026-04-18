import { describe, it, expect } from 'vitest'
import { profileSchema, preferencesSchema } from '~/features/settings/schemas'

describe('profileSchema', () => {
  it('accepts name + blank phone', () => {
    expect(profileSchema.safeParse({ name: 'Abdo Shrief', phone: '' }).success).toBe(true)
  })

  it('accepts valid phone formats', () => {
    for (const p of ['+201234567890', '01234567890', '123 456 7890', '+1-555-123-4567']) {
      expect(profileSchema.safeParse({ name: 'Abc', phone: p }).success).toBe(true)
    }
  })

  it('rejects too-short names', () => {
    expect(profileSchema.safeParse({ name: 'A', phone: '' }).success).toBe(false)
  })

  it('rejects invalid phone formats', () => {
    expect(profileSchema.safeParse({ name: 'Abc', phone: 'not a phone' }).success).toBe(false)
  })

  it('trims name whitespace', () => {
    const r = profileSchema.safeParse({ name: '  Abc Def  ', phone: '' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.name).toBe('Abc Def')
  })
})

describe('preferencesSchema', () => {
  it('accepts a supported locale + timezone pair', () => {
    expect(preferencesSchema.safeParse({ locale: 'ar', timezone: 'Africa/Cairo' }).success).toBe(true)
  })

  it('rejects unknown locale', () => {
    expect(preferencesSchema.safeParse({ locale: 'fr', timezone: 'UTC' }).success).toBe(false)
  })

  it('rejects unknown timezone', () => {
    expect(preferencesSchema.safeParse({ locale: 'en', timezone: 'Mars/Olympus' }).success).toBe(false)
  })
})
