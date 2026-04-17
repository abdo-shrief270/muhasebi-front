import { describe, it, expect, beforeEach } from 'vitest'
import { reactive } from 'vue'

// Mutable user object so tests can reconfigure per-test
const mockUser = reactive<{
  role: string
  permissions: string[]
}>({
  role: 'accountant',
  permissions: ['invoices.view', 'invoices.create', 'clients.view'],
})

// Provide useAuthStore as a global (Nuxt auto-imports it from stores)
;(globalThis as any).useAuthStore = () => ({
  user: mockUser,
})

import { usePermissions } from '~/composables/usePermissions'

describe('usePermissions', () => {
  beforeEach(() => {
    mockUser.role = 'accountant'
    mockUser.permissions = ['invoices.view', 'invoices.create', 'clients.view']
  })

  describe('can()', () => {
    it('returns true for a permission the user has', () => {
      const { can } = usePermissions()
      expect(can('invoices.view')).toBe(true)
    })

    it('returns false for a permission the user does not have', () => {
      const { can } = usePermissions()
      expect(can('settings.manage')).toBe(false)
    })

    it('returns true for any permission when user is super_admin', () => {
      mockUser.role = 'super_admin'
      mockUser.permissions = []
      const { can } = usePermissions()
      expect(can('anything.at.all')).toBe(true)
    })
  })

  describe('canAny()', () => {
    it('returns true if user has at least one of the permissions', () => {
      const { canAny } = usePermissions()
      expect(canAny(['invoices.view', 'settings.manage'])).toBe(true)
    })

    it('returns false if user has none of the permissions', () => {
      const { canAny } = usePermissions()
      expect(canAny(['settings.manage', 'users.delete'])).toBe(false)
    })

    it('returns true for super_admin regardless of permissions list', () => {
      mockUser.role = 'super_admin'
      mockUser.permissions = []
      const { canAny } = usePermissions()
      expect(canAny(['anything'])).toBe(true)
    })
  })

  describe('isSuperAdmin', () => {
    it('is false for regular users', () => {
      const { isSuperAdmin } = usePermissions()
      expect(isSuperAdmin.value).toBe(false)
    })

    it('is true for super_admin role', () => {
      mockUser.role = 'super_admin'
      const { isSuperAdmin } = usePermissions()
      expect(isSuperAdmin.value).toBe(true)
    })
  })
})
