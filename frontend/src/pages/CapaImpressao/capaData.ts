import { apiGet } from "../../services/api";
import { fmtDate, fmtDateTimeLocal } from "../../utils/dateUtils";

// ── Types ────────────────────────────────────────────────

export interface EtapaInfo {
  inicio?: string;
  fim?: string;
  responsavel?: string;
  pausa?: string;
}

export interface AcessorioItem {
  categoria: string;
  descricao: string;
  medida?: string;
  qtd?: string | number;
}

export interface ExpedicaoLinha {
  qtd?: string;
  box?: string;
}

export interface CapaData {
  corte?: string;
  lote?: string;
  pedido?: string;
  contrato?: string;
  qtdeProjetos?: string;
  numProjeto?: string;
  urgente?: string;

  cliente?: string;
  numOc?: string;
  ambiente?: string;
  dataEntrega?: string;
  vendedor?: string;
  liberador?: string;

  observacoes?: string;

  tipo?: string;
  responsavel?: string;
  data?: string;

  etapas?: {
    corte?: EtapaInfo;
    customizacao?: EtapaInfo;
    coladeira?: EtapaInfo;
    usinagem?: EtapaInfo;
    montagem?: EtapaInfo;
    paineis?: EtapaInfo;
    embalagem?: EtapaInfo;
    acabamento?: EtapaInfo;
  };

  expedicao?: {
    modulos?: ExpedicaoLinha;
    avulso?: ExpedicaoLinha;
    paineis?: ExpedicaoLinha;
    portaAluminio?: ExpedicaoLinha;
    vidros?: ExpedicaoLinha;
    pecasPintadas?: ExpedicaoLinha;
    tapecaria?: ExpedicaoLinha;
    serralheria?: ExpedicaoLinha;
    cabide?: ExpedicaoLinha;
    trilho?: ExpedicaoLinha;
  };

  totalVolumes?: string;
  conferido?: string;
  motorista?: string;
  pronto?: string;
  entrega?: string;

  acessorios?: AcessorioItem[];
}

// ── Data fetching ────────────────────────────────────────

export async function fetchCapaData(oc: number): Promise<CapaData> {
  type R = Record<string, unknown>;

  const [resCapa, resMateriais] = await Promise.allSettled([
    apiGet<R[]>("/producao/capa", { id: oc }),
    apiGet<R[]>("/producao/materiais", { id: oc }),
  ]);

  const d = resCapa.status === "fulfilled" ? (resCapa.value[0] ?? {}) : {};
  const mats = resMateriais.status === "fulfilled" ? resMateriais.value : [];

  function str(v: unknown): string {
    return v != null ? String(v) : "";
  }

  function num(v: unknown): string {
    if (v == null || v === "" || Number(v) === 0) return "";
    return String(v);
  }

  function etapaInfo(prefix: string): EtapaInfo {
    return {
      inicio: d[`${prefix}inicio`]
        ? fmtDateTimeLocal(str(d[`${prefix}inicio`]))
        : undefined,
      fim: d[`${prefix}fim`]
        ? fmtDateTimeLocal(str(d[`${prefix}fim`]))
        : undefined,
      responsavel: d[`${prefix}_resp`]
        ? str(d[`${prefix}_resp`])
        : undefined,
      pausa: d[`${prefix}pausa`] ? "SIM" : undefined,
    };
  }

  function expLinha(key: string): ExpedicaoLinha {
    return {
      qtd: num(d[`${key}q`]) || undefined,
      box: str(d[`${key}l`]) || undefined,
    };
  }

  const acessorios: AcessorioItem[] = mats.map((r) => ({
    categoria: str(r.categoria),
    descricao: str(r.descricao),
    medida: str(r.medida) || undefined,
    qtd: num(r.qtd) || undefined,
  }));

  return {
    corte: num(d.codcc),
    lote: num(d.lote),
    pedido: num(d.pedido),
    contrato: num(d.contrato),
    numProjeto: str(d.numproj),
    urgente: d.urgente ? "SIM" : "",
    cliente: str(d.cliente),
    numOc: str(oc),
    ambiente: str(d.ambiente),
    dataEntrega: fmtDate(str(d.dataentrega)),
    vendedor: str(d.vendedor),
    liberador: str(d.liberador),
    tipo: str(d.tipo).toUpperCase(),
    observacoes: str(d.observacoes),
    etapas: {
      corte: etapaInfo("corte"),
      customizacao: etapaInfo("customizacao"),
      coladeira: etapaInfo("coladeira"),
      usinagem: etapaInfo("usinagem"),
      montagem: etapaInfo("montagem"),
      paineis: etapaInfo("paineis"),
      acabamento: etapaInfo("acabamento"),
      embalagem: etapaInfo("embalagem"),
    },
    expedicao: {
      modulos: {
        qtd: num(d.modulosq) || undefined,
        box: str(d.modulosl) || undefined,
      },
      avulso: expLinha("avulso"),
      paineis: expLinha("paineis"),
      portaAluminio: expLinha("portaaluminio"),
      vidros: expLinha("vidros"),
      pecasPintadas: expLinha("pecaspintadas"),
      tapecaria: expLinha("tapecaria"),
      serralheria: expLinha("serralheria"),
      cabide: expLinha("cabide"),
      trilho: expLinha("trilho"),
    },
    totalVolumes: num(d.totalvolumes) || undefined,
    conferido: str(d.conferido_resp),
    motorista: str(d.motorista_resp),
    pronto: fmtDate(str(d.pronto)) || undefined,
    entrega: fmtDate(str(d.entrega)) || undefined,
    acessorios,
  };
}
