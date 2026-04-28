<template>
  <FeatureBoundary id="team">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-users"
        :title="$t('nav.team')"
        :subtitle="totalLabel"
      >
        <template #actions>
          <Can :perm="PERMISSIONS.MANAGE_TEAM">
            <UiAppButton variant="primary" icon="i-lucide-user-plus" @click="inviteOpen = true">
              {{ locale === 'ar' ? 'دعوة عضو' : 'Invite Member' }}
            </UiAppButton>
          </Can>
        </template>
      </UiPageHeader>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="i in 6" :key="i" class="h-28 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      </div>

      <div v-else-if="members.length === 0" class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 py-12 text-center">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <UIcon name="i-lucide-users" class="w-5 h-5 text-neutral-400" />
        </div>
        <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
          {{ locale === 'ar' ? 'لا يوجد أعضاء' : 'No team members yet' }}
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ locale === 'ar' ? 'ادعُ زملاءك لبدء العمل سوياً.' : 'Invite teammates to start working together.' }}
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="(member, i) in members"
          :key="member.id"
          v-motion
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: i * 40 } }"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors group"
        >
          <div class="flex items-start justify-between gap-2 mb-3">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-10 h-10 rounded-md bg-primary-500/10 text-primary-700 dark:text-primary-400 inline-flex items-center justify-center font-semibold text-sm flex-shrink-0">
                {{ (member.name || '?').charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 truncate">{{ member.name }}</p>
                <p class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate" dir="ltr">{{ member.email }}</p>
              </div>
            </div>
            <Can :perm="PERMISSIONS.MANAGE_TEAM">
              <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0">
                <button
                  type="button"
                  class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-warning-600 hover:bg-warning-500/10 transition-colors"
                  :title="member.is_active
                    ? (locale === 'ar' ? 'إيقاف' : 'Deactivate')
                    : (locale === 'ar' ? 'تفعيل' : 'Activate')"
                  @click="handleToggle(member)"
                >
                  <UIcon :name="member.is_active ? 'i-lucide-pause-circle' : 'i-lucide-play-circle'" class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-danger-600 hover:bg-danger-500/10 transition-colors"
                  :title="$t('common.remove')"
                  @click="handleRemove(member)"
                >
                  <UIcon name="i-lucide-user-x" class="w-3.5 h-3.5" />
                </button>
              </div>
            </Can>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <Can :perm="PERMISSIONS.MANAGE_TEAM">
              <template #fallback>
                <UiBadge :color="roleColor(member.role)">{{ roleLabel(member.role) }}</UiBadge>
              </template>
              <div class="relative">
                <select
                  :value="member.role"
                  class="member-role-select"
                  :class="`role-${member.role}`"
                  @change="handleRoleChange(member, ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="r in availableRoles" :key="r.name" :value="r.name">{{ roleLabel(r.name) }}</option>
                </select>
                <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
              </div>
            </Can>
            <UiBadge :color="member.is_active ? 'green' : 'gray'" dot>
              {{ member.is_active
                ? (locale === 'ar' ? 'نشط' : 'Active')
                : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
            </UiBadge>
          </div>
        </div>
      </div>

      <!-- Invite slideover -->
      <UiSlideOver v-model="inviteOpen" :title="locale === 'ar' ? 'دعوة عضو جديد' : 'Invite Team Member'">
        <form @submit.prevent="handleInvite" class="space-y-4">
          <div>
            <label class="form-label">
              {{ $t('auth.fullName') }}
              <span class="text-danger-500">*</span>
            </label>
            <input
              v-model="invite.values.name"
              type="text"
              class="input-field"
              :class="{ 'input-error': invite.errors.value.name }"
              @input="invite.clearError('name')"
            />
            <p v-if="invite.errors.value.name" class="form-error">{{ invite.errors.value.name }}</p>
          </div>
          <div>
            <label class="form-label">
              {{ $t('auth.email') }}
              <span class="text-danger-500">*</span>
            </label>
            <input
              v-model="invite.values.email"
              type="email"
              class="input-field"
              :class="{ 'input-error': invite.errors.value.email }"
              dir="ltr"
              @input="invite.clearError('email')"
            />
            <p v-if="invite.errors.value.email" class="form-error">{{ invite.errors.value.email }}</p>
          </div>
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'الدور' : 'Role' }}</label>
            <div class="relative">
              <select v-model="invite.values.role" class="input-field">
                <option value="accountant">{{ locale === 'ar' ? 'محاسب' : 'Accountant' }}</option>
                <option value="auditor">{{ locale === 'ar' ? 'مراجع' : 'Auditor' }}</option>
                <option value="admin">{{ locale === 'ar' ? 'مدير' : 'Admin' }}</option>
              </select>
              <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
            <p v-if="invite.errors.value.role" class="form-error">{{ invite.errors.value.role }}</p>
          </div>
          <div class="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="button" variant="outline" class="flex-1" @click="inviteOpen = false">
              {{ $t('common.cancel') }}
            </UiAppButton>
            <UiAppButton
              type="submit"
              variant="primary"
              icon="i-lucide-mail"
              :loading="invite.submitting.value"
              class="flex-1"
            >
              {{ locale === 'ar' ? 'إرسال الدعوة' : 'Send Invite' }}
            </UiAppButton>
          </div>
        </form>
      </UiSlideOver>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import { teamInviteDefaults, teamInviteSchema, type TeamInviteInput } from '~/features/team/schemas'
import type { ApiError } from '~/core/api/errors'
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()
const { can } = usePermissions()

const members = ref<any[]>([])
const availableRoles = ref<any[]>([])
const loading = ref(true)
const inviteOpen = ref(false)

const totalLabel = computed(() => {
  const n = members.value.length.toLocaleString()
  if (locale.value === 'ar') return `${n} عضو`
  return `${n} ${members.value.length === 1 ? 'member' : 'members'}`
})

const invite = useZodForm<TeamInviteInput>({
  schema: teamInviteSchema,
  initial: { ...teamInviteDefaults },
})

const ROLE_AR: Record<string, string> = {
  admin: 'مدير', accountant: 'محاسب', auditor: 'مراجع', client: 'عميل', super_admin: 'مدير عام',
}
const ROLE_EN: Record<string, string> = {
  admin: 'Admin', accountant: 'Accountant', auditor: 'Auditor', client: 'Client', super_admin: 'Super Admin',
}
function roleLabel(role: string) {
  const map = locale.value === 'ar' ? ROLE_AR : ROLE_EN
  return map[role] ?? role
}

async function load() {
  loading.value = true
  try {
    const [teamRes, rolesRes] = await Promise.all([
      api.get<{ data: any[] }>('/team'),
      api.get<{ data: any[] }>('/roles').catch(() => ({ data: [{ name: 'admin' }, { name: 'accountant' }, { name: 'auditor' }] })),
    ])
    members.value = teamRes.data
    availableRoles.value = rolesRes.data
  } catch (e: any) {
    members.value = []
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل الفريق' : 'Failed to load team'))
  } finally {
    loading.value = false
  }
}

// Handler-level guards in addition to the <Can> wrappers. Defense in depth:
// if a button slips past the UI gate (devtools, stale render), the handler
// still refuses to hit the API.
function guardManageTeam(): boolean {
  if (can(PERMISSIONS.MANAGE_TEAM)) return true
  toastStore.error(locale.value === 'ar' ? 'لا تملك صلاحية إدارة الفريق' : 'You do not have permission to manage the team')
  return false
}

async function handleRoleChange(member: any, newRole: string) {
  if (!guardManageTeam()) return
  try {
    await api.put(`/team/${member.id}/role`, { role: newRole })
    member.role = newRole
    toastStore.success(locale.value === 'ar' ? 'تم تغيير الدور' : 'Role changed')
  } catch (e: any) {
    toastStore.error(e?.data?.message || e?.message || 'Error')
  }
}

async function handleInvite() {
  if (!guardManageTeam()) return
  const result = await invite.handleSubmit(async (data) => {
    await api.post('/team/invite', data)
  })
  if (result.ok) {
    toastStore.success(locale.value === 'ar' ? 'تم إرسال الدعوة' : 'Invite sent')
    inviteOpen.value = false
    invite.reset()
    load()
  } else if ('error' in result && result.error) {
    const err = result.error as ApiError
    invite.applyApiErrors(err)
    toastStore.error(err.message || 'Error')
  }
}

async function handleToggle(member: any) {
  if (!guardManageTeam()) return
  try {
    await api.patch(`/team/${member.id}/toggle-active`)
    toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Updated')
    load()
  } catch (e: any) {
    toastStore.error(e?.data?.message || e?.message || 'Error')
  }
}

async function handleRemove(member: any) {
  if (!guardManageTeam()) return
  if (!confirm(locale.value === 'ar' ? 'هل تريد فعلاً إزالة هذا العضو؟' : 'Really remove this member?')) return
  try {
    await api.delete(`/team/${member.id}`)
    toastStore.success(locale.value === 'ar' ? 'تم الإزالة' : 'Removed')
    load()
  } catch (e: any) {
    toastStore.error(e?.data?.message || e?.message || 'Error')
  }
}

function roleColor(role: string) {
  return ({
    admin: 'purple', accountant: 'blue', auditor: 'orange',
    client: 'green', super_admin: 'red',
  } as Record<string, string>)[role] || 'gray'
}

onMounted(load)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.form-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.form-error { @apply mt-1 text-xs text-danger-600 dark:text-danger-500; }

.input-field {
  width: 100%;
  padding-inline: 0.75rem;
  height: 2.25rem;
  font-size: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard);
  appearance: none;
}
.input-field:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
.input-error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }

:global(html.dark) .input-field {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}

/* Member-card inline role select — small, badge-like. Compact density
   so the row of [role select] [active badge] fits on one line. */
.member-role-select {
  height: 1.5rem;
  padding-inline: 0.5rem 1.25rem;
  font-size: 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-700);
  outline: none;
  appearance: none;
  cursor: pointer;
}
.member-role-select:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 15%, transparent);
}
:global(html.dark) .member-role-select {
  background-color: var(--color-neutral-800);
  border-color: var(--color-neutral-700);
  color: var(--color-neutral-200);
}
</style>
