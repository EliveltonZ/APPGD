import { apiPost } from './api'

export type ItemXmlTipo = 'CHAPA' | 'FITA' | 'FERRAGEM'

export interface ItemXml {
  tipo: ItemXmlTipo
  descricao: string
  referencia: string
  unidade: string
  quantidade: number
  material: string | null
  cor: string | null
  espessura: string | null
  materialId: number | null
}

export interface PreviewXmlResult {
  cliente: { codigo: string | null; nome: string | null }
  itens: ItemXml[]
}

export const previewXml = (xml: string): Promise<PreviewXmlResult> =>
  apiPost('/estoque/xml/preview', { xml })

export const vincularReferencia = (referenciaPromob: string, materialId: number) =>
  apiPost('/estoque/xml/vincular', { referencia_promob: referenciaPromob, material_id: materialId })

export interface ConfirmarXmlItem {
  referencia: string
  unidade: string
  quantidade: number
  materialId: number
}

export const confirmarXml = (
  ordemdecompra: number,
  arquivoNome: string,
  itens: ConfirmarXmlItem[],
) =>
  apiPost('/estoque/xml/confirmar', {
    ordemdecompra,
    arquivo_nome: arquivoNome,
    itens: itens.map((i) => ({
      referencia: i.referencia,
      unidade: i.unidade,
      quantidade: i.quantidade,
      materialId: i.materialId,
    })),
  })
