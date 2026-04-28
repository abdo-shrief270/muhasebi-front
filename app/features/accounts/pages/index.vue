<template>
  <FeatureBoundary id="accounts">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-list-tree"
        :title="$t('nav.accounts')"
        :subtitle="locale === 'ar' ? 'دليل الحسابات' : 'Chart of accounts'"
      >
        <template #actions>
          <UiAppButton variant="primary" icon="i-lucide-plus" @click="openCreate">
            {{ locale === 'ar' ? 'حساب جديد' : 'Add Account' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <!-- Tree view -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center gap-3">
          <UiSearchInput
            v-model="search"
            class="flex-1 max-w-md"
            :placeholder="locale === 'ar' ? 'بحث بالكود أو الاسم...' : 'Search by code or name...'"
          />
        </div>

        <div v-if="loading" class="p-4 space-y-2">
          <div v-for="i in 8" :key="i" class="h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>

        <div v-else-if="filteredTree.length > 0" class="py-2 max-h-[600px] overflow-y-auto">
          <UiTreeNode
            v-for="node in filteredTree"
            :key="node.id"
            :node="node"
            @select="selectedAccount = $event"
            @edit="openEdit($event)"
          />
        </div>

        <div v-else class="py-12 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <UIcon name="i-lucide-list-tree" class="w-5 h-5 text-neutral-400" />
          </div>
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
            {{ locale === 'ar' ? 'لا توجد حسابات' : 'No accounts yet' }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ locale === 'ar' ? 'أنشئ دليل حسابات أو ابدأ من قالب جاهز.' : 'Create accounts manually or start from a template.' }}
          </p>
        </div>
      </div>

      <!-- Account detail panel -->
      <Transition name="fade-slide">
        <div
          v-if="selectedAccount"
          class="mt-5 bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div class="min-w-0 flex-1">
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-0 flex items-center gap-2 flex-wrap">
                <span class="font-mono text-sm text-primary-700 dark:text-primary-400" dir="ltr">{{ selectedAccount.code }}</span>
                <span class="truncate">{{ locale === 'ar' ? selectedAccount.name_ar : selectedAccount.name_en }}</span>
              </h3>
              <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                <UiBadge :color="typeColor(selectedAccount.type)">{{ typeLabel(selectedAccount.type) }}</UiBadge>
                <UiBadge color="gray">{{ balanceLabel(selectedAccount.normal_balance) }}</UiBadge>
                <UiBadge :color="selectedAccount.is_active ? 'green' : 'gray'" dot>
                  {{ selectedAccount.is_active
                    ? (locale === 'ar' ? 'نشط' : 'Active')
                    : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
                </UiBadge>
              </div>
            </div>
            <div class="flex gap-1.5 flex-shrink-0">
              <UiAppButton variant="outline" size="sm" icon="i-lucide-receipt-text" @click="navigateTo(`/reports/ledger?account_id=${selectedAccount.id}`)">
                {{ locale === 'ar' ? 'دفتر الأستاذ' : 'Ledger' }}
              </UiAppButton>
              <UiAppButton variant="outline" size="sm" icon="i-lucide-pencil" @click="openEdit(selectedAccount)">
                {{ $t('common.edit') }}
              </UiAppButton>
              <button
                type="button"
                class="w-9 h-9 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                :title="$t('common.close')"
                @click="selectedAccount = null"
              >
                <UIcon name="i-lucide-x" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Create/Edit slideover -->
      <UiSlideOver
        v-model="formOpen"
        :title="editingAccount
          ? (locale === 'ar' ? 'تعديل حساب' : 'Edit Account')
          : (locale === 'ar' ? 'حساب جديد' : 'New Account')"
      >
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="acc-label">
                {{ locale === 'ar' ? 'كود الحساب' : 'Account Code' }}
                <span class="text-danger-500">*</span>
              </label>
              <input v-model="form.code" type="text" required class="acc-input font-mono" dir="ltr" />
            </div>
            <div>
              <label class="acc-label">
                {{ locale === 'ar' ? 'النوع' : 'Type' }}
                <span class="text-danger-500">*</span>
              </label>
              <div class="relative">
                <select v-model="form.type" required class="acc-input">
                  <option value="asset">{{ locale === 'ar' ? 'أصول' : 'Asset' }}</option>
                  <option value="liability">{{ locale === 'ar' ? 'خصوم' : 'Liability' }}</option>
                  <option value="equity">{{ locale === 'ar' ? 'حقوق ملكية' : 'Equity' }}</option>
                  <option value="revenue">{{ locale === 'ar' ? 'إيرادات' : 'Revenue' }}</option>
                  <option value="expense">{{ locale === 'ar' ? 'مصروفات' : 'Expense' }}</option>
                </select>
                <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label class="acc-label">
              {{ locale === 'ar' ? 'الاسم بالعربية' : 'Arabic Name' }}
              <span class="text-danger-500">*</span>
            </label>
            <input v-model="form.name_ar" type="text" required class="acc-input" dir="rtl" />
          </div>
          <div>
            <label class="acc-label">{{ locale === 'ar' ? 'الاسم بالإنجليزية' : 'English Name' }}</label>
            <input v-model="form.name_en" type="text" class="acc-input" dir="ltr" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="acc-label">{{ locale === 'ar' ? 'الحساب الأب' : 'Parent Account' }}</label>
              <div class="relative">
                <select v-model.number="form.parent_id" class="acc-input">
                  <option :value="null">{{ locale === 'ar' ? 'بدون (رئيسي)' : 'None (Root)' }}</option>
                  <option v-for="acc in flatAccounts" :key="acc.id" :value="acc.id">
                    {{ acc.code }} — {{ locale === 'ar' ? acc.name_ar : acc.name_en }}
                  </option>
                </select>
                <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label class="acc-label">{{ locale === 'ar' ? 'الرصيد الطبيعي' : 'Normal Balance' }}</label>
              <div class="relative">
                <select v-model="form.normal_balance" class="acc-input">
                  <option value="debit">{{ locale === 'ar' ? 'مدين' : 'Debit' }}</option>
                  <option value="credit">{{ locale === 'ar' ? 'دائن' : 'Credit' }}</option>
                </select>
                <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <label class="flex items-start gap-2 py-1 cursor-pointer select-none">
            <input
              v-model="form.is_group"
              type="checkbox"
              class="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-primary-500 focus:ring-primary-500"
            />
            <div>
              <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0">
                {{ locale === 'ar' ? 'حساب تجميعي' : 'Group Account' }}
              </span>
              <p class="text-[11px] text-neutral-500 dark:text-neutral-400">
                {{ locale === 'ar'
                  ? 'الحسابات التجميعية لا تستقبل قيوداً مباشرة — تُستخدم لتجميع حسابات فرعية فقط.'
                  : "Group accounts can't be posted to directly — they roll up child balances only." }}
              </p>
            </div>
          </label>

          <div class="flex items-center gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="button" variant="outline" class="flex-1" @click="formOpen = false">
              {{ $t('common.cancel') }}
            </UiAppButton>
            <UiAppButton
              type="submit"
              variant="primary"
              :icon="editingAccount ? 'i-lucide-save' : 'i-lucide-plus'"
              :loading="createMutation.loading.value || updateMutation.loading.value"
              class="flex-1"
            >
              {{ editingAccount ? $t('common.save') : $t('common.create') }}
            </UiAppButton>
          </div>
        </form>
      </UiSlideOver>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import type { Account } from '~/shared/types/accounting'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()

const { data: treeData, loading, refresh: refreshTree } = useAccountsTree()
const { create: createMutation, update: updateMutation } = useAccountMutations()

const tree = computed(() => treeData.value ?? [])

const search = ref('')
const selectedAccount = ref<Account | null>(null)
const formOpen = ref(false)
const editingAccount = ref<Account | null>(null)

const form = reactive({
  code: '',
  name_ar: '',
  name_en: '',
  type: 'asset',
  normal_balance: 'debit',
  parent_id: null as number | null,
  is_group: false,
})

const filteredTree = computed(() => {
  if (!search.value) return tree.value ?? []
  const term = search.value.toLowerCase()
  return filterTree(tree.value ?? [], term)
})

function filterTree(nodes: Account[], term: string): Account[] {
  return nodes.reduce<Account[]>((acc, node) => {
    const matches = node.code.toLowerCase().includes(term)
      || node.name_ar.toLowerCase().includes(term)
      || node.name_en.toLowerCase().includes(term)
    const filteredChildren = node.children ? filterTree(node.children, term) : []
    if (matches || filteredChildren.length > 0) {
      acc.push({ ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children })
    }
    return acc
  }, [])
}

const flatAccounts = computed(() => {
  const flat: Account[] = []
  function walk(nodes: Account[]) {
    for (const n of nodes) {
      if (n.is_group) flat.push(n)
      if (n.children) walk(n.children)
    }
  }
  walk(tree.value ?? [])
  return flat
})

function typeColor(type: string) {
  return ({ asset: 'blue', liability: 'orange', equity: 'purple', revenue: 'green', expense: 'red' } as Record<string, string>)[type] || 'gray'
}

const TYPE_AR: Record<string, string> = {
  asset: 'أصول', liability: 'خصوم', equity: 'حقوق ملكية', revenue: 'إيرادات', expense: 'مصروفات',
}
const TYPE_EN: Record<string, string> = {
  asset: 'Asset', liability: 'Liability', equity: 'Equity', revenue: 'Revenue', expense: 'Expense',
}
function typeLabel(t: string) {
  const map = locale.value === 'ar' ? TYPE_AR : TYPE_EN
  return map[t] ?? t
}

function balanceLabel(b: string) {
  if (locale.value === 'ar') return b === 'debit' ? 'مدين' : 'دائن'
  return b === 'debit' ? 'Debit' : 'Credit'
}

function openCreate() {
  editingAccount.value = null
  Object.assign(form, { code: '', name_ar: '', name_en: '', type: 'asset', normal_balance: 'debit', parent_id: null, is_group: false })
  formOpen.value = true
}

function openEdit(acc: Account) {
  editingAccount.value = acc
  Object.assign(form, {
    code: acc.code, name_ar: acc.name_ar, name_en: acc.name_en,
    type: acc.type, normal_balance: acc.normal_balance,
    parent_id: acc.parent_id, is_group: acc.is_group,
  })
  formOpen.value = true
}

async function handleSubmit() {
  try {
    if (editingAccount.value) {
      await updateMutation.mutate({ id: editingAccount.value.id, form: { ...form } })
      toastStore.success(locale.value === 'ar' ? 'تم تحديث الحساب' : 'Account updated')
    } else {
      await createMutation.mutate({ ...form })
      toastStore.success(locale.value === 'ar' ? 'تم إنشاء الحساب' : 'Account created')
    }
    formOpen.value = false
    refreshTree()
  } catch (e) {
    const err = e as ApiError
    toastStore.error(err.message || 'Error')
  }
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.acc-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.acc-input {
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
.acc-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}

:global(html.dark) .acc-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
