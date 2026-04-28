<template>
  <FeatureBoundary id="journal-entries">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <template v-if="loading">
        <UiLoadingSkeleton :lines="6" :height="24" />
      </template>

      <template v-else-if="entry">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3 min-w-0">
            <button
              class="je-back"
              :aria-label="locale === 'ar' ? 'رجوع' : 'Back'"
              @click="navigateTo('/journal-entries')"
            >
              <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
            </button>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="font-mono text-xl font-bold text-neutral-900 dark:text-neutral-0">{{ entry.entry_number }}</h1>
                <UiBadge :color="statusColor(entry.status)" dot>{{ statusLabel(entry.status) }}</UiBadge>
              </div>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                <span dir="ltr">{{ entry.date }}</span>
                <span class="mx-1.5">·</span>
                <span>{{ entry.description }}</span>
              </p>
            </div>
          </div>

          <div class="flex gap-2 flex-shrink-0">
            <UiAppButton
              v-if="entry.status === 'draft'"
              variant="primary"
              size="sm"
              icon="i-lucide-send"
              :loading="actionLoading"
              @click="handlePost"
            >
              {{ locale === 'ar' ? 'ترحيل' : 'Post' }}
            </UiAppButton>
            <UiAppButton
              v-if="entry.status === 'posted'"
              variant="outline"
              size="sm"
              icon="i-lucide-undo-2"
              :loading="actionLoading"
              @click="handleReverse"
            >
              {{ locale === 'ar' ? 'عكس' : 'Reverse' }}
            </UiAppButton>
            <UiAppButton
              v-if="entry.status === 'draft'"
              variant="danger"
              size="sm"
              icon="i-lucide-trash-2"
              @click="deleteConfirmOpen = true"
            >
              {{ $t('common.delete') }}
            </UiAppButton>
          </div>
        </div>

        <!-- Lines table -->
        <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50/60 dark:bg-neutral-950/40 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <tr>
                <th class="text-start px-4 py-2 font-semibold">{{ locale === 'ar' ? 'الحساب' : 'Account' }}</th>
                <th class="text-start px-4 py-2 font-semibold">{{ locale === 'ar' ? 'البيان' : 'Description' }}</th>
                <th class="text-end px-4 py-2 font-semibold w-[140px]">{{ locale === 'ar' ? 'مدين' : 'Debit' }}</th>
                <th class="text-end px-4 py-2 font-semibold w-[140px]">{{ locale === 'ar' ? 'دائن' : 'Credit' }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              <tr v-for="line in entry.lines" :key="line.id" class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                <td class="px-4 py-2.5">
                  <span class="font-mono text-xs text-neutral-500 dark:text-neutral-400 me-2">{{ line.account?.code }}</span>
                  <span class="text-sm text-neutral-900 dark:text-neutral-0">{{ locale === 'ar' ? line.account?.name_ar : line.account?.name_en }}</span>
                </td>
                <td class="px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200">{{ line.description || '—' }}</td>
                <td class="px-4 py-2.5 text-end font-mono tabular-nums" dir="ltr">
                  <span v-if="Number(line.debit) > 0" class="text-success-700 dark:text-success-400 font-medium">{{ Number(line.debit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                  <span v-else class="text-neutral-300 dark:text-neutral-600">—</span>
                </td>
                <td class="px-4 py-2.5 text-end font-mono tabular-nums" dir="ltr">
                  <span v-if="Number(line.credit) > 0" class="text-info-700 dark:text-info-400 font-medium">{{ Number(line.credit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                  <span v-else class="text-neutral-300 dark:text-neutral-600">—</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40">
                <td colspan="2" class="px-4 py-3 text-sm font-bold text-neutral-900 dark:text-neutral-0">{{ $t('common.total') }}</td>
                <td class="px-4 py-3 text-end font-mono font-bold tabular-nums text-success-700 dark:text-success-400" dir="ltr">{{ Number(entry.total_debit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                <td class="px-4 py-3 text-end font-mono font-bold tabular-nums text-info-700 dark:text-info-400" dir="ltr">{{ Number(entry.total_credit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Meta info -->
        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span v-if="entry.created_by_user" class="inline-flex items-center gap-1">
            <UIcon name="i-lucide-user" class="w-3 h-3" />
            {{ entry.created_by_user.name }}
          </span>
          <span v-if="entry.posted_at" class="inline-flex items-center gap-1">
            <UIcon name="i-lucide-check-circle-2" class="w-3 h-3" />
            <span>{{ locale === 'ar' ? 'ترحيل:' : 'Posted:' }}</span>
            <span dir="ltr" class="tabular-nums">{{ entry.posted_at }}</span>
          </span>
          <span v-if="entry.reference" class="inline-flex items-center gap-1">
            <UIcon name="i-lucide-link-2" class="w-3 h-3" />
            <span>{{ locale === 'ar' ? 'مرجع:' : 'Ref:' }}</span>
            <span class="font-mono">{{ entry.reference }}</span>
          </span>
        </div>

        <UiConfirmModal
          v-model="deleteConfirmOpen"
          :title="locale === 'ar' ? 'حذف القيد' : 'Delete Entry'"
          :description="locale === 'ar' ? 'لا يمكن استرجاع القيد بعد حذفه.' : 'This entry cannot be recovered once deleted.'"
          icon="i-lucide-alert-triangle"
          variant="danger"
          :confirm-label="$t('common.delete')"
          @confirm="handleDelete"
        />
      </template>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const route = useRoute()
const toastStore = useToastStore()

const entryId = computed(() => Number(route.params.id))
const { data: entry, loading, error, refresh } = useJournalEntry(entryId)
const { post: postMutation, reverse: reverseMutation, remove: removeMutation } = useJournalEntryMutations()

watch(error, (e) => {
  if (e) {
    toastStore.error('Entry not found')
    navigateTo('/journal-entries')
  }
})

const actionLoading = computed(() => postMutation.loading.value || reverseMutation.loading.value)
const deleteConfirmOpen = ref(false)

async function handlePost() {
  try {
    await postMutation.mutate(entry.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم ترحيل القيد' : 'Entry posted')
    refresh()
  } catch (e) {
    const err = e as ApiError
    toastStore.error(err.message || 'Error')
  }
}

async function handleReverse() {
  try {
    await reverseMutation.mutate(entry.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم عكس القيد' : 'Entry reversed')
    refresh()
  } catch (e) {
    const err = e as ApiError
    toastStore.error(err.message || 'Error')
  }
}

async function handleDelete() {
  try {
    await removeMutation.mutate(entry.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
    navigateTo('/journal-entries')
  } catch (e) {
    const err = e as ApiError
    toastStore.error(err.message || 'Error')
  }
  deleteConfirmOpen.value = false
}

function statusColor(s: string) {
  return ({ draft: 'gray', posted: 'green', reversed: 'orange' } as Record<string, string>)[s] || 'gray'
}

function statusLabel(s: string) {
  if (locale.value === 'ar') return ({ draft: 'مسودة', posted: 'مرحّل', reversed: 'معكوس' } as Record<string, string>)[s] || s
  return s
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.je-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-500);
  transition: color 150ms var(--ease-standard), border-color 150ms var(--ease-standard);
}
.je-back:hover {
  color: var(--color-neutral-900);
  border-color: var(--color-neutral-300);
}
:global(html.dark) .je-back {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-400);
}
:global(html.dark) .je-back:hover {
  color: var(--color-neutral-0);
  border-color: var(--color-neutral-700);
}
</style>
