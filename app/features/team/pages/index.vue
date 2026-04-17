<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="team">
      <UiPageHeader :title="$t('nav.team')">
        <template #actions>
          <UiAppButton variant="primary" @click="inviteOpen = true">
            {{ locale === 'ar' ? '+ دعوة عضو' : '+ Invite Member' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <div v-if="loading" class="space-y-3">
        <UiLoadingSkeleton :lines="5" :height="60" />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(member, i) in members"
          :key="member.id"
          v-motion
          :initial="{ opacity: 0, y: 15 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: i * 60 } }"
          class="bg-white rounded-2xl border border-gray-100/80 p-5 card-hover"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <span class="text-primary-500 font-bold">{{ member.name?.charAt(0) }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ member.name }}</p>
                <p class="text-xs text-gray-400" dir="ltr">{{ member.email }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button @click="handleToggle(member)" class="p-1 text-gray-300 hover:text-amber-500 transition" :title="member.is_active ? 'Deactivate' : 'Activate'">
                {{ member.is_active ? '&#9724;' : '&#9654;' }}
              </button>
              <button @click="handleRemove(member)" class="p-1 text-gray-300 hover:text-red-500 transition">&#10005;</button>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <select
              :value="member.role"
              @change="handleRoleChange(member, ($event.target as HTMLSelectElement).value)"
              class="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 outline-none focus:border-primary-500 transition cursor-pointer"
            >
              <option v-for="r in availableRoles" :key="r.name" :value="r.name">{{ r.name }}</option>
            </select>
            <UiBadge :color="member.is_active ? 'green' : 'gray'" dot>
              {{ member.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
            </UiBadge>
          </div>
        </div>
      </div>

      <!-- Invite SlideOver -->
      <UiSlideOver v-model="inviteOpen" :title="locale === 'ar' ? 'دعوة عضو جديد' : 'Invite Team Member'">
        <form @submit.prevent="handleInvite" class="space-y-4">
          <div>
            <label class="form-label">{{ $t('auth.fullName') }} *</label>
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
            <label class="form-label">{{ $t('auth.email') }} *</label>
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
            <select v-model="invite.values.role" class="input-field">
              <option value="accountant">{{ locale === 'ar' ? 'محاسب' : 'Accountant' }}</option>
              <option value="auditor">{{ locale === 'ar' ? 'مراجع' : 'Auditor' }}</option>
              <option value="admin">{{ locale === 'ar' ? 'مدير' : 'Admin' }}</option>
            </select>
            <p v-if="invite.errors.value.role" class="form-error">{{ invite.errors.value.role }}</p>
          </div>
          <div class="flex gap-3 pt-4 border-t border-gray-100">
            <UiAppButton type="submit" variant="primary" :loading="invite.submitting.value">{{ locale === 'ar' ? 'إرسال الدعوة' : 'Send Invite' }}</UiAppButton>
            <UiAppButton variant="outline" @click="inviteOpen = false">{{ $t('common.cancel') }}</UiAppButton>
          </div>
        </form>
      </UiSlideOver>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { teamInviteDefaults, teamInviteSchema, type TeamInviteInput } from '~/features/team/schemas'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const members = ref<any[]>([])
const availableRoles = ref<any[]>([])
const loading = ref(true)
const inviteOpen = ref(false)

const invite = useZodForm<TeamInviteInput>({
  schema: teamInviteSchema,
  initial: { ...teamInviteDefaults },
})

async function load() {
  loading.value = true
  try {
    const [teamRes, rolesRes] = await Promise.all([
      api.get<{ data: any[] }>('/team'),
      api.get<{ data: any[] }>('/roles').catch(() => ({ data: [{ name: 'admin' }, { name: 'accountant' }, { name: 'auditor' }] })),
    ])
    members.value = teamRes.data
    availableRoles.value = rolesRes.data
  } catch { members.value = [] }
  finally { loading.value = false }
}

async function handleRoleChange(member: any, newRole: string) {
  try {
    await api.put(`/team/${member.id}/role`, { role: newRole })
    member.role = newRole
    toastStore.success(locale.value === 'ar' ? 'تم تغيير الدور' : 'Role changed')
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

async function handleInvite() {
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
  try {
    await api.patch(`/team/${member.id}/toggle-active`)
    toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Updated')
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

async function handleRemove(member: any) {
  try {
    await api.delete(`/team/${member.id}`)
    toastStore.success(locale.value === 'ar' ? 'تم الإزالة' : 'Removed')
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

function roleColor(role: string) {
  return ({ admin: 'purple', accountant: 'blue', auditor: 'orange', client: 'green' } as Record<string, string>)[role] || 'gray'
}

onMounted(load)
</script>

<style scoped>
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.input-error { @apply border-red-300 focus:ring-red-500/20 focus:border-red-500; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
.form-error { @apply mt-1 text-xs text-red-500; }
</style>
