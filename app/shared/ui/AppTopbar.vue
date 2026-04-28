<template>
  <header
    class="h-12 flex items-center gap-2 px-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-0/95 dark:bg-neutral-950/95 backdrop-blur sticky top-0 z-sticky-header"
  >
    <!-- Mobile menu -->
    <button
      type="button"
      class="lg:hidden w-8 h-8 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      @click="$emit('toggle-sidebar')"
      :aria-label="locale === 'ar' ? 'القائمة' : 'Menu'"
    >
      <UIcon name="i-lucide-menu" class="w-5 h-5" />
    </button>

    <!-- Page context (breadcrumb / title) -->
    <div class="hidden md:flex items-center gap-1.5 min-w-0 me-2">
      <NuxtLink
        to="/dashboard"
        class="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors flex-shrink-0"
        :title="locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'"
      >
        <UIcon name="i-lucide-home" class="w-3.5 h-3.5" />
      </NuxtLink>
      <template v-if="crumbs.length > 0">
        <UIcon name="i-lucide-chevron-right" class="w-3 h-3 text-neutral-300 dark:text-neutral-700 rtl:rotate-180 flex-shrink-0" />
        <span
          v-for="(c, i) in crumbs"
          :key="i"
          class="text-xs flex-shrink-0"
          :class="i === crumbs.length - 1 ? 'font-semibold text-neutral-700 dark:text-neutral-200' : 'text-neutral-400'"
        >
          {{ c }}
          <UIcon
            v-if="i < crumbs.length - 1"
            name="i-lucide-chevron-right"
            class="w-3 h-3 mx-0.5 text-neutral-300 dark:text-neutral-700 rtl:rotate-180 inline align-middle"
          />
        </span>
      </template>
    </div>

    <!-- Search pill -->
    <div class="flex-1 max-w-md md:max-w-sm">
      <button
        type="button"
        class="w-full h-8 flex items-center gap-2 ps-3 pe-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-0 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors text-xs"
        @click="openSearch"
      >
        <UIcon name="i-lucide-search" class="w-3.5 h-3.5 flex-shrink-0" />
        <span class="flex-1 text-start truncate">{{ locale === 'ar' ? 'بحث في المنصة...' : 'Search the workspace…' }}</span>
        <kbd class="hidden sm:inline-flex items-center px-1.5 h-5 rounded-sm border border-neutral-200 dark:border-neutral-700 bg-neutral-0 dark:bg-neutral-950 text-[10px] font-mono text-neutral-400">
          {{ cmdKeyLabel }}
        </kbd>
      </button>
    </div>

    <!-- Right cluster -->
    <div class="flex items-center gap-1 ms-auto">
      <Feature id="timesheets" v-slot="{ allowed }">
        <UiTimerWidget v-if="allowed" />
      </Feature>

      <!-- Quick create -->
      <UPopover :ui="{ content: 'p-0' }">
        <button
          type="button"
          class="hidden sm:inline-flex h-8 px-2.5 items-center gap-1.5 rounded-md text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          :aria-label="locale === 'ar' ? 'إنشاء جديد' : 'Create new'"
        >
          <UIcon name="i-lucide-plus-circle" class="w-4 h-4" />
          <span>{{ locale === 'ar' ? 'جديد' : 'New' }}</span>
          <UIcon name="i-lucide-chevron-down" class="w-3 h-3 text-neutral-400" />
        </button>
        <template #content>
          <div class="w-56 py-1">
            <p class="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              {{ locale === 'ar' ? 'إنشاء سريع' : 'Quick create' }}
            </p>
            <NuxtLink
              v-for="action in quickActions"
              :key="action.to"
              :to="action.to"
              class="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <UIcon :name="action.icon" class="w-3.5 h-3.5 text-neutral-400" />
              {{ action.label() }}
            </NuxtLink>
          </div>
        </template>
      </UPopover>

      <!-- Locale -->
      <button
        type="button"
        class="w-8 h-8 inline-flex items-center justify-center rounded-md text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        @click="toggleLocale"
        :aria-label="locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'"
      >
        {{ locale === 'ar' ? 'EN' : 'عر' }}
      </button>

      <!-- Dark mode -->
      <button
        type="button"
        class="w-8 h-8 inline-flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        @click="toggleDarkMode"
        :aria-label="isDark ? 'Light mode' : 'Dark mode'"
      >
        <UIcon :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" class="w-4 h-4" />
      </button>

      <UiNotificationBell />

      <div class="w-px h-5 bg-neutral-200 dark:bg-neutral-800 mx-1.5" />

      <!-- User menu -->
      <UPopover :ui="{ content: 'p-0' }">
        <button
          type="button"
          class="h-8 inline-flex items-center gap-2 ps-1 pe-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          :aria-label="locale === 'ar' ? 'حساب المستخدم' : 'User menu'"
        >
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            :style="{ backgroundColor: secondaryColor }"
          >
            {{ initials }}
          </div>
          <div class="hidden md:flex flex-col leading-tight items-start">
            <span class="text-[11px] font-semibold text-neutral-900 dark:text-neutral-0 truncate max-w-[140px]">
              {{ authStore.user?.name }}
            </span>
            <span class="text-[10px] text-neutral-400 truncate max-w-[140px]">
              {{ authStore.user?.role }}
            </span>
          </div>
          <UIcon name="i-lucide-chevron-down" class="w-3 h-3 text-neutral-400 hidden md:block" />
        </button>

        <template #content>
          <div class="w-64">
            <!-- User info header -->
            <div class="px-3 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  :style="{ backgroundColor: secondaryColor }"
                >
                  {{ initials }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold text-neutral-900 dark:text-neutral-0 truncate">
                    {{ authStore.user?.name }}
                  </p>
                  <p class="text-[10px] text-neutral-400 truncate">
                    {{ authStore.user?.email }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Links -->
            <div class="py-1">
              <NuxtLink
                v-for="link in userMenuLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-2.5 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <UIcon :name="link.icon" class="w-3.5 h-3.5 text-neutral-400" />
                {{ link.label() }}
              </NuxtLink>
            </div>

            <div class="border-t border-neutral-200 dark:border-neutral-800 py-1">
              <button
                type="button"
                class="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-danger-600 dark:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                @click="handleLogout"
              >
                <UIcon name="i-lucide-log-out" class="w-3.5 h-3.5" />
                {{ $t('auth.logout') }}
              </button>
            </div>
          </div>
        </template>
      </UPopover>
    </div>
  </header>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'toggle-sidebar': []
  'open-search': []
}>()

const { locale, setLocale, t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
const { isDark, toggle: toggleDarkMode } = useDarkMode()
const { secondaryColor } = useTenantTheme()

const initials = computed(() => authStore.user?.name?.charAt(0).toUpperCase() ?? '?')
const cmdKeyLabel = computed(() => {
  if (!import.meta.client) return 'Ctrl+K'
  return navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl+K'
})

const crumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  if (segments.length === 0 || segments[0] === 'dashboard') return []
  return segments.slice(0, 3).map(seg => {
    const key = `nav.${seg}`
    const translated = t(key)
    return translated === key ? seg.replace(/-/g, ' ') : translated
  })
})

