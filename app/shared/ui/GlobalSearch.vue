<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-[2px]" @click="close"></div>

        <!-- Search box -->
        <div
          v-motion
          :initial="{ opacity: 0, y: -20, scale: 0.95 }"
          :enter="{ opacity: 1, y: 0, scale: 1 }"
          class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <!-- Input -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <svg class="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
            <input
              ref="searchInput"
              v-model="query"
              type="text"
              class="flex-1 text-base outline-none placeholder:text-gray-300"
              :placeholder="locale === 'ar' ? 'بحث في العملاء، الفواتير، الحسابات...' : 'Search clients, invoices, accounts...'"
              @input="debouncedSearch"
            />
            <kbd class="text-[10px] text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded">ESC</kbd>
          </div>

          <!-- Results -->
          <div class="max-h-80 overflow-y-auto">
            <div v-if="searching" class="p-6 text-center text-gray-400 text-sm">
              {{ locale === 'ar' ? 'جارٍ البحث...' : 'Searching...' }}
            </div>

            <div v-else-if="query && results.length > 0" class="py-2">
              <div
                v-for="(item, i) in results"
                :key="i"
                @click="navigate(item)"
                class="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  :class="typeColor(item.type)">
                  {{ typeIcon(item.type) }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ item.title }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ item.subtitle }}</p>
                </div>
                <span class="text-[10px] text-gray-300 bg-gray-50 px-2 py-0.5 rounded">{{ item.type }}</span>
              </div>
            </div>

            <div v-else-if="query && !searching" class="p-6 text-center text-gray-300 text-sm">
              {{ locale === 'ar' ? 'لا توجد نتائج' : 'No results found' }}
            </div>

            <div v-else class="p-6 text-center text-gray-300 text-sm">
              {{ locale === 'ar' ? 'اكتب للبحث...' : 'Type to search...' }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const api = useApi()

const isOpen = ref(false)
const query = ref('')
const results = ref<any[]>([])
const searching = ref(false)
const searchInput = ref<HTMLInputElement>()

function open() {
  isOpen.value = true
  query.value = ''
  results.value = []
  nextTick(() => searchInput.value?.focus())
}

function close() {
  isOpen.value = false
}

async function search() {
  if (!query.value || query.value.length < 2) { results.value = []; return }
  searching.value = true
  try {
    const [clients, invoices, accounts] = await Promise.all([
      api.get<{ data: any[] }>(`/clients?search=${query.value}&per_page=5`).catch(() => ({ data: [] })),
      api.get<{ data: any[] }>(`/invoices?search=${query.value}&per_page=5`).catch(() => ({ data: [] })),
      api.get<{ data: any[] }>(`/accounts?search=${query.value}&per_page=5`).catch(() => ({ data: [] })),
    ])
    results.value = [
      ...clients.data.map((c: any) => ({ type: 'client', title: c.name, subtitle: c.email || c.tax_id || '', to: `/clients/${c.id}` })),
      ...invoices.data.map((i: any) => ({ type: 'invoice', title: i.invoice_number, subtitle: `${i.client?.name || ''} — ${Number(i.total).toLocaleString()}`, to: `/invoices/${i.id}` })),
      ...accounts.data.map((a: any) => ({ type: 'account', title: `${a.code} — ${locale.value === 'ar' ? a.name_ar : a.name_en}`, subtitle: a.type, to: '/accounts' })),
    ]
  } catch { results.value = [] }
  finally { searching.value = false }
}

const debouncedSearch = useDebounceFn(search, 300)

function navigate(item: any) {
  close()
  navigateTo(item.to)
}

function typeIcon(type: string) {
  return ({ client: '👥', invoice: '📄', account: '📊' } as Record<string, string>)[type] || '●'
}

function typeColor(type: string) {
  return ({ client: 'bg-blue-50', invoice: 'bg-emerald-50', account: 'bg-purple-50' } as Record<string, string>)[type] || 'bg-gray-50'
}

// Keyboard shortcut — Ctrl+K
if (import.meta.client) {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      isOpen.value ? close() : open()
    }
    if (e.key === 'Escape' && isOpen.value) {
      close()
    }
  })
}

defineExpose({ open })
</script>
