<template>
  <FeatureBoundary id="approvals">
    <div class="px-4 lg:px-6 py-5 max-w-3xl mx-auto">
      <UiPageHeader
        icon="i-lucide-check-square"
        :title="locale === 'ar' ? 'الموافقات' : 'Approvals'"
        :subtitle="locale === 'ar' ? 'طلبات الموافقة المعلّقة الموجَّهة إليك' : 'Pending approval requests assigned to you'"
      />

      <Can :perm="PERMISSIONS.MANAGE_APPROVALS">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
          </div>
        </template>

        <div v-if="loading" class="space-y-2">
          <div v-for="i in 5" :key="i" class="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>

        <div v-else>
          <!-- Empty state — celebrate inbox-zero -->
          <div
            v-if="!pending.length"
            class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 py-12 text-center"
          >
            <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-success-500/10 flex items-center justify-center">
              <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-success-600 dark:text-success-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا توجد طلبات معلّقة' : 'Nothing to approve' }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ locale === 'ar' ? 'ستظهر هنا الطلبات التي تنتظر إجراءك.' : 'Requests waiting on your action will show up here.' }}
            </p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(req, i) in pending"
              :key="req.id"
              v-motion
              :initial="{ opacity: 0, y: 8 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: i * 30 } }"
              class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
            >
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                    <UiBadge color="blue" size="sm">{{ entityLabel(req.entity_type) }}</UiBadge>
                    <span class="font-mono text-[11px] text-neutral-500 dark:text-neutral-400" dir="ltr">#{{ req.entity_id }}</span>
                    <UiBadge :color="statusColor(req.status)" size="sm">{{ statusLabel(req.status) }}</UiBadge>
                  </div>
                  <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 truncate">
                    {{ workflowName(req) }}
                  </p>
                  <div class="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 flex flex-wrap gap-x-3 gap-y-1">
                    <span v-if="req.amount != null" class="font-mono tabular-nums text-neutral-700 dark:text-neutral-300" dir="ltr">
                      {{ formatAmount(req.amount) }}
                    </span>
                    <span v-if="req.requester" class="inline-flex items-center gap-1">
                      <UIcon name="i-lucide-user" class="w-3 h-3" />
                      {{ req.requester.name }}
                    </span>
                    <span class="inline-flex items-center gap-1">
                      <UIcon name="i-lucide-clock" class="w-3 h-3" />
                      {{ formatDate(req.submitted_at) }}
                    </span>
                    <span v-if="req.current_step != null" class="inline-flex items-center gap-1">
                      <UIcon name="i-lucide-list-checks" class="w-3 h-3" />
                      {{ locale === 'ar' ? `الخطوة ${req.current_step}` : `Step ${req.current_step}` }}
                    </span>
                  </div>
                </div>

                <div class="flex flex-col items-end gap-1.5 shrink-0">
                  <div class="flex gap-1.5">
                    <UiAppButton
                      variant="primary"
                      size="sm"
                      icon="i-lucide-check"
                      :loading="busyId === req.id && busyAction === 'approve'"
                      @click="approve(req)"
                    >
                      {{ locale === 'ar' ? 'موافقة' : 'Approve' }}
                    </UiAppButton>
                    <UiAppButton
                      variant="outline"
                      size="sm"
                      icon="i-lucide-x"
                      :disabled="busyId === req.id"
                      @click="openReject(req)"
                    >
                      {{ locale === 'ar' ? 'رفض' : 'Reject' }}
                    </UiAppButton>
                  </div>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-primary-500 transition-colors"
                    @click="toggleTrail(req)"
                  >
                    <UIcon
                      :name="expandedId === req.id ? 'i-lucide-chevron-up' : 'i-lucide-history'"
                      class="w-3 h-3"
                    />
                    {{ expandedId === req.id
                        ? (locale === 'ar' ? 'إخفاء السجل' : 'Hide trail')
                        : (locale === 'ar' ? 'سجل الإجراءات' : 'Show trail') }}
                  </button>
                </div>
              </div>

              <!-- Action trail — loaded on demand. -->
              <div
                v-if="expandedId === req.id"
                class="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2"
              >
                <p v-if="trailLoading" class="text-xs text-neutral-400 flex items-center gap-1">
                  <UIcon name="i-lucide-loader-2" class="w-3 h-3 animate-spin" />
                  {{ locale === 'ar' ? 'جارٍ تحميل السجل...' : 'Loading trail...' }}
                </p>
                <div v-else-if="trailActions.length" class="space-y-2">
                  <div
                    v-for="(action, j) in trailActions"
                    :key="`${action.step}-${action.acted_at}-${j}`"
                    class="flex items-start gap-3 text-xs"
                  >
                    <span
                      class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      :class="action.decision === 'approved'
                        ? 'bg-success-500/10 text-success-600 dark:text-success-400'
                        : 'bg-danger-500/10 text-danger-600 dark:text-danger-400'"
                    >
                      <UIcon
                        :name="action.decision === 'approved' ? 'i-lucide-check' : 'i-lucide-x'"
                        class="w-3 h-3"
                      />
                    </span>
                    <div class="flex-1 min-w-0">
                      <p class="text-neutral-700 dark:text-neutral-200">
                        <span class="font-medium text-neutral-900 dark:text-neutral-0">
                          {{ action.actor?.name || `#${action.approver_id}` }}
                        </span>
                        <span class="text-neutral-400 mx-1">·</span>
                        <span class="text-neutral-500 dark:text-neutral-400">
                          {{ locale === 'ar' ? `الخطوة ${action.step}` : `Step ${action.step}` }}
                        </span>
                        <span class="text-neutral-400 mx-1">·</span>
                        <span class="text-neutral-500 dark:text-neutral-400">{{ formatDate(action.acted_at) }}</span>
                      </p>
                      <p v-if="action.comment" class="text-neutral-600 dark:text-neutral-400 mt-0.5">{{ action.comment }}</p>
                    </div>
                  </div>
                </div>
                <p v-else class="text-xs text-neutral-400">
                  {{ locale === 'ar' ? 'لا يوجد سجل إجراءات حتى الآن.' : 'No action history yet.' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Reject slideover -->
        <UiSlideOver v-model="rejectOpen" :title="locale === 'ar' ? 'رفض الطلب' : 'Reject Request'">
          <form v-if="rejectTarget" @submit.prevent="confirmReject" class="space-y-4">
            <div class="rounded-xl bg-danger-500/5 border border-danger-500/20 p-3">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {{ entityLabel(rejectTarget.entity_type) }} <span class="font-mono" dir="ltr">#{{ rejectTarget.entity_id }}</span>
              </p>
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 mt-1">{{ workflowName(rejectTarget) }}</p>
            </div>

            <div>
              <label class="ap-label">
                {{ locale === 'ar' ? 'سبب الرفض' : 'Reason for rejection' }}
                <span class="text-danger-500">*</span>
              </label>
              <textarea
                v-model="rejectComment"
                rows="4"
                maxlength="2000"
                class="ap-input resize-none"
                :class="{ 'ap-input--error': !!rejectError }"
                required
                :placeholder="locale === 'ar' ? 'اشرح سبب الرفض — سيظهر لمقدّم الطلب' : 'Explain why — visible to the requester'"
              />
              <p v-if="rejectError" class="ap-error">{{ rejectError }}</p>
            </div>

            <div class="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <UiAppButton type="button" variant="outline" :disabled="rejectSubmitting" class="flex-1" @click="rejectOpen = false">
                {{ $t('common.cancel') }}
              </UiAppButton>
              <UiAppButton type="submit" variant="danger" icon="i-lucide-x-circle" :loading="rejectSubmitting" class="flex-1">
                {{ locale === 'ar' ? 'تأكيد الرفض' : 'Confirm Reject' }}
              </UiAppButton>
            </div>
          </form>
        </UiSlideOver>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import {
  approvalsService,
  type ApprovalRequest,
  type ApprovalStatus,
  type ApprovalAction,
  type ApprovableEntity,
} from '~/features/approvals/services/approvalService'
import { generateIdempotencyKey } from '~/core/api/requestId'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()
const { can } = usePermissions()

const service = approvalsService()
const pending = ref<ApprovalRequest[]>([])
const loading = ref(true)

const busyId = ref<number | null>(null)
const busyAction = ref<'approve' | 'reject' | null>(null)

const expandedId = ref<number | null>(null)
const trailActions = ref<ApprovalAction[]>([])
const trailLoading = ref(false)

const rejectOpen = ref(false)
const rejectTarget = ref<ApprovalRequest | null>(null)
const rejectComment = ref('')
const rejectError = ref('')
const rejectSubmitting = ref(false)

function guardManageApprovals(): boolean {
  if (can(PERMISSIONS.MANAGE_APPROVALS)) return true
  toastStore.error(locale.value === 'ar' ? 'لا تملك صلاحية إدارة الموافقات' : 'You do not have permission to manage approvals')
  return false
}

function entityLabel(type: ApprovableEntity): string {
  const map: Record<ApprovableEntity, { ar: string; en: string }> = {
    bill:           { ar: 'فاتورة مورد', en: 'Bill' },
    expense:        { ar: 'مصروف',       en: 'Expense' },
    journal_entry:  { ar: 'قيد يومية',   en: 'Journal Entry' },
    leave_request:  { ar: 'طلب إجازة',   en: 'Leave' },
    payroll_run:    { ar: 'مسيّر رواتب', en: 'Payroll Run' },
  }
  const entry = map[type]
  return entry ? (locale.value === 'ar' ? entry.ar : entry.en) : type
}

function statusLabel(status: ApprovalStatus): string {
  const map: Record<ApprovalStatus, { ar: string; en: string }> = {
    pending:     { ar: 'معلّق',       en: 'Pending' },
    in_progress: { ar: 'قيد المعالجة', en: 'In progress' },
    approved:    { ar: 'موافق عليه',   en: 'Approved' },
    rejected:    { ar: 'مرفوض',        en: 'Rejected' },
    timed_out:   { ar: 'انتهت المهلة', en: 'Timed out' },
  }
  const entry = map[status]
  return entry ? (locale.value === 'ar' ? entry.ar : entry.en) : status
}

function statusColor(status: ApprovalStatus): 'gray' | 'blue' | 'orange' | 'green' | 'red' {
  const map: Record<ApprovalStatus, 'gray' | 'blue' | 'orange' | 'green' | 'red'> = {
    pending:     'orange',
    in_progress: 'blue',
    approved:    'green',
    rejected:    'red',
    timed_out:   'gray',
  }
  return map[status] || 'gray'
}

function workflowName(req: ApprovalRequest): string {
  const w = req.workflow
  if (!w) return entityLabel(req.entity_type)
  return (locale.value === 'ar' ? w.name_ar : w.name_en) || w.name_ar || entityLabel(req.entity_type)
}

function formatDate(s: string): string {
  const d = new Date(s)
  return d.toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-EG' : 'en-US').format(n)
}

async function load() {
  loading.value = true
  try {
    pending.value = await service.pending()
  } catch {
    toastStore.error(locale.value === 'ar' ? 'فشل تحميل الطلبات' : 'Failed to load requests')
  } finally {
    loading.value = false
  }
}

async function approve(req: ApprovalRequest) {
  if (!guardManageApprovals()) return
  busyId.value = req.id
  busyAction.value = 'approve'
  try {
    await service.approve(req.id, undefined, generateIdempotencyKey())
    toastStore.success(locale.value === 'ar' ? 'تمت الموافقة' : 'Approved')
    await load()
  } catch (e: unknown) {
    const err = e as ApiError
    toastStore.error(err?.message || (locale.value === 'ar' ? 'فشلت الموافقة' : 'Approve failed'))
  } finally {
    busyId.value = null
    busyAction.value = null
  }
}

function openReject(req: ApprovalRequest) {
  if (!guardManageApprovals()) return
  rejectTarget.value = req
  rejectComment.value = ''
  rejectError.value = ''
  rejectOpen.value = true
}

async function confirmReject() {
  if (!guardManageApprovals()) return
  if (!rejectTarget.value) return
  const comment = rejectComment.value.trim()
  if (!comment) {
    rejectError.value = locale.value === 'ar' ? 'يجب توضيح سبب الرفض' : 'A reason is required'
    return
  }

  rejectSubmitting.value = true
  try {
    await service.reject(rejectTarget.value.id, comment, generateIdempotencyKey())
    toastStore.success(locale.value === 'ar' ? 'تم الرفض' : 'Rejected')
    rejectOpen.value = false
    await load()
  } catch (e: unknown) {
    const err = e as ApiError
    toastStore.error(err?.message || (locale.value === 'ar' ? 'فشل الرفض' : 'Reject failed'))
  } finally {
    rejectSubmitting.value = false
  }
}

async function toggleTrail(req: ApprovalRequest) {
  if (expandedId.value === req.id) {
    expandedId.value = null
    trailActions.value = []
    return
  }
  expandedId.value = req.id
  trailActions.value = []
  trailLoading.value = true
  try {
    // history is keyed by (entity_type, entity_id) — returns all ApprovalRequests
    // for that entity (including prior attempts). Flatten into actions[].
    const history = await service.history({ entity_type: req.entity_type, entity_id: req.entity_id })
    trailActions.value = history
      .flatMap(h => h.actions ?? h.approvals ?? [])
      .sort((a, b) => (a.acted_at > b.acted_at ? 1 : -1))
  } catch {
    trailActions.value = []
  } finally {
    trailLoading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.ap-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.ap-error { @apply mt-1 text-xs text-danger-600 dark:text-danger-500; }

.ap-input {
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
textarea.ap-input { height: auto; padding-block: 0.5rem; }
.ap-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
.ap-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }
:global(html.dark) .ap-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
