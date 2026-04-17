<template>
  <footer class="bg-gray-50 border-t border-gray-100">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Main Footer -->
      <div class="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-4 lg:col-span-2">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              {{ t('app.name') }}
            </span>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed max-w-sm mb-6">
            {{ t('landing.footer.desc') }}
          </p>
          <!-- Social -->
          <div class="flex items-center gap-3">
            <a v-for="(social, i) in socials" :key="i" :href="social.href" target="_blank" rel="noopener"
              class="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-200 transition-all"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" v-html="social.icon"></svg>
            </a>
          </div>
        </div>

        <!-- Product -->
        <div>
          <h4 class="font-bold text-gray-800 text-sm mb-4">{{ t('landing.footer.product') }}</h4>
          <ul class="space-y-2.5">
            <li v-for="link in productLinks" :key="link.label">
              <a :href="link.href" class="text-sm text-gray-400 hover:text-primary-500 transition-colors">{{ link.label }}</a>
            </li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="font-bold text-gray-800 text-sm mb-4">{{ t('landing.footer.company') }}</h4>
          <ul class="space-y-2.5">
            <li v-for="link in companyLinks" :key="link.label">
              <a :href="link.href" class="text-sm text-gray-400 hover:text-primary-500 transition-colors">{{ link.label }}</a>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h4 class="font-bold text-gray-800 text-sm mb-4">{{ t('landing.footer.support') }}</h4>
          <ul class="space-y-2.5">
            <li v-for="link in supportLinks" :key="link.label">
              <a :href="link.href" class="text-sm text-gray-400 hover:text-primary-500 transition-colors">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-gray-200 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-xs text-gray-400">
          &copy; {{ new Date().getFullYear() }} {{ t('app.name') }}. {{ t('landing.footer.rights') }}
        </p>
        <div class="flex items-center gap-6">
          <NuxtLink to="/privacy" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">{{ t('landing.footer.privacy') }}</NuxtLink>
          <NuxtLink to="/terms" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">{{ t('landing.footer.terms') }}</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

const isAr = computed(() => locale.value === 'ar')

const socials = [
  { href: '#', icon: '<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />' },
  { href: '#', icon: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />' },
  { href: '#', icon: '<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />' },
]

const productLinks = computed(() => {
  const ar = isAr.value
  return [
    { label: ar ? 'المزايا' : 'Features', href: '#features' },
    { label: ar ? 'الأسعار' : 'Pricing', href: '#pricing' },
    { label: ar ? 'الفاتورة الإلكترونية' : 'E-Invoicing', href: '#features' },
    { label: ar ? 'التقارير المالية' : 'Financial Reports', href: '#features' },
    { label: ar ? 'بوابة العملاء' : 'Client Portal', href: '#features' },
  ]
})

const companyLinks = computed(() => {
  const ar = isAr.value
  return [
    { label: ar ? 'من نحن' : 'About Us', href: '#about' },
    { label: ar ? 'المدونة' : 'Blog', href: '/blog' },
    { label: ar ? 'سجل التغييرات' : 'Changelog', href: '/changelog' },
    { label: ar ? 'الوظائف' : 'Careers', href: '#' },
    { label: ar ? 'تواصل معنا' : 'Contact', href: '/contact' },
  ]
})

const supportLinks = computed(() => {
  const ar = isAr.value
  return [
    { label: ar ? 'مركز المساعدة' : 'Help Center', href: '#' },
    { label: ar ? 'الأسئلة الشائعة' : 'FAQ', href: '#faq' },
    { label: ar ? 'الدعم الفني' : 'Technical Support', href: '#' },
    { label: ar ? 'حالة النظام' : 'System Status', href: '#' },
  ]
})
</script>
