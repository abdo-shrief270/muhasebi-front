<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="journal-entries">
      <template v-if="loading">
        <UiLoadingSkeleton :lines="6" :height="24" />
      </template>

      <template v-else-if="entry">
        <div
          v-motion
          :initial="{ opacity: 0, y: -10 }"
          :enter="{ opacity: 1, y: 0 }"
          class="flex items-start justify-between mb-8"
        >
          <div class="flex items-center gap-4">
            <button @click="navigateTo('/journal-entries')" class="text-gray-300 hover:text-gray-500 transition">&#8592;</button>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-gray-800 font-mono">{{ entry.entry_number }}</h1>
                <UiBadge :color="statusColor(entry.status)" dot>{{ statusLabel(entry.status) }}</UiBadge>
              </div>
              <p class="text-sm text-gray-400 mt-0.5">{{ entry.date }} &middot; {{ entry.description }}</p>
            </div>
          </div>

          <div class="flex gap-2">
            <UiAppButton
              v-if="entry.status === 'draft'"
              variant="primary"
              size="sm"
              :loading="actionLoading"
              @click="handlePost"
            >
              {{ locale === 'ar' ? 'ترحيل' : 'Post' }}
            </UiAppButton>
            <UiAppButton
              v-if="entry.status === 'posted'"
              variant="outline"
              size="sm"
              :loading="actionLoading"
              @click="handleReverse"
            >
              {{ locale === 'ar' ? 'عكس' : 'Reverse' }}
            </UiAppButton>
            <UiAppButton
              v-if="entry.status === 'draft'"
              variant="danger"
              size="sm"
              @click="deleteConfirmOpen = true"
            >
              {{ $t('common.delete') }}
            </UiAppButton>
          </div>
        </div>

        <!-- Lines table -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 15 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
          class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden"
        >
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50/80 border-b border-gray-100">
                <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'الحساب' : 'Account' }}</th>
                <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'البيان' : 'Description' }}</th>
                <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[150px]">{{ locale === 'ar' ? 'مدين' : 'Debit' }}</th>
                <th class="px-5 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[150px]">{{ locale === 'ar' ? 'دائن' : 'Credit' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in entry.lines" :key="line.id" class="border-b border-gray-50">
                <td class="px-5 py-3">
                  <span class="font-mono text-xs text-gray-400 me-2">{{ line.account?.code }}</span>
                  <span class="text-gray-700">{{ locale === 'ar' ? line.account?.name_ar : line.account?.name_en }}</span>
                </td>
                <td class="px-5 py-3 text-gray-500">{{ line.description || '-' }}</td>
                <td class="px-5 py-3 font-mono" dir="ltr">
                  <span v-if="Number(line.debit) > 0" class="text-emerald-600 font-medium">{{ Number(line.debit).toLocaleString() }}</span>
                  <span v-else class="text-gray-200">-</span>
                </td>
                <td class="px-5 py-3 font-mono" dir="ltr">
                  <span v-if="Number(line.credit) > 0" class="text-blue-600 font-medium">{{ Number(line.credit).toLocaleString() }}</span>
                  <span v-else class="text-gray-200">-</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-200 bg-gray-50/80">
                <td colspan="2" class="px-5 py-3 font-bold text-gray-700">{{ $t('common.total') }}</td>
                <td class="px-5 py-3 font-mono font-bold text-emerald-600" dir="ltr">{{ Number(entry.total_debit).toLocaleString() }}</td>
                <td class="px-5 py-3 font-mono font-bold text-blue-600" dir="ltr">{{ Number(entry.total_credit).toLocaleString() }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Meta info -->
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 200 } }"
          class="mt-4 text-xs text-gray-300 flex items-center gap-4"
        >
          <span v-if="entry.created_by_user">{{ locale === 'ar' ? 'بواسطة' : 'By' }}: {{ entry.created_by_user.name }}</span>
          <span v-if="entry.posted_at">{{ locale === 'ar' ? 'ترحيل' : 'Posted' }}: {{ entry.posted_at }}</span>
          <span v-if="entry.reference">{{ locale === 'ar' ? 'مرجع' : 'Ref' }}: {{ entry.reference }}</span>
        </div>

        <UiConfirmModal
          v-model="deleteConfirmOpen"
          :title="locale === 'ar' ? 'حذف القيد' : 'Delete Entry'"
          :description="locale === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'"
          icon="&#9888;"
          variant="danger"
          :confirm-label="$t('common.delete')"
          @confirm="handleDelete"
        />
      </template>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { JournalEntry } from '~/shared/types/accounting'

definePageMeta({ layout: false })

const { locale } = useI18n()
const route = useRoute()
const { getEntry, postEntry, reverseEntry, deleteEntry } = useJournalEntries()
const toastStore = useToastStore()

const entry = ref<JournalEntry | null>(null)
const loading = ref(true)
const actionLoading = ref(false)
const deleteConfirmOpen = ref(false)

async function loadEntry() {
  loading.value = true
  try {
    entry.value = await getEntry(Number(route.params.id))
  } catch {
    toastStore.error('Entry not found')
    navigateTo('/journal-entries')
  } finally {
    loading.value = false
  }
}

async function handlePost() {
  actionLoading.value = true
  try {
    entry.value = await postEntry(entry.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم ترحيل القيد' : 'Entry posted')
  } catch (e: any) {
    toastStore.error(e.data?.message || 'Error')
  } finally {
    actionLoading.value = false
  }
}

async function handleReverse() {
  actionLoading.value = true
  try {
    entry.value = await reverseEntry(entry.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم عكس القيد' : 'Entry reversed')
  } catch (e: any) {
    toastStore.error(e.data?.message || 'Error')
  } finally {
    actionLoading.value = false
  }
}

async function handleDelete() {
  try {
    await deleteEntry(entry.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
    navigateTo('/journal-entries')
  } catch (e: any) {
    toastStore.error(e.data?.message || 'Error')
  }
  deleteConfirmOpen.value = false
}

function statusColor(s: string) {
  return { draft: 'gray', posted: 'green', reversed: 'orange' }[s] || 'gray'
}

function statusLabel(s: string) {
  if (locale.value === 'ar') return { draft: 'مسودة', posted: 'مرحّل', reversed: 'معكوس' }[s] || s
  return s
}

onMounted(loadEntry)
</script>
