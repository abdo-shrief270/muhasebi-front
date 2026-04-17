<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="journal-entries">
      <UiPageHeader :title="locale === 'ar' ? 'قيد يومي جديد' : 'New Journal Entry'" />

      <div
        v-motion
        :initial="{ opacity: 0, y: 15 }"
        :enter="{ opacity: 1, y: 0 }"
        class="bg-white rounded-2xl border border-gray-100/80 p-6"
      >
        <form @submit.prevent="handleSubmit">
          <!-- Header fields -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label class="form-label">{{ $t('common.date') }} *</label>
              <input v-model="form.date" type="date" required class="input-field" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'البيان' : 'Description' }} *</label>
              <input v-model="form.description" type="text" required class="input-field" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'المرجع' : 'Reference' }}</label>
              <input v-model="form.reference" type="text" class="input-field" />
            </div>
          </div>

          <!-- Lines table -->
          <div class="border border-gray-100 rounded-xl overflow-hidden mb-4">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50/80">
                  <th class="px-4 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[300px]">{{ locale === 'ar' ? 'الحساب' : 'Account' }}</th>
                  <th class="px-4 py-3 text-start text-xs font-semibold text-gray-400 uppercase">{{ locale === 'ar' ? 'البيان' : 'Description' }}</th>
                  <th class="px-4 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[140px]">{{ locale === 'ar' ? 'مدين' : 'Debit' }}</th>
                  <th class="px-4 py-3 text-start text-xs font-semibold text-gray-400 uppercase w-[140px]">{{ locale === 'ar' ? 'دائن' : 'Credit' }}</th>
                  <th class="w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(line, index) in form.lines"
                  :key="index"
                  class="border-t border-gray-50"
                >
                  <td class="px-3 py-2">
                    <select v-model="line.account_id" class="input-field-sm" required>
                      <option :value="null" disabled>{{ locale === 'ar' ? 'اختر حساب' : 'Select account' }}</option>
                      <option v-for="acc in leafAccounts" :key="acc.id" :value="acc.id">
                        {{ acc.code }} - {{ locale === 'ar' ? acc.name_ar : acc.name_en }}
                      </option>
                    </select>
                  </td>
                  <td class="px-3 py-2">
                    <input v-model="line.description" type="text" class="input-field-sm" />
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model="line.debit"
                      type="number"
                      step="0.01"
                      min="0"
                      class="input-field-sm font-mono"
                      dir="ltr"
                      @input="line.debit && (line.credit = '')"
                    />
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model="line.credit"
                      type="number"
                      step="0.01"
                      min="0"
                      class="input-field-sm font-mono"
                      dir="ltr"
                      @input="line.credit && (line.debit = '')"
                    />
                  </td>
                  <td class="px-2">
                    <button
                      v-if="form.lines.length > 2"
                      @click="removeLine(index)"
                      type="button"
                      class="text-gray-300 hover:text-red-500 transition"
                    >
                      &#10005;
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-gray-200 bg-gray-50/50">
                  <td colspan="2" class="px-4 py-3">
                    <button type="button" @click="addLine" class="text-sm text-secondary-400 hover:text-secondary-500 font-medium">
                      + {{ locale === 'ar' ? 'إضافة سطر' : 'Add line' }}
                    </button>
                  </td>
                  <td class="px-4 py-3 font-mono font-bold text-sm" dir="ltr" :class="isBalanced ? 'text-emerald-600' : 'text-red-500'">
                    {{ totalDebit.toLocaleString() }}
                  </td>
                  <td class="px-4 py-3 font-mono font-bold text-sm" dir="ltr" :class="isBalanced ? 'text-emerald-600' : 'text-red-500'">
                    {{ totalCredit.toLocaleString() }}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Balance indicator -->
          <div class="flex items-center gap-2 mb-6">
            <UiBadge :color="isBalanced ? 'green' : 'red'" dot>
              {{ isBalanced ? (locale === 'ar' ? 'متوازن' : 'Balanced') : (locale === 'ar' ? 'غير متوازن' : 'Not balanced') }}
            </UiBadge>
            <span v-if="!isBalanced" class="text-xs text-red-400">
              {{ locale === 'ar' ? `الفرق: ${difference.toLocaleString()}` : `Difference: ${difference.toLocaleString()}` }}
            </span>
          </div>

          <div class="flex gap-3">
            <UiAppButton type="submit" variant="primary" :loading="submitting" :disabled="!isBalanced">
              {{ $t('common.save') }}
            </UiAppButton>
            <UiAppButton variant="outline" @click="navigateTo('/journal-entries')">
              {{ $t('common.cancel') }}
            </UiAppButton>
          </div>
        </form>
      </div>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { Account } from '~/shared/types/accounting'

definePageMeta({ layout: false })

const { locale } = useI18n()
const { tree, fetchTree } = useAccounts()
const { createEntry } = useJournalEntries()
const toastStore = useToastStore()

const submitting = ref(false)

const form = reactive({
  date: new Date().toISOString().split('T')[0],
  description: '',
  reference: '',
  lines: [
    { account_id: null as number | null, description: '', debit: '', credit: '' },
    { account_id: null as number | null, description: '', debit: '', credit: '' },
  ],
})

// Flatten tree to get leaf (non-group) accounts
const leafAccounts = computed(() => {
  const flat: Account[] = []
  function walk(nodes: Account[]) {
    for (const n of nodes) {
      if (!n.is_group) flat.push(n)
      if (n.children) walk(n.children)
    }
  }
  walk(tree.value)
  return flat
})

const totalDebit = computed(() => form.lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0))
const totalCredit = computed(() => form.lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0))
const difference = computed(() => Math.abs(totalDebit.value - totalCredit.value))
const isBalanced = computed(() => totalDebit.value > 0 && Math.abs(totalDebit.value - totalCredit.value) < 0.01)

function addLine() {
  form.lines.push({ account_id: null, description: '', debit: '', credit: '' })
}

function removeLine(index: number) {
  form.lines.splice(index, 1)
}

async function handleSubmit() {
  if (!isBalanced.value) return
  submitting.value = true
  try {
    const payload = {
      date: form.date,
      description: form.description,
      reference: form.reference || undefined,
      lines: form.lines.filter(l => l.account_id).map(l => ({
        account_id: l.account_id!,
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0,
        description: l.description || undefined,
      })),
    }
    await createEntry(payload)
    toastStore.success(locale.value === 'ar' ? 'تم إنشاء القيد' : 'Entry created')
    navigateTo('/journal-entries')
  } catch (e: any) {
    toastStore.error(e.data?.message || 'Error')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchTree)
</script>

<style scoped>
.input-field {
  @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50;
}
.input-field-sm {
  @apply w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-transparent;
}
.form-label {
  @apply block text-sm font-medium text-gray-600 mb-1;
}
</style>
