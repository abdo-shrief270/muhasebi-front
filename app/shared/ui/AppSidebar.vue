<template>
  <aside
    class="border-e border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-950 flex flex-col transition-[width] duration-200"
    :class="width"
    :aria-label="$t('nav.groups.dashboard')"
  >
    <div class="h-14 flex items-center gap-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
      <img v-if="tenantLogo" :src="tenantLogo" alt="" class="w-7 h-7 rounded-md object-cover flex-shrink-0" />
      <div
        v-else
        class="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        :style="{ backgroundColor: primaryColor }"
      >
        {{ tenantName ? tenantName.charAt(0).toUpperCase() : 'M' }}
      </div>
      <div v-if="!collapsed" class="min-w-0 flex-1">
        <p class="text-xs font-semibold text-neutral-900 dark:text-neutral-0 truncate">
          {{ tenantName || $t('app.name') }}
        </p>
        <p class="text-[10px] text-neutral-400 truncate">
          {{ locale === 'ar' ? 'نظام محاسبة' : 'Accounting' }}
        </p>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-2 py-3 space-y-4">
      <section v-for="group in groups" :key="group.id">
        <p
          v-if="!collapsed"
          class="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-1"
        >
          {{ $t(`nav.groups.${group.id}`, group.id) }}
        </p>
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

    <div class="border-t border-neutral-200 dark:border-neutral-800 p-2">
      <button
        type="button"
        class="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
        @click="uiStore.toggleSidebar()"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :title="collapsed ? 'Expand' : 'Collapse'"
      >
        <UIcon
          :name="isRtl ? (collapsed ? 'i-lucide-chevron-left' : 'i-lucide-chevron-right') : (collapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left')"
          class="w-4 h-4"
        />
        <span v-if="!collapsed" class="truncate">{{ locale === 'ar' ? 'طيّ' : 'Collapse' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

const { groups } = useNavigation()
const { locale } = useI18n()
const { tenantName, tenantLogo, primaryColor } = useTenantTheme()
const { isRtl } = useDir()
const uiStore = useUiStore()
const collapsed = computed(() => uiStore.sidebarCollapsed)

const width = computed(() => collapsed.value ? 'w-[64px]' : 'w-[240px]')
</script>
