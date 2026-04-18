#!/usr/bin/env node
/**
 * Scaffold a new feature slice under app/features/<name>/
 *   node scripts/new-feature.mjs <name>
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

const name = process.argv[2]
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: node scripts/new-feature.mjs <kebab-case-name>')
  process.exit(1)
}

const root = resolve(process.cwd(), 'app/features', name)
if (existsSync(root)) {
  console.error(`Feature already exists: ${root}`)
  process.exit(1)
}

const pascal = name.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('')
const camel = pascal[0].toLowerCase() + pascal.slice(1)
const route = `/${name}`

for (const sub of ['pages', 'components', 'composables', 'services']) {
  mkdirSync(join(root, sub), { recursive: true })
}

writeFileSync(join(root, 'feature.ts'), `import type { FeatureManifest } from '~/core/subscription/types'

export default {
  id: '${name}',
  routePrefix: '${route}',
  // permission: PERMISSIONS.MANAGE_${name.toUpperCase().replace(/-/g, '_')},
  // plans: ['pro', 'business', 'enterprise'],
  // flag: '${name.replace(/-/g, '_')}_enabled',
  navLabel: 'nav.${camel}',
  navGroup: 'main',
  order: 999,
} satisfies FeatureManifest
`)

writeFileSync(join(root, 'services', `${camel}Service.ts`), `import type { PaginatedResponse } from '~/shared/types/common'

export interface ${pascal}ListParams {
  page?: number
  search?: string
  [key: string]: string | number | boolean | undefined
}

function toQuery(params: ${pascal}ListParams): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  const s = q.toString()
  return s ? \`?\${s}\` : ''
}

export interface ${pascal} {
  id: number
  // TODO: shape
}

export function ${camel}Service() {
  const api = useApi()

  return {
    list(params: ${pascal}ListParams = {}) {
      return api.get<PaginatedResponse<${pascal}>>(\`${route}\${toQuery(params)}\`)
    },
    get(id: number) {
      return api.get<{ data: ${pascal} }>(\`${route}/\${id}\`).then(r => r.data)
    },
    create(form: Partial<${pascal}>, idempotencyKey?: string) {
      return api.post<{ data: ${pascal} }>('${route}', form, { idempotencyKey }).then(r => r.data)
    },
    update(id: number, form: Partial<${pascal}>) {
      return api.put<{ data: ${pascal} }>(\`${route}/\${id}\`, form).then(r => r.data)
    },
    remove(id: number) {
      return api.delete<void>(\`${route}/\${id}\`)
    },
  }
}
`)

writeFileSync(join(root, 'composables', `use${pascal}.ts`), `import { ${camel}Service, type ${pascal}, type ${pascal}ListParams } from '~/features/${name}/services/${camel}Service'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'
import { generateRequestId } from '~/core/api/requestId'

export type { ${pascal} }

export function use${pascal}List(params: Ref<${pascal}ListParams> | ComputedRef<${pascal}ListParams>) {
  const svc = ${camel}Service()
  return useQuery(() => svc.list(unref(params)), {
    key: () => \`${name}:list:\${JSON.stringify(unref(params))}\`,
    staleMs: 20_000,
  })
}

export function use${pascal}(id: Ref<number | null> | ComputedRef<number | null>) {
  const svc = ${camel}Service()
  return useQuery(
    () => {
      const v = unref(id)
      if (v == null) return Promise.reject(new Error('missing id'))
      return svc.get(v)
    },
    {
      key: () => \`${name}:one:\${unref(id) ?? ''}\`,
      enabled: computed(() => unref(id) != null),
    },
  )
}

export function use${pascal}Mutations() {
  const svc = ${camel}Service()
  const bust = () => invalidateQuery(/^${name}:/)

  return {
    create: useMutation(async (form: Partial<${pascal}>) => {
      const r = await svc.create(form, generateRequestId())
      bust()
      return r
    }),
    update: useMutation(async ({ id, form }: { id: number; form: Partial<${pascal}> }) => {
      const r = await svc.update(id, form)
      bust()
      return r
    }),
    remove: useMutation(async (id: number) => {
      await svc.remove(id)
      bust()
    }),
  }
}
`)

writeFileSync(join(root, 'pages', 'index.vue'), `<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="${name}">
        <UiPageHeader :title="$t('nav.${camel}')" />

        <UiDataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          :current-page="currentPage"
          :total-pages="lastPage"
          :empty-title="'Nothing here yet'"
          @page-change="(p: number) => { page = p }"
        >
          <template #header>
            <UiSearchInput v-model="searchInput" class="flex-1 min-w-[200px]" />
          </template>
        </UiDataTable>
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { ${pascal}ListParams } from '~/features/${name}/services/${camel}Service'

definePageMeta({ layout: false })

const searchInput = ref('')
const search = refDebounced(searchInput, 400)
const page = ref(1)
watch(search, () => { page.value = 1 })

const params = computed<${pascal}ListParams>(() => ({
  search: search.value || undefined,
  page: page.value,
}))

const { data, loading } = use${pascal}List(params)

const rows = computed(() => data.value?.data ?? [])
const currentPage = computed(() => data.value?.meta.current_page ?? 1)
const lastPage = computed(() => data.value?.meta.last_page ?? 1)

const columns = computed(() => [
  { key: 'id', label: 'ID' },
  // TODO: columns
])
</script>
`)

console.log(`✓ Scaffolded app/features/${name}/`)
console.log(`  Next:`)
console.log(`    1. Edit feature.ts — set permission / plans / flag as needed`)
console.log(`    2. Add i18n keys: nav.${camel}`)
console.log(`    3. Fill out the ${pascal} type + columns`)
