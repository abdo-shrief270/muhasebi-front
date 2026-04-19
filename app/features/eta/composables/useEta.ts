import {
  etaService,
  type EtaDocument, type EtaDocumentListParams, type EtaItemCode, type EtaItemCodeForm, type EtaSettings, type EtaSettingsForm, type EtaCodeType,
} from '~/features/eta/services/etaService'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'
import { generateIdempotencyKey } from '~/core/api/requestId'
import type { BaseListParams } from '~/shared/types/common'


export function useEtaSettings() {
  const svc = etaService()
  return useQuery(() => svc.settings.get(), {
    key: 'eta:settings',
    staleMs: 60_000,
  })
}

export function useEtaDocumentsList(params: Ref<EtaDocumentListParams> | ComputedRef<EtaDocumentListParams>) {
  const svc = etaService()
  return useQuery(() => svc.documents.list(unref(params)), {
    key: () => `eta:docs:${JSON.stringify(unref(params))}`,
    staleMs: 15_000,
  })
}

export function useEtaItemCodesList(params: Ref<BaseListParams & { code_type?: EtaCodeType }> | ComputedRef<BaseListParams & { code_type?: EtaCodeType }>) {
  const svc = etaService()
  return useQuery(() => svc.itemCodes.list(unref(params)), {
    key: () => `eta:codes:${JSON.stringify(unref(params))}`,
    staleMs: 60_000,
  })
}

export function useEtaComplianceDashboard() {
  const svc = etaService()
  return useQuery(() => svc.complianceDashboard(), {
    key: 'eta:compliance',
    staleMs: 30_000,
  })
}

export function useEtaMutations() {
  const svc = etaService()
  const bust = () => invalidateQuery(/^eta:/)

  return {
    updateSettings: useMutation(async (form: EtaSettingsForm) => {
      const r = await svc.settings.update(form)
      bust()
      return r
    }),
    prepare: useMutation(async (invoiceId: number) => {
      const r = await svc.documents.prepare(invoiceId, generateIdempotencyKey())
      bust()
      return r
    }),
    submit: useMutation(async (invoiceId: number) => {
      const r = await svc.documents.submit(invoiceId, generateIdempotencyKey())
      bust()
      return r
    }),
    checkStatus: useMutation(async (invoiceId: number) => {
      const r = await svc.documents.checkStatus(invoiceId)
      bust()
      return r
    }),
    cancelDocument: useMutation(async ({ invoiceId, reason }: { invoiceId: number; reason: string }) => {
      const r = await svc.documents.cancel(invoiceId, reason, generateIdempotencyKey())
      bust()
      return r
    }),
    bulkRetry: useMutation(async (payload: { from_date?: string; to_date?: string } = {}) => {
      const r = await svc.bulkRetry(payload, generateIdempotencyKey())
      bust()
      return r
    }),
    bulkStatusCheck: useMutation(async () => {
      const r = await svc.bulkStatusCheck(generateIdempotencyKey())
      bust()
      return r
    }),

    createItemCode: useMutation(async (form: EtaItemCodeForm) => {
      const r = await svc.itemCodes.create(form, generateIdempotencyKey())
      bust()
      return r
    }),
    updateItemCode: useMutation(async ({ id, form }: { id: number; form: Partial<EtaItemCodeForm> }) => {
      const r = await svc.itemCodes.update(id, form)
      bust()
      return r
    }),
    removeItemCode: useMutation(async (id: number) => {
      await svc.itemCodes.remove(id)
      bust()
    }),
  }
}

/** Legacy shim — maps old method names to the new service. */
export function useEta() {
  const svc = etaService()

  return {
    getSettings:     () => svc.settings.get(),
    updateSettings:  (form: EtaSettingsForm) => svc.settings.update(form),
    getDocuments:    (params?: Record<string, any>) => svc.documents.list((params ?? {}) as EtaDocumentListParams),
    prepareDocument: (id: number) => svc.documents.prepare(id, generateIdempotencyKey()),
    submitDocument:  (id: number) => svc.documents.submit(id, generateIdempotencyKey()),
    checkStatus:     (id: number) => svc.documents.checkStatus(id),
    cancelDocument:  (id: number, reason: string) => svc.documents.cancel(id, reason, generateIdempotencyKey()),
    getItemCodes:    (params?: Record<string, any>) => svc.itemCodes.list((params ?? {}) as BaseListParams & { code_type?: EtaCodeType }),
    createItemCode:  (form: EtaItemCodeForm) => svc.itemCodes.create(form, generateIdempotencyKey()),
    updateItemCode:  (id: number, form: Partial<EtaItemCodeForm>) => svc.itemCodes.update(id, form),
    deleteItemCode:  (id: number) => svc.itemCodes.remove(id),
  }
}
