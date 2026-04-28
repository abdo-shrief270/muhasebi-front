<template>
  <aside
    class="h-full flex flex-col border-e border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-950 transition-[width] duration-200"
    :class="width"
    :aria-label="$t('nav.groups.dashboard')"
  >
    <!-- Brand / tenant header -->
    <div class="h-14 flex items-center gap-2.5 px-3 border-b border-neutral-200 dark:border-neutral-800">
      <div
        class="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-black/5"
        :style="{ backgroundColor: primaryColor }"
      >
        <img v-if="tenantLogo" :src="tenantLogo" alt="" class="w-5 h-5 object-contain" />
        <span v-else class="text-xs font-bold text-white">{{ brandInitial }}</span>
      </div>
      <div v-if="!collapsed" class="min-w-0 flex-1">
        <p class="text-[13px] font-semibold text-neutral-900 dark:text-neutral-0 truncate leading-tight">
          {{ tenantName || $t('app.name') }}
        </p>
        <p class="text-[10px] text-neutral-400 truncate mt-0.5">
          {{ planLabel }}
        </p>
      </div>
      <button
        v-if="!collapsed"
        type="button"
        class="ms-auto w-6 h-6 inline-flex items-center justify-center rounded-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        @click="uiStore.toggleSidebar()"
        :title="locale === 'ar' ? 'طيّ الشريط الجانبي' : 'Collapse sidebar'"
        :aria-label="locale === 'ar' ? 'طيّ' : 'Collapse'"
      >
        <UIcon
          :name="isRtl ? 'i-lucide-chevrons-right' : 'i-lucide-chevrons-left'"
          class="w-3.5 h-3.5"
        />
      </button>
    </div>

    <!-- Quick action -->
    <div v-if="!collapsed" class="px-3 pt-3">
      <button
        type="button"
        class="w-full h-8 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors"
        @click="$emit('quick-create')"
      >
        <UIcon name="i-lucide-plus" class="w-3.5 h-3.5" />
        {{ locale === 'ar' ? 'إنشاء جديد' : 'Quick create' }}
        <kbd class="ms-auto text-[10px] font-mono bg-white/15 px-1 rounded-sm">{{ cmdKeyLabel }}N</kbd>
      </button>
    </div>
    <div v-else class="px-2 pt-3">
      <button
        type="button"
        class="w-10 h-8 mx-auto inline-flex items-center justify-center rounded-md bg-primary-600 hover:bg-primary-700 text-white transition-colors"
        @click="$emit('quick-create')"
        :title="locale === 'ar' ? 'إنشاء جديد' : 'Quick create'"
      >
        <UIcon name="i-lucide-plus" class="w-4 h-4" />
      </button>
    </div>

    <!-- Nav groups -->
    <nav class="flex-1 overflow-y-auto px-2 py-3 space-y-3">
      <section v-for="group in groups" :key="group.id">
        <div v-if="!collapsed" class="px-2 mb-1 flex items-center justify-between">
          <p class="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.08em]">
            {{ $t(`nav.groups.${group.id}`, group.id) }}
          </p>
        </div>
        <div v-else class="mx-2 my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
        <div class="space-y-0.5">
          <UiAppSidebarLink
            v-for="item in group.items"
            :key="item.id"
            :to="item.to"
            :icon="item.icon"
            :label="$t(item.label, item.id)"
            :is-collapsed="collapsed"
          />
        </div>
      </section>
    </nav>

    <!-- User block + collapse toggle (when collapsed) -->
    <div class="border-t border-neutral-200 dark:border-neutral-800">
      <div v-if="!collapsed" class="p-2">
        <NuxtLink
          to="/settings/profile"
          class="flex items-center gap-2.5 p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors group"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            :style="{ backgroundColor: secondaryColor }"
          >
            {{ userInitial }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-neutral-900 dark:text-neutral-0 truncate leading-tight">
              {{ authStore.user?.name || '—' }}
            </p>
            <p class="text-[10px] text-neutral-400 truncate mt-0.5">
              {{ authStore.user?.email }}
            </p>
          </div>
          <UIcon
            name="i-lucide-settings-2"
            class="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors"
          />
        </NuxtLink>
      </div>
      <button
        v-else
        type="button"
        class="w-full h-10 inline-flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        @click="uiStore.toggleSidebar()"
        :title="locale === 'ar' ? 'فتح الشريط الجانبي' : 'Expand sidebar'"
        :aria-label="locale === 'ar' ? 'فتح' : 'Expand'"
      >
        <UIcon
          :name="isRtl ? 'i-lucide-chevrons-left' : 'i-lucide-chevrons-right'"
          class="w-4 h-4"
        />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

defineEmits<{ 'quick-create': [] }>()

const { groups } = useNavigation()
const { locale } = useI18n()
const { tenantName, tenantLogo, primaryColor, secondaryColor } = useTenantTheme()
const { isRtl } = useDir()
const authStore = useAuthStore()
const uiStore = useUiStore()
const collapsed = computed(() => uiStore.sidebarCollapsed)

const width = computed(() => collapsed.value ? 'w-[64px]' : 'w-[248px]')

const brandInitial = computed(() => {
  const n = tenantName.value
  if (n) return n.charAt(0).toUpperCase()
  return locale.value === 'ar' ? 'م' : 'M'
})

const userInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() ?? '?')

const planLabel = computed(() => {
  const role = authStore.user?.role
  if (role) return role
  return locale.value === 'ar' ? 'منصة محاسبية' : 'Workspace'
})

const cmdKeyLabel = computed(() => {
  if (!import.meta.client) return 'Ctrl+'
  return navigator.platform.toLowerCase().includes('mac') ? '⌘' : '^'
})
</script>
