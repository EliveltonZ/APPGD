import { apiGet, apiPost } from "./api";
import { fmtDate, toDateInput, toDatetimeLocal } from "../utils/dateUtils";
import type {
  ProductionOrder,
  ProductionDetail,
  SectorData,
  Employee,
} from "../types/production";
import type { Material } from "../types/common";

const SECTORS = [
  "corte",
  "customizacao",
  "coladeira",
  "usinagem",
  "montagem",
  "paineis",
  "acabamento",
  "embalagem",
] as const;

type RawRow = Record<string, unknown>;

function toOrder(raw: RawRow): ProductionOrder {
  return {
    ...(raw as unknown as ProductionOrder),
    chegoufabrica: fmtDate(raw.chegoufabrica as string) || null,
    dataentrega: fmtDate(raw.dataentrega as string) || null,
    iniciado: fmtDate(raw.iniciado as string) || null,
    previsao: fmtDate(raw.previsao as string) || null,
    pronto: fmtDate(raw.pronto as string) || null,
    entrega: fmtDate(raw.entrega as string) || null,
  };
}

function toMaterial(raw: RawRow): Material {
  return {
    id: String(raw.id ?? ""),
    categoria: (raw.categoria as string) ?? undefined,
    descricao: (raw.descricao as string) ?? "",
    medida: (raw.medida as string) ?? "",
    qtd: Number(raw.qtd ?? 0),
    compra: toDateInput(raw.datacompra),
    previsao: toDateInput(raw.previsao),
    recebido: toDateInput(raw.recebido),
  };
}

function toDetail(raw: RawRow): ProductionDetail {
  const setores: Record<string, SectorData> = {};
  for (const s of SECTORS) {
    setores[s] = {
      inicio: toDatetimeLocal(raw[`${s}inicio`]),
      fim: toDatetimeLocal(raw[`${s}fim`]),
      pausa: Boolean(raw[`${s}pausa`]),
      responsavelId: String(raw[`${s}resp`] ?? ""),
      responsavelNome: (raw[`${s}name`] as string) ?? "",
    };
  }
  return {
    orderId: raw.ordemdecompra as number,
    ordemCompra: String(raw.ordemdecompra),
    contrato: String(raw.contrato),
    cliente: raw.cliente as string,
    ambiente: raw.ambiente as string,
    numeroProjeto: raw.numproj as string,
    lote: String(raw.lote),
    chegouFabrica: toDateInput(raw.chegoufabrica),
    prazo: toDateInput(raw.dataentrega),
    previsao: toDateInput(raw.previsao),
    observacoes: (raw.observacoes as string) ?? "",
    setores,
    materiais: [],
  };
}

export async function fetchProductionOrders(): Promise<ProductionOrder[]> {
  const rows = await apiGet<RawRow[]>("/producao/");
  return rows.map(toOrder);
}

export async function fetchMateriais(orderId: number): Promise<Material[]> {
  const rows = await apiGet<RawRow[]>("/producao/materiais", { id: orderId });
  return rows.map(toMaterial);
}

export async function fetchProductionDetail(
  orderId: number,
): Promise<ProductionDetail | null> {
  const [rows, materiais] = await Promise.all([
    apiGet<RawRow[]>("/producao/projeto", { id: orderId }),
    fetchMateriais(orderId),
  ]);
  const raw = Array.isArray(rows) ? rows[0] : (rows as RawRow | null);
  if (!raw) return null;
  return { ...toDetail(raw), materiais };
}

function toSavePayload(detail: ProductionDetail): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    p_ordemdecompra: detail.orderId,
    p_observacoes: detail.observacoes,
    p_previsao: detail.previsao || null,
  };
  for (const s of SECTORS) {
    const sec = detail.setores[s] ?? {};
    payload[`p_${s}inicio`] = (sec.inicio as string) || null;
    payload[`p_${s}fim`] = (sec.fim as string) || null;
    payload[`p_${s}resp`] = sec.responsavelId
      ? Number(sec.responsavelId)
      : null;
    payload[`p_${s}pausa`] = Boolean(sec.pausa);
  }
  return payload;
}

export function saveProductionData(detail: ProductionDetail): Promise<unknown> {
  return apiPost("/producao/dados", toSavePayload(detail));
}

function toEmployee(raw: RawRow): Employee {
  return {
    id: String(raw.id ?? ""),
    nome: (raw.nome as string) ?? "",
  };
}

export async function fetchEmployees(): Promise<Employee[]> {
  const rows = await apiGet<RawRow[]>("/utils/operadores");
  return rows.map(toEmployee);
}

export interface CapaRelatorioResult {
  found: boolean;
  totalvolumes: number;
  tipo: string;
  urgente: boolean;
}

export async function fetchCapaRelatorio(id: number): Promise<CapaRelatorioResult> {
  const rows = await apiGet<RawRow[]>("/producao/capa", { id });
  if (!rows.length) return { found: false, totalvolumes: 0, tipo: '', urgente: false };
  const r = rows[0];
  return {
    found:       true,
    totalvolumes: Number(r.totalvolumes ?? 0),
    tipo:        String(r.tipo ?? ''),
    urgente:     Boolean(r.urgente),
  };
}

export async function saveTipoUrgente(oc: string, tipo: string, urgente: boolean): Promise<void> {
  await apiPost('/utils/tipo', { p_ordemdecompra: oc, p_tipo: tipo, p_urgente: urgente });
}
