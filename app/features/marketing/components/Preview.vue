<template>
  <section id="preview" class="py-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white"></div>

    <div class="relative max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="text-center mb-16"
      >
        <div class="inline-flex items-center gap-2 bg-secondary-50 text-secondary-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
          {{ t('landing.preview.badge') }}
        </div>
        <h2 class="text-3xl lg:text-5xl font-extrabold text-gray-900 mb-4">
          {{ t('landing.preview.title') }}
        </h2>
        <p class="text-lg text-gray-400 max-w-2xl mx-auto">
          {{ t('landing.preview.subtitle') }}
        </p>
      </div>

      <!-- Steps / How it works -->
      <div class="grid md:grid-cols-3 gap-8 mb-20">
        <div
          v-for="(step, i) in steps"
          :key="i"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible-once="{ opacity: 1, y: 0, transition: { delay: i * 150, duration: 500 } }"
          class="relative text-center group"
        >
          <!-- Connector line -->
          <div v-if="i < steps.length - 1" class="hidden md:block absolute top-8 start-[60%] end-[-40%] h-0.5 bg-gradient-to-r from-primary-200 to-transparent"></div>

          <div class="relative z-10 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-3xl flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg shadow-primary-500/20 group-hover:shadow-xl group-hover:shadow-primary-500/30 transition-all group-hover:scale-105">
            {{ i + 1 }}
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">{{ step.title }}</h3>
          <p class="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">{{ step.desc }}</p>
        </div>
      </div>

      <!-- Dashboard Preview -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 40, scale: 0.97 }"
        :visible-once="{ opacity: 1, y: 0, scale: 1, transition: { duration: 800 } }"
        class="relative"
      >
        <!-- Glow effect -->
        <div class="absolute -inset-4 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 rounded-[2rem] blur-2xl"></div>

        <div class="relative bg-white rounded-3xl shadow-2xl shadow-gray-300/30 border border-gray-200/60 overflow-hidden">
          <!-- Browser bar -->
          <div class="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div class="flex gap-2">
              <div class="w-3 h-3 rounded-full bg-red-400"></div>
              <div class="w-3 h-3 rounded-full bg-amber-400"></div>
              <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div class="flex-1 flex justify-center">
              <div class="inline-flex items-center gap-2 bg-white rounded-lg px-6 py-1.5 text-sm text-gray-400 border border-gray-100 min-w-[300px] justify-center">
                <svg class="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" /></svg>
                app.muhasebi.com/dashboard
              </div>
            </div>
          </div>

          <!-- Dashboard Content -->
          <div class="flex min-h-[500px]">
            <!-- Sidebar -->
            <div class="w-56 bg-primary-500 p-5 hidden md:block flex-shrink-0">
              <div class="flex items-center gap-2 mb-8">
                <div class="w-8 h-8 bg-white/20 rounded-lg"></div>
                <span class="text-sm font-bold text-white">{{ t('app.name') }}</span>
              </div>
              <div class="space-y-1.5">
                <div v-for="(item, i) in sidebarItems" :key="i"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                  :class="i === 0 ? 'bg-white/15 text-white font-medium' : 'text-white/50 hover:text-white/70'"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="item.icon"></svg>
                  {{ item.label }}
                </div>
              </div>
            </div>

            <!-- Main Content -->
            <div class="flex-1 p-6 bg-gray-50/50">
              <!-- Top bar -->
              <div class="flex items-center justify-between mb-6">
                <div>
                  <div class="h-4 w-32 bg-gray-200 rounded-full mb-2"></div>
                  <div class="h-3 w-48 bg-gray-100 rounded-full"></div>
                </div>
                <div class="flex gap-2">
                  <div class="h-9 w-9 bg-white rounded-lg border border-gray-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                  </div>
                  <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-xs font-bold text-primary-600">A</span>
                  </div>
                </div>
              </div>

              <!-- KPI Cards -->
              <div class="grid grid-cols-4 gap-3 mb-6">
                <div v-for="(kpi, i) in kpis" :key="i"
                  class="bg-white rounded-xl p-4 border border-gray-100"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400">{{ kpi.label }}</span>
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center" :class="kpi.bgColor">
                      <svg class="w-3.5 h-3.5" :class="kpi.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="kpi.icon"></svg>
                    </div>
                  </div>
                  <div class="text-xl font-bold text-gray-800">{{ kpi.value }}</div>
                  <div class="text-xs mt-1 font-medium" :class="kpi.changeColor">{{ kpi.change }}</div>
                </div>
              </div>

              <!-- Chart + Recent -->
              <div class="grid grid-cols-3 gap-4">
                <div class="col-span-2 bg-white rounded-xl p-5 border border-gray-100">
                  <div class="flex items-center justify-between mb-4">
                    <div class="h-3 w-24 bg-gray-200 rounded-full"></div>
                    <div class="flex gap-1">
                      <div class="h-6 w-14 bg-primary-50 rounded-md"></div>
                      <div class="h-6 w-14 bg-gray-50 rounded-md"></div>
                    </div>
                  </div>
                  <div class="h-40 flex items-end gap-1.5">
                    <div v-for="(h, i) in chartBars" :key="i"
                      class="flex-1 rounded-t-md transition-all"
                      :class="i === chartBars.length - 2 ? 'bg-gradient-to-t from-secondary-500 to-secondary-400' : 'bg-gradient-to-t from-primary-500/80 to-primary-400/60'"
                      :style="{ height: h + '%' }"
                    ></div>
                  </div>
                </div>
                <div class="bg-white rounded-xl p-5 border border-gray-100">
                  <div class="h-3 w-20 bg-gray-200 rounded-full mb-4"></div>
                  <div class="space-y-3">
                    <div v-for="i in 5" :key="i" class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-gray-50 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="h-2.5 w-full bg-gray-100 rounded-full mb-1.5"></div>
                        <div class="h-2 w-2/3 bg-gray-50 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

