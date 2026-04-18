import { describe, it, expect } from 'vitest'
import { validateManifests } from '~/core/subscription/validateManifest'
import type { FeatureManifest } from '~/core/subscription/types'

function base(overrides: Partial<FeatureManifest> = {}): FeatureManifest {
  return { id: 'x', routePrefix: '/x', ...overrides }
}

describe('validateManifests', () => {
  it('accepts a minimal valid manifest', () => {
    expect(validateManifests([base()])).toEqual([])
  })

  it('flags missing routePrefix slash', () => {
    const issues = validateManifests([base({ routePrefix: 'x' } as FeatureManifest)])
    expect(issues.length).toBeGreaterThan(0)
    expect(issues[0].kind).toBe('schema')
  })

  it('flags duplicate ids', () => {
    const issues = validateManifests([base(), base()])
    expect(issues.some(i => i.kind === 'duplicate-id')).toBe(true)
  })

  it('flags duplicate route prefixes', () => {
    const issues = validateManifests([
      base({ id: 'a', routePrefix: '/same' }),
      base({ id: 'b', routePrefix: '/same' }),
    ])
    expect(issues.some(i => i.kind === 'duplicate-route')).toBe(true)
  })

  it('rejects unknown plan tier', () => {
    const issues = validateManifests([
      base({ plans: ['platinum' as any] }),
    ])
    expect(issues.some(i => i.kind === 'schema' && i.message.includes('plans'))).toBe(true)
  })

  it('rejects empty plans array', () => {
    const issues = validateManifests([
      base({ plans: [] as any }),
    ])
    expect(issues.some(i => i.kind === 'schema')).toBe(true)
  })

  it('accepts full manifest with all optional fields', () => {
    expect(validateManifests([
      base({
        id: 'y', routePrefix: '/y',
        permission: 'manage_y',
        plans: ['pro', 'business', 'enterprise'],
        flag: 'y_enabled',
        navLabel: 'nav.y',
        navIcon: 'icon',
        navGroup: 'main',
        order: 10,
        hideWhenDenied: true,
      }),
    ])).toEqual([])
  })
})
