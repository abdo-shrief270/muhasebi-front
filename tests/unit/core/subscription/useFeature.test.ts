import { describe, it, expect, beforeEach, vi } from 'vitest'
import { reactive } from 'vue'

const mockUser = reactive<{ role: string; permissions: string[] }>({
  role: 'accountant',
  permissions: ['manage_invoices', 'manage_clients'],
})

const mockSubscription = reactive<{
  plan: { tier: string } | null
  flags: Record<string, boolean>
  loaded: boolean
}>({
  plan: { tier: 'starter' },
  flags: {},
  loaded: true,
})

;(globalThis as any).useAuthStore = () => ({
  user: mockUser,
  isAuthenticated: true,
})
;(globalThis as any).useSubscription = () => ({
  ...mockSubscription,
  hasPlan(allowed: string[]) {
    const order: Record<string, number> = { free: 0, starter: 1, pro: 2, business: 3, enterprise: 4 }
    if (!mockSubscription.plan) return false
    const current = order[mockSubscription.plan.tier] ?? -1
    return allowed.some(t => current >= (order[t] ?? 99))
  },
  isFlagEnabled(k: string) { return !!mockSubscription.flags[k] },
})

import { evaluateFeature } from '~/core/subscription/useFeature'

describe('evaluateFeature', () => {
  beforeEach(() => {
    mockUser.role = 'accountant'
    mockUser.permissions = ['manage_invoices', 'manage_clients']
    mockSubscription.plan = { tier: 'starter' }
    mockSubscription.flags = {}
  })

  it('allows when no constraints set', () => {
    expect(evaluateFeature({ id: 'x', routePrefix: '/x' })).toEqual({ allowed: true })
  })

  it('denies for missing permission', () => {
    const r = evaluateFeature({ id: 'x', routePrefix: '/x', permission: 'manage_payroll' })
    expect(r.allowed).toBe(false)
    expect(r.reason).toBe('permission')
  })

  it('denies for insufficient plan', () => {
    const r = evaluateFeature({ id: 'x', routePrefix: '/x', plans: ['pro', 'business', 'enterprise'] })
    expect(r.allowed).toBe(false)
    expect(r.reason).toBe('plan')
  })

  it('allows when tier meets floor', () => {
    mockSubscription.plan = { tier: 'pro' }
    const r = evaluateFeature({ id: 'x', routePrefix: '/x', plans: ['pro', 'business', 'enterprise'] })
    expect(r.allowed).toBe(true)
  })

  it('denies when flag off', () => {
    const r = evaluateFeature({ id: 'x', routePrefix: '/x', flag: 'payroll_enabled' })
    expect(r.allowed).toBe(false)
    expect(r.reason).toBe('flag')
  })

  it('allows when flag on', () => {
    mockSubscription.flags = { payroll_enabled: true }
    const r = evaluateFeature({ id: 'x', routePrefix: '/x', flag: 'payroll_enabled' })
    expect(r.allowed).toBe(true)
  })

  it('denies unauth first regardless of plan', () => {
    ;(globalThis as any).useAuthStore = () => ({ user: null, isAuthenticated: false })
    const r = evaluateFeature({ id: 'x', routePrefix: '/x', plans: ['starter'] })
    expect(r.allowed).toBe(false)
    expect(r.reason).toBe('unauthenticated')
  })
})
