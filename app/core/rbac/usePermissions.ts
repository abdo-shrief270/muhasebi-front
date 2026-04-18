export function usePermissions() {
  const authStore = useAuthStore()

  const permissions = computed<string[]>(() => {
    // /me returns permissions at the top level; legacy shape nested them on user.
    const top = (authStore.permissions as string[] | undefined) ?? []
    if (top.length) return top
    return authStore.user?.permissions ?? []
  })

  const isSuperAdmin = computed(() => authStore.user?.role === 'super_admin')

  function can(permission: string): boolean {
    if (isSuperAdmin.value) return true
    return permissions.value.includes(permission)
  }

  function canAny(perms: string[]): boolean {
    if (isSuperAdmin.value) return true
    return perms.some(p => permissions.value.includes(p))
  }

  return { permissions, can, canAny, isSuperAdmin }
}
