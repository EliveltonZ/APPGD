import { apiGet, apiPost } from "./api";
import { fmtDate } from "../utils/dateUtils";
import type {
  ProductionProject,
  ProjectType,
  ProjectReleaseFormData,
  ExportProjectsFormData,
} from "../types/pcp";

type RawPcpProject = Record<string, unknown>;

function toPcpProject(raw: RawPcpProject, ordemdecompra?: number): ProductionProject {
  const oc = ordemdecompra ?? Number(raw.ordemdecompra);
  return {
    id: oc,
    numOC: String(oc),
    contrato: String(raw.contrato ?? ""),
    cliente: (raw.cliente as string) ?? "",
    urgente: Boolean(raw.urgente),
    corteCC: String(raw.codcc ?? ""),
    ambiente: (raw.ambiente as string) ?? "",
    numProjeto: (raw.numproj as string) ?? "",
    pedido: String(raw.pedido ?? ""),
    tipo: (raw.tipo as ProjectType) ?? "promob",
    pecas: Number(raw.pecas ?? 0),
    area: Number(raw.area ?? 0),
    lote: String(raw.lote ?? ""),
    chegouFabrica: fmtDate(raw.chegoufabrica as string),
    entrega: fmtDate(raw.dataentrega as string),
    status: (raw.status as import("../types/pcp").ProjectStatus) ?? "disponivel",
  };
}

export async function fetchProductionProjects(): Promise<ProductionProject[]> {
  const rows = await apiGet<RawPcpProject[]>("/pcp/");
  return rows.map((r) => toPcpProject(r));
}

export async function fetchProjectPcp(ordemdecompra: number): Promise<ProductionProject | null> {
  const rows = await apiGet<RawPcpProject[]>("/pcp/", { id: ordemdecompra });
  const raw = Array.isArray(rows) ? rows[0] : (rows as RawPcpProject | null);
  if (!raw) return null;
  return toPcpProject(raw, ordemdecompra);
}

export async function searchProjectForRelease(
  ordemdecompra: number,
): Promise<import("../types/pcp").ProjectReleaseFormData | null> {
  type R = Record<string, unknown>;
  const rows = await apiGet<R[]>("/pcp/", { id: ordemdecompra });
  const raw = Array.isArray(rows) ? rows[0] : null;
  if (!raw) return null;
  return {
    numOC: String(ordemdecompra),
    contrato: String(raw.contrato ?? ""),
    cliente: String(raw.cliente ?? ""),
    urgente: Boolean(raw.urgente),
    corteCC: String(raw.codcc ?? ""),
    ambiente: String(raw.ambiente ?? ""),
    numProjeto: String(raw.numproj ?? ""),
    pedido: String(raw.pedido ?? ""),
    tipo: (raw.tipo as import("../types/pcp").ProjectType) ?? "promob",
    pecas: Number(raw.pecas ?? 0),
    area: Number(raw.area ?? 0),
    lote: String(raw.lote ?? ""),
    chegouFabrica: raw.chegoufabrica ? String(raw.chegoufabrica).split("T")[0] : "",
    entrega: raw.dataentrega ? String(raw.dataentrega).split("T")[0] : "",
  };
}

export async function fetchLastLote(): Promise<number> {
  type R = Record<string, unknown>;
  const rows = await apiGet<R[]>("/pcp/ultimo-lote");
  return Number(rows[0]?.lote ?? 0);
}

export async function fetchLoteAvailable(): Promise<
  import("../types/pcp").LoteAvailableProject[]
> {
  type R = Record<string, unknown>;
  const rows = await apiGet<R[]>("/pcp/lote");
  return rows.map((r) => ({
    id: Number(r.ordemdecompra),
    numOC: String(r.ordemdecompra ?? ""),
    pedido: String(r.pedido ?? ""),
    corteCC: String(r.codcc ?? ""),
    cliente: String(r.cliente ?? ""),
    ambiente: String(r.ambiente ?? ""),
    entrega: String(r.dataentrega ?? ""),
  }));
}

export interface ExportedProject {
  ordemdecompra: string;
  contrato: string;
  cliente: string;
  ambiente: string;
  numproj: string;
  chegoufabrica: string;
  dataentrega: string;
  vendedor: string;
}

export async function exportarProjetos(form: ExportProjectsFormData): Promise<ExportedProject[]> {
  type R = Record<string, unknown>;
  const rows = await apiGet<R[]>("/pcp/exportar", {
    dataInicial: form.dataInicial,
    dataFinal: form.dataFinal,
  });
  return rows.map((r) => ({
    ordemdecompra: String(r.ordemdecompra ?? ""),
    contrato:      String(r.contrato      ?? ""),
    cliente:       String(r.cliente       ?? ""),
    ambiente:      String(r.ambiente      ?? ""),
    numproj:       String(r.numproj       ?? ""),
    chegoufabrica: String(r.chegoufabrica ?? ""),
    dataentrega:   String(r.dataentrega   ?? ""),
    vendedor:      String(r.vendedor      ?? ""),
  }));
}

export interface PcpCards {
  disponivel: number;
  em_lote: number;
  em_producao: number;
  concluido: number;
}

export async function fetchPcpCards(): Promise<PcpCards> {
  type R = Record<string, unknown>;
  const rows = await apiGet<R[]>("/pcp/cards");
  const r = rows[0] ?? {};
  return {
    disponivel:  Number(r.disponivel  ?? 0),
    em_lote:     Number(r.em_lote     ?? 0),
    em_producao: Number(r.em_producao ?? 0),
    concluido:   Number(r.concluido   ?? 0),
  };
}

export async function fetchMaxOrder(): Promise<number> {
  type R = Record<string, unknown>;
  const rows = await apiGet<R[]>("/utils/max-order");
  return Number(rows[0]?.max ?? 0);
}

export function createLote(lote: string, ids: number[]): Promise<unknown> {
  return apiPost("/pcp/lote", { lote, ids });
}

export function atualizarLote(ordemDeCompra: number, lote: number): Promise<unknown> {
  return apiPost("/pcp/lote", { p_ordemdecompra: ordemDeCompra, p_lote: lote });
}

export async function fetchLotes(): Promise<number[]> {
  type R = Record<string, unknown>;
  const rows = await apiGet<R[]>("/pcp/lotes");
  return rows.map((r) => Number(r.lote));
}

export function startLote(lote: number, dataInicio: string): Promise<unknown> {
  return apiPost("/pcp/iniciar", { p_lote: lote, p_datainicio: dataInicio });
}

export function updateProjectPcp(form: ProjectReleaseFormData): Promise<unknown> {
  return apiPost("/pcp/projeto", {
    p_ordemdecompra: Number(form.numOC),
    p_urgente:       form.urgente,
    p_codcc:         Number(form.corteCC) || 0,
    p_lote:          Number(form.lote) || 0,
    p_pedido:        Number(form.pedido) || 0,
    p_tipo:          form.tipo,
    p_pecas:         Number(form.pecas),
    p_area:          Number(form.area),
  });
}