// Quick-create destinations. Some features have a dedicated /create page
// (invoices, journal entries); others use a slideover on the list page —
// for those we land on the list and the user hits the prominent "Add" button.
// When we redesign each feature we can wire `?new=1` so the slideover auto-
// opens. For now the menu just routes you somewhere that exists.
const quickActions = [
  { to: '/invoices/create',         icon: 'i-lucide-file-text',  label: () => locale.value === 'ar' ? 'فاتورة جديدة' : 'New invoice' },
  { to: '/clients?new=1',           icon: 'i-lucide-user-plus',  label: () => locale.value === 'ar' ? 'عميل جديد' : 'New client' },
  { to: '/expenses',                icon: 'i-lucide-receipt',    label: () => locale.value === 'ar' ? 'مصروف جديد' : 'New expense' },
  { to: '/journal-entries/create',  icon: 'i-lucide-book-open',  label: () => locale.value === 'ar' ? 'قيد محاسبي' : 'Journal entry' },
  { to: '/payments',                icon: 'i-lucide-credit-card', label: () => locale.value === 'ar' ? 'دفعة' : 'Payment' },
]

const userMenuLinks = [
  { to: '/settings/profile', icon: 'i-lucide-user', label: () => locale.value === 'ar' ? 'الملف الشخصي' : 'Profile' },
  { to: '/settings', icon: 'i-lucide-settings', label: () => locale.value === 'ar' ? 'الإعدادات' : 'Settings' },
  { to: '/subscription', icon: 'i-lucide-credit-card', label: () => locale.value === 'ar' ? 'الاشتراك' : 'Subscription' },
  { to: '/team', icon: 'i-lucide-users', label: () => locale.value === 'ar' ? 'الفريق' : 'Team' },
]

function openSearch() { emit('open-search') }
function toggleLocale() { setLocale(locale.value === 'ar' ? 'en' : 'ar') }
async function handleLogout() {
  await authStore.logout()
  navigateTo('/auth/login')
}
</script>
