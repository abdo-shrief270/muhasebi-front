<template>
  <FeatureBoundary id="journal-entries">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-book-plus"
        :title="locale === 'ar' ? 'قيد يومي جديد' : 'New Journal Entry'"
        :subtitle="locale === 'ar' ? 'سجل قيداً يدوياً متوازناً في دفتر الأستاذ' : 'Record a manually balanced entry in the general ledger'"
      />

      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <form @submit.prevent="onSubmit">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label class="je-label">{{ $t('common.date') }} <span class="text-danger-500">*</span></label>
              <input v-model="values.date" type="date" class="je-input" :class="{ 'je-input-error': errors.date }" @input="clearError('date')" />
              <p v-if="errors.date" class="je-error">{{ errors.date }}</p>
            </div>
            <div>
              <label class="je-label">{{ locale === 'ar' ? 'البيان' : 'Description' }} <span class="text-danger-500">*</span></label>
              <input v-model="values.description" type="text" class="je-input" :class="{ 'je-input-error': errors.description }" @input="clearError('description')" />
              <p v-if="errors.description" class="je-error">{{ errors.description }}</p>
            </div>
            <div>
              <label class="je-label">{{ locale === 'ar' ? 'المرجع' : 'Reference' }}</label>
              <input v-model="values.reference" type="text" class="je-input" />
            </div>
          </div>

          <div
            class="rounded-xl border overflow-hidden mb-2"
            :class="errors.lines
              ? 'border-danger-300 dark:border-danger-700'
              : 'border-neutral-200 dark:border-neutral-800'"
          >
            <table class="w-full text-sm">
              <thead class="bg-neutral-50/60 dark:bg-neutral-950/40 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <tr>
                  <th class="text-start px-3 py-2 font-semibold w-[300px]">{{ locale === 'ar' ? 'الحساب' : 'Account' }}</th>
                  <th class="text-start px-3 py-2 font-semibold">{{ locale === 'ar' ? 'البيان' : 'Description' }}</th>
                  <th class="text-end px-3 py-2 font-semibold w-[140px]">{{ locale === 'ar' ? 'مدين' : 'Debit' }}</th>
                  <th class="text-end px-3 py-2 font-semibold w-[140px]">{{ locale === 'ar' ? 'دائن' : 'Credit' }}</th>
                  <th class="w-10"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                <tr v-for="(line, index) in values.lines" :key="index">
                  <td class="px-2 py-1.5">
                    <div class="relative">
                      <select v-model.number="line.account_id" class="je-input-sm">
                        <option :value="0" disabled>{{ locale === 'ar' ? 'اختر حساب' : 'Select account' }}</option>
                        <option v-for="acc in leafAccounts" :key="acc.id" :value="acc.id">
                          {{ acc.code }} - {{ locale === 'ar' ? acc.name_ar : acc.name_en }}
                        </option>
                      </select>
                      <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                    </div>
                  </td>
                  <td class="px-2 py-1.5">
                    <input v-model="line.description" type="text" class="je-input-sm" />
                  </td>
                  <td class="px-2 py-1.5">
                    <input
                      v-model.number="line.debit"
                      type="number"
                      step="0.01"
                      min="0"
                      class="je-input-sm font-mono text-end"
                      dir="ltr"
                      @input="Number(line.debit) > 0 && (line.credit = 0)"
                    />
                  </td>
                  <td class="px-2 py-1.5">
                    <input
                      v-model.number="line.credit"
                      type="number"
                      step="0.01"
                      min="0"
                      class="je-input-sm font-mono text-end"
                      dir="ltr"
                      @input="Number(line.credit) > 0 && (line.debit = 0)"
                    />
                  </td>
                  <td class="px-1.5 text-center">
                    <button
                      v-if="values.lines.length > 2"
                      type="button"
                      class="je-row-remove"
                      :aria-label="locale === 'ar' ? 'حذف السطر' : 'Remove line'"
                      @click="removeLine(index)"
                    >
                      <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40">
                  <td colspan="2" class="px-3 py-2.5">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                      @click="addLine"
                    >
                      <UIcon name="i-lucide-plus" class="w-3.5 h-3.5" />
                      {{ locale === 'ar' ? 'إضافة سطر' : 'Add line' }}
                    </button>
                  </td>
                  <td
                    class="px-3 py-2.5 text-end font-mono font-bold text-sm tabular-nums"
                    :class="isBalanced ? 'text-success-700 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'"
                    dir="ltr"
                  >
                    {{ totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </td>
                  <td
                    class="px-3 py-2.5 text-end font-mono font-bold text-sm tabular-nums"
                    :class="isBalanced ? 'text-success-700 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'"
                    dir="ltr"
                  >
                    {{ totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p v-if="errors.lines" class="je-error mb-3">{{ errors.lines }}</p>

          <div class="flex items-center gap-2 mb-4">
            <UiBadge :color="isBalanced ? 'green' : 'red'" dot>
              {{ isBalanced ? (locale === 'ar' ? 'متوازن' : 'Balanced') : (locale === 'ar' ? 'غير متوازن' : 'Not balanced') }}
            </UiBadge>
            <span v-if="!isBalanced" class="text-xs text-danger-600 dark:text-danger-400 tabular-nums">
              {{ locale === 'ar' ? 'الفرق:' : 'Difference:' }}
              <span class="font-mono ms-1" dir="ltr">{{ difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </span>
          </div>

          <div class="flex gap-2">
            <UiAppButton
              type="submit"
              variant="primary"
              icon="i-lucide-save"
              :loading="submitting || createMutation.loading.value"
              :disabled="!isBalanced"
            >
              {{ $t('common.save') }}
            </UiAppButton>
            <UiAppButton variant="outline" @click="navigateTo('/journal-entries')">
              {{ $t('common.cancel') }}
            </UiAppButton>
          </div>
        </form>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import type { Account } from '~/shared/types/accounting'
import { journalEntryFormDefaults, journalEntryFormSchema, type JournalEntryFormInput } from '~/features/journal-entries/schemas'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const { tree, fetchTree } = useAccounts()
const { create: createMutation } = useJournalEntryMutations()
const toastStore = useToastStore()

const { values, errors, submitting, clearError, handleSubmit, applyApiErrors } = useZodForm<JournalEntryFormInput>({
  schema: journalEntryFormSchema,
  initial: {
    ...journalEntryFormDefaults,
    lines: journalEntryFormDefaults.lines.map(l => ({ ...l })),
  },
})

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

const totalDebit = computed(() => values.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0))
const totalCredit = computed(() => values.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0))
const difference = computed(() => Math.abs(totalDebit.value - totalCredit.value))
const isBalanced = computed(() => totalDebit.value > 0 && difference.value < 0.01)

function addLine() {
  values.lines.push({ account_id: 0, description: '', debit: 0, credit: 0 })
}

function removeLine(index: number) {
  values.lines.splice(index, 1)
}

async function onSubmit() {
  const result = await handleSubmit(async (data) => {
    await createMutation.mutate(data as any)
  })

  if (result.ok) {
    toastStore.success(locale.value === 'ar' ? 'تم إنشاء القيد' : 'Entry created')
    navigateTo('/journal-entries')
  } else if ('error' in result && result.error) {
    const err = result.error as ApiError
    applyApiErrors(err)
    toastStore.error(err.message || 'Error')
  }
}

onMounted(fetchTree)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.je-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.je-error { @apply text-xs text-danger-600 dark:text-danger-400 mt-1; }

.je-input,
.je-input-sm {
  width: 100%;
  padding-inline: 0.75rem;
  font-size: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard);
  appearance: none;
}
.je-input { height: 2.25rem; }
.je-input-sm { height: 2rem; padding-inline: 0.625rem; font-size: 0.8125rem; }
.je-input:focus,
.je-input-sm:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
.je-input-error {
  border-color: var(--color-danger-400);
}
.je-input-error:focus {
  border-color: var(--color-danger-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-danger-500) 20%, transparent);
}

:global(html.dark) .je-input,
:global(html.dark) .je-input-sm {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}

.je-row-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-sm);
  color: var(--color-neutral-400);
  transition: color 150ms var(--ease-standard), background-color 150ms var(--ease-standard);
}
.je-row-remove:hover {
  color: var(--color-danger-600);
  background-color: color-mix(in oklab, var(--color-danger-500) 12%, transparent);
}
</style>
