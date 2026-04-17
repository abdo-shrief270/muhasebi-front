import { etaService, type EtaDocument, type EtaItemCode, type EtaListParams, type EtaSettings } from '~/features/eta/services/etaService'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'
import { generateRequestId } from '~/core/api/requestId'

export type { EtaDocument, EtaItemCode, EtaSettings }

export function useEtaSettings() {
  const svc = etaService()
  return useQuery(() => svc.getSettings(), {
    key: 'eta:settings',
    staleMs: 60_000,
  })
}

export function useEtaDocumentsList(params: Ref<EtaListParams> | ComputedRef<EtaListParams>) {
  const svc = etaService()
  return useQuery(() => svc.listDocuments(unref(params)), {
    key: () => `eta:docs:${JSON.stringify(unref(params))}`,
    staleMs: 15_000,
  })
}

export function useEtaItemCodesList(params: Ref<EtaListParams> | ComputedRef<EtaListParams>) {
  const svc = etaService()
  return useQuery(() => svc.listItemCodes(unref(params)), {
    key: () => `eta:codes:${JSON.stringify(unref(params))}`,
    staleMs: 60_000,
  })
}

export function useEtaMutations() {
  const svc = etaService()
  const bust = () => invalidateQuery(/^eta:/)

  return {
    updateSettings: useMutation(async (form: Partial<EtaSettings>) => {
      const r = await svc.updateSettings(form)
      bust()
      return r
    }),
    prepare: useMutation(async (invoiceId: number) => {
      const r = await svc.prepareDocument(invoiceId, generateRequestId())
      bust()
      return r
    }),
    submit: useMutation(async (invoiceId: number) => {
      const r = await svc.submitDocument(invoiceId, generateRequestId())
      bust()
      return r
    }),
    checkStatus: useMutation(async (invoiceId: number) => {
      const r = await svc.checkStatus(invoiceId)
      bust()
      return r
    }),
    cancelDocument: useMutation(async ({ invoiceId, reason }: { invoiceId: number; reason: string }) => {
      const r = await svc.cancelDocument(invoiceId, reason)
      bust()
      return r
    }),
    createItemCode: useMutation(async (form: Partial<EtaItemCode>) => {
      const r = await svc.createItemCode(form, generateRequestId())
      bust()
      return r
    }),
    updateItemCode: useMutation(async ({ id, form }: { id: number; form: Partial<EtaItemCode> }) => {
      const r = await svc.updateItemCode(id, form)
      bust()
      return r
    }),
    removeItemCode: useMutation(async (id: number) => {
      await svc.removeItemCode(id)
      bust()
    }),
  }
}

/** Legacy shim. */
export function useEta() {
  const svc = etaService()

  return {
    getSettings:     () => svc.getSettings(),
    updateSettings:  (form: Partial<EtaSettings>) => svc.updateSettings(form),
    getDocuments:    (params?: Record<string, any>) => svc.listDocuments((params ?? {}) as EtaListParams),
    prepareDocument: (id: number) => svc.prepareDocument(id, generateRequestId()),
    submitDocument:  (id: number) => svc.submitDocument(id, generateRequestId()),
    checkStatus:     (id: number) => svc.checkStatus(id),
    cancelDocument:  (id: number, reason: string) => svc.cancelDocument(id, reason),
    getItemCodes:    (params?: Record<string, any>) => svc.listItemCodes((params ?? {}) as EtaListParams),
    createItemCode:  (form: Partial<EtaItemCode>) => svc.createItemCode(form, generateRequestId()),
    updateItemCode:  (id: number, form: Partial<EtaItemCode>) => svc.updateItemCode(id, form),
    deleteItemCode:  (id: number) => svc.removeItemCode(id),
  }
}
