<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="accounts">
      <UiPageHeader :title="$t('nav.accounts')">
        <template #actions>
          <UiAppButton variant="primary" @click="openCreate">
            {{ locale === 'ar' ? '+ إضافة حساب' : '+ Add Account' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <!-- Tree view -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 15 }"
        :enter="{ opacity: 1, y: 0 }"
        class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden"
      >
        <div class="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <UiSearchInput v-model="search" class="flex-1" />
        </div>

        <div v-if="loading" class="p-6">
          <UiLoadingSkeleton :lines="8" :height="32" />
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

        <div v-else class="p-8">
          <UiEmptyState
            icon="&#9776;"
            :title="locale === 'ar' ? 'لا يوجد حسابات' : 'No accounts'"
            :description="locale === 'ar' ? 'أنشئ دليل حسابات أو اختر قالب من الإعداد' : 'Create accounts or choose a template from setup'"
          />
        </div>
      </div>

      <!-- Account detail panel -->
      <Transition name="fade-slide">
        <div v-if="selectedAccount" class="mt-5 bg-white rounded-2xl border border-gray-100/80 p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-gray-800">
                <span class="font-mono text-primary-400 me-2">{{ selectedAccount.code }}</span>
                {{ locale === 'ar' ? selectedAccount.name_ar : selectedAccount.name_en }}
              </h3>
              <div class="flex items-center gap-2 mt-1">
                <UiBadge :color="typeColor(selectedAccount.type)">{{ selectedAccount.type }}</UiBadge>
                <UiBadge color="gray">{{ selectedAccount.normal_balance }}</UiBadge>
                <UiBadge :color="selectedAccount.is_active ? 'green' : 'gray'" dot>
                  {{ selectedAccount.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
                </UiBadge>
              </div>
            </div>
            <div class="flex gap-2">
              <UiAppButton variant="outline" size="sm" @click="navigateTo(`/reports/ledger?account_id=${selectedAccount.id}`)">
                {{ locale === 'ar' ? 'دفتر الأستاذ' : 'Ledger' }}
              </UiAppButton>
              <UiAppButton variant="ghost" size="sm" @click="selectedAccount = null">&#10005;</UiAppButton>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Create/Edit Modal -->
      <UiSlideOver v-model="formOpen" :title="editingAccount ? (locale === 'ar' ? 'تعديل حساب' : 'Edit Account') : (locale === 'ar' ? 'إضافة حساب' : 'Add Account')">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'كود الحساب' : 'Account Code' }} *</label>
              <input v-model="form.code" type="text" required class="input-field font-mono" dir="ltr" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'النوع' : 'Type' }} *</label>
              <select v-model="form.type" required class="input-field">
                <option value="asset">{{ locale === 'ar' ? 'أصول' : 'Asset' }}</option>
                <option value="liability">{{ locale === 'ar' ? 'خصوم' : 'Liability' }}</option>
                <option value="equity">{{ locale === 'ar' ? 'حقوق ملكية' : 'Equity' }}</option>
                <option value="revenue">{{ locale === 'ar' ? 'إيرادات' : 'Revenue' }}</option>
                <option value="expense">{{ locale === 'ar' ? 'مصروفات' : 'Expense' }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'الاسم بالعربية' : 'Arabic Name' }} *</label>
            <input v-model="form.name_ar" type="text" required class="input-field" />
          </div>
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'الاسم بالإنجليزية' : 'English Name' }}</label>
            <input v-model="form.name_en" type="text" class="input-field" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'الحساب الأب' : 'Parent Account' }}</label>
              <select v-model="form.parent_id" class="input-field">
                <option :value="null">{{ locale === 'ar' ? 'بدون (رئيسي)' : 'None (Root)' }}</option>
                <option v-for="acc in flatAccounts" :key="acc.id" :value="acc.id">
                  {{ acc.code }} - {{ locale === 'ar' ? acc.name_ar : acc.name_en }}
                </option>
              </select>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'الرصيد الطبيعي' : 'Normal Balance' }}</label>
              <select v-model="form.normal_balance" class="input-field">
                <option value="debit">{{ locale === 'ar' ? 'مدين' : 'Debit' }}</option>
                <option value="credit">{{ locale === 'ar' ? 'دائن' : 'Credit' }}</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.is_group" type="checkbox" class="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
              <span class="text-sm text-gray-600">{{ locale === 'ar' ? 'حساب تجميعي' : 'Group Account' }}</span>
            </label>
          </div>

          <div class="flex gap-3 pt-4 border-t border-gray-100">
            <UiAppButton type="submit" variant="primary" :loading="createMutation.loading.value || updateMutation.loading.value">
              {{ editingAccount ? $t('common.save') : $t('common.create') }}
            </UiAppButton>
            <UiAppButton variant="outline" @click="formOpen = false">{{ $t('common.cancel') }}</UiAppButton>
          </div>
        </form>
      </UiSlideOver>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { Account } from '~/shared/types/accounting'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: false })

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
.input-field {
  @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50;
}
.form-label {
  @apply block text-sm font-medium text-gray-600 mb-1;
}
</style>
