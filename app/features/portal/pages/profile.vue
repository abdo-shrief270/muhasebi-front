<template>
  <div>
    <NuxtLayout name="portal">
      <UiPageHeader :title="locale === 'ar' ? 'الملف الشخصي' : 'My Profile'" />

      <div v-if="loading"><UiLoadingSkeleton :lines="4" :height="24" /></div>

      <div v-else-if="profile" class="max-w-2xl space-y-6">
        <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="bg-white rounded-2xl border border-gray-100/80 p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <span class="text-primary-500 font-bold text-2xl">{{ profile.name?.charAt(0) }}</span>
            </div>
            <div>
              <p class="text-xl font-bold text-gray-800">{{ profile.name }}</p>
              <p class="text-sm text-gray-400">{{ profile.trade_name || '' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div v-if="profile.email">
              <span class="text-gray-400">{{ locale === 'ar' ? 'البريد' : 'Email' }}:</span>
              <span class="text-gray-700 ms-2" dir="ltr">{{ profile.email }}</span>
            </div>
            <div v-if="profile.phone">
              <span class="text-gray-400">{{ locale === 'ar' ? 'الهاتف' : 'Phone' }}:</span>
              <span class="text-gray-700 ms-2" dir="ltr">{{ profile.phone }}</span>
            </div>
            <div v-if="profile.tax_id">
              <span class="text-gray-400">{{ locale === 'ar' ? 'الرقم الضريبي' : 'Tax ID' }}:</span>
              <span class="text-gray-700 ms-2 font-mono" dir="ltr">{{ profile.tax_id }}</span>
            </div>
            <div v-if="profile.city">
              <span class="text-gray-400">{{ locale === 'ar' ? 'المدينة' : 'City' }}:</span>
              <span class="text-gray-700 ms-2">{{ profile.city }}</span>
            </div>
            <div v-if="profile.address" class="md:col-span-2">
              <span class="text-gray-400">{{ locale === 'ar' ? 'العنوان' : 'Address' }}:</span>
              <span class="text-gray-700 ms-2">{{ profile.address }}</span>
            </div>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()

const profile = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get<{ data: any }>('/portal/profile')
    profile.value = res.data
  } catch { /* ignore */ }
  finally { loading.value = false }
})
</script>