const steps = computed(() => {
  const isAr = locale.value === 'ar'
  return [
    { title: isAr ? 'أنشئ حسابك' : 'Create Your Account', desc: isAr ? 'سجل بياناتك وبيانات مكتبك في أقل من دقيقة واحدة وابدأ فوراً.' : 'Register your details and office info in under a minute and start immediately.' },
    { title: isAr ? 'أضف عملاءك وبياناتك' : 'Add Your Clients & Data', desc: isAr ? 'استورد بيانات عملائك أو أضفهم يدوياً وابدأ في إنشاء الفواتير والقيود.' : 'Import your client data or add them manually and start creating invoices and entries.' },
    { title: isAr ? 'تابع وحلل وأنمِ' : 'Track, Analyze & Grow', desc: isAr ? 'احصل على تقارير مالية فورية وتحليلات ذكية لنمو مكتبك.' : 'Get instant financial reports and smart analytics to grow your firm.' },
  ]
})

const isAr = computed(() => locale.value === 'ar')

const sidebarItems = computed(() => [
  { label: isAr.value ? 'لوحة التحكم' : 'Dashboard', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />' },
  { label: isAr.value ? 'العملاء' : 'Clients', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />' },
  { label: isAr.value ? 'الفواتير' : 'Invoices', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />' },
  { label: isAr.value ? 'الحسابات' : 'Accounts', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75" />' },
  { label: isAr.value ? 'التقارير' : 'Reports', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />' },
  { label: isAr.value ? 'الإعدادات' : 'Settings', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />' },
])

const kpis = computed(() => {
  const ar = isAr.value
  return [
    { label: ar ? 'إجمالي العملاء' : 'Total Clients', value: '٢٤٧', change: '+8.2%', changeColor: 'text-emerald-500', bgColor: 'bg-primary-50', iconColor: 'text-primary-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493" />' },
    { label: ar ? 'الفواتير' : 'Invoices', value: '١,٢٤٨', change: '+12.5%', changeColor: 'text-emerald-500', bgColor: 'bg-secondary-50', iconColor: 'text-secondary-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5" />' },
    { label: ar ? 'الإيرادات' : 'Revenue', value: '٣٤٥K', change: '+18.3%', changeColor: 'text-emerald-500', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" />' },
    { label: ar ? 'معلّقة' : 'Pending', value: '٣٢', change: '-5.1%', changeColor: 'text-rose-500', bgColor: 'bg-amber-50', iconColor: 'text-amber-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />' },
  ]
})

const chartBars = [35, 55, 40, 70, 50, 65, 85, 45, 75, 60, 90, 50]
</script>
