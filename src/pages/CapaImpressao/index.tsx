import { useState, useEffect } from "react";
import "./CapaImpressao.css";
import logo from "../../assets/logo.png";

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

  acessorios?: AcessorioItem[];
}

// ── Sub-components ───────────────────────────────────────

const DATE_PH = "___/___/___  ___:___";

function EtapaRow({ label, etapa }: { label: string; etapa?: EtapaInfo }) {
  return (
    <div className="cp-row" style={{ height: 26 }}>
      <div
        className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue"
        style={{ width: 122.766 }}
      >
        <label className="cp-label cp-bold">{label}</label>
      </div>
      <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 170 }}>
        <label className="cp-label cp-etapa-date">
          {etapa?.inicio || DATE_PH}
        </label>
      </div>
      <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 170 }}>
        <label className="cp-label cp-etapa-date">
          {etapa?.fim || DATE_PH}
        </label>
      </div>
      <div
        className="cp-cell cp-no-r cp-no-t"
        style={{ width: 120, paddingLeft: 4 }}
      >
        <label className="cp-label">{etapa?.responsavel ?? ""}</label>
      </div>
      <div className="cp-cell cp-no-t" style={{ width: 120, paddingLeft: 4 }}>
        <label className="cp-label">{etapa?.pausa ?? ""}</label>
      </div>
    </div>
  );
}

function ExpRow({
  label,
  item,
  hasCheckboxes = true,
}: {
  label: string;
  item?: ExpedicaoLinha;
  hasCheckboxes?: boolean;
}) {
  return (
    <div className="cp-row" style={{ height: 26 }}>
      <div
        className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue"
        style={{ width: 114 }}
      >
        <label className="cp-label cp-bold cp-font-9">{label}</label>
      </div>
      {hasCheckboxes && (
        <>
          <div
            className="cp-cell cp-no-r cp-no-t cp-center"
            style={{ width: 59.64 }}
          >
            <label className="cp-label"> □ SIM</label>
          </div>
          <div
            className="cp-cell cp-no-r cp-no-t cp-center"
            style={{ width: 59.64 }}
          >
            <label className="cp-label cp-font-10"> □ NÃO</label>
          </div>
        </>
      )}
      <div
        className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue"
        style={{ width: 80 }}
      >
        <label className="cp-label cp-font-10">VOLUMES:</label>
      </div>
      <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 80 }}>
        <label className="cp-label">{item?.qtd ?? ""}</label>
      </div>
      <div
        className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue"
        style={{ width: 60 }}
      >
        <label className="cp-label cp-font-10">BOX:</label>
      </div>
      <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 80 }}>
        <label className="cp-label">{item?.box ?? ""}</label>
      </div>
      <div
        className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue"
        style={{ width: 120 }}
      >
        <label className="cp-label cp-font-10">CONFERIDO POR:</label>
      </div>
      <div className="cp-cell cp-no-t" style={{ flex: 1 }} />
    </div>
  );
}

// ── Main component ───────────────────────────────────────

export function CapaImpressao({ data = {} }: { data?: CapaData }) {
  const et = data.etapas ?? {};
  const ex = data.expedicao ?? {};
  const acess = data.acessorios ?? [];

  return (
    <div className="capa-wrapper" id="impressao">
      {/* ── Cabeçalho ──────────────────────────────── */}
      <div className="cp-row" style={{ height: 48, marginTop: 4 }}>
        <div className="cp-cell cp-no-r cp-center" style={{ width: "18vh" }}>
          <img
            src={logo}
            alt="GD"
            style={{ width: "60%", height: "80%", objectFit: "contain" }}
          />
        </div>
        <div className="cp-cell cp-center cp-bg-blue" style={{ flex: 1 }}>
          <label className="cp-label cp-bold" style={{ fontSize: 26 }}>
            CONTROLE DE PRODUÇÃO
          </label>
        </div>
      </div>

      {/* ── Linha de identificação — labels ────────── */}
      <div className="cp-row" style={{ height: 26, marginTop: 8 }}>
        <div className="cp-cell cp-no-r cp-center" style={{ width: 122 }}>
          <label className="cp-label cp-bold">CÓD. CORTE CERTO</label>
        </div>
        <div className="cp-cell cp-no-r cp-center" style={{ width: 96 }}>
          <label className="cp-label cp-bold">LOTE</label>
        </div>
        <div className="cp-cell cp-no-r cp-center" style={{ width: 104 }}>
          <label className="cp-label cp-bold">PEDIDO</label>
        </div>
        <div className="cp-cell cp-no-r cp-center" style={{ width: 131 }}>
          <label className="cp-label cp-bold">CONTRATO</label>
        </div>
        <div className="cp-cell cp-no-r cp-center" style={{ width: 110 }}>
          <label className="cp-label cp-bold">QTDE PROJETOS</label>
        </div>
        <div className="cp-cell cp-no-r cp-center" style={{ width: 104 }}>
          <label className="cp-label cp-bold">NUM. PROJETO</label>
        </div>
        <div className="cp-cell cp-center" style={{ flex: 1 }}>
          <label className="cp-label cp-bold">URG</label>
        </div>
      </div>

      {/* ── Linha de identificação — valores ───────── */}
      <div className="cp-row" style={{ height: 26 }}>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 122 }}
        >
          <label className="cp-label">{data.corte ?? ""}</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 96 }}
        >
          <label className="cp-label">{data.lote ?? ""}</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 104 }}
        >
          <label className="cp-label">{data.pedido ?? ""}</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 131 }}
        >
          <label className="cp-label">{data.contrato ?? ""}</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 110 }}
        >
          <label className="cp-label">{data.qtdeProjetos ?? ""}</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 104 }}
        >
          <label className="cp-label">{data.numProjeto ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-t cp-center" style={{ flex: 1 }}>
          <label className="cp-label">{data.urgente ?? ""}</label>
        </div>
      </div>

      {/* ── INFORMAÇÕES DO CONTRATO ────────────────── */}
      <div className="cp-title cp-bg-red" style={{ marginTop: 8 }}>
        INFORMAÇÕES DO CONTRATO
      </div>

      <div className="cp-row" style={{ height: 26 }}>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 122 }}
        >
          <label className="cp-label cp-bold">CLIENTE:</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t"
          style={{ width: 343, paddingLeft: 5 }}
        >
          <label className="cp-label">{data.cliente ?? ""}</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 104 }}
        >
          <label className="cp-label cp-bold">N° O.C.:</label>
        </div>
        <div className="cp-cell cp-no-t cp-center" style={{ flex: 1 }}>
          <label className="cp-label">{data.numOc ?? ""}</label>
        </div>
      </div>

      <div className="cp-row" style={{ height: 26 }}>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 122 }}
        >
          <label className="cp-label cp-bold">AMBIENTE:</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t"
          style={{ width: 343, paddingLeft: 5 }}
        >
          <label className="cp-label">{data.ambiente ?? ""}</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center cp-bg-green"
          style={{ width: 104 }}
        >
          <label className="cp-label cp-bold">ENTREGA:</label>
        </div>
        <div className="cp-cell cp-no-t cp-center" style={{ flex: 1 }}>
          <label className="cp-label" style={{ color: "red" }}>
            {data.dataEntrega ?? ""}
          </label>
        </div>
      </div>

      <div className="cp-row" style={{ height: 26 }}>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 122 }}
        >
          <label className="cp-label cp-bold">VENDEDOR:</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t"
          style={{ width: 343, paddingLeft: 5 }}
        >
          <label className="cp-label">{data.vendedor ?? ""}</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 104 }}
        >
          <label className="cp-label cp-bold">LIBERADOR:</label>
        </div>
        <div className="cp-cell cp-no-t cp-center" style={{ flex: 1 }}>
          <label className="cp-label">{data.liberador ?? ""}</label>
        </div>
      </div>

      {/* ── CORES DO PROJETO + OBSERVAÇÕES ─────────── */}
      <div
        style={{
          height: 75,
          marginTop: 8,
          border: "0.25pt solid #000",
        }}
      >
        <div className="cp-title cp-bg-blue">
          CORES DO PROJETO + OBSERVAÇÕES
        </div>
        <div
          style={{
            borderTop: "0.25pt solid #000",
            height: "calc(33.3% - 1px)",
            padding: "2px 4px",
          }}
        >
          <label className="cp-label">{data.observacoes ?? ""}</label>
        </div>
        <div style={{ borderTop: "0.25pt solid #000", height: "33.3%" }} />
      </div>

      {/* ── INFORMAÇÕES DE PRODUÇÃO ────────────────── */}
      <div className="cp-title cp-bg-red" style={{ marginTop: 8 }}>
        INFORMAÇÕES DE PRODUÇÃO
      </div>

      <div className="cp-row" style={{ height: 50 }}>
        {/* Tipo */}
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: "18%" }}
        >
          <label className="cp-label" style={{ fontSize: 13 }}>
            {data.tipo ?? ""}
          </label>
        </div>

        {/* Responsável / Data */}
        <div
          style={{
            width: "27%",
            border: "0.25pt solid #000",
            borderTop: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "50%",
              borderBottom: "0.25pt solid #000",
              paddingLeft: 3,
            }}
          >
            <label className="cp-label" style={{ fontSize: 10 }}>
              Responsavel:
            </label>
            <label
              className="cp-label cp-bold"
              style={{ fontSize: 10, marginLeft: 6 }}
            >
              {data.responsavel ?? ""}
            </label>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "50%",
              paddingLeft: 3,
            }}
          >
            <label
              className="cp-label"
              style={{ fontSize: 10, width: 60, textAlign: "right" }}
            >
              Data:
            </label>
            <label className="cp-label" style={{ marginLeft: 6 }}>
              {data.data ?? ""}
            </label>
          </div>
        </div>

        {/* ENVIADO P/ CORTE */}
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: "27%" }}
        >
          <label className="cp-label cp-bold">ENVIADO P/ CORTE</label>
        </div>

        {/* Responsável / Data (enviado) */}
        <div
          style={{
            flex: 1,
            border: "0.25pt solid #000",
            borderTop: "none",
            borderLeft: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "50%",
              borderBottom: "0.25pt solid #000",
              paddingLeft: 3,
            }}
          >
            <label className="cp-label" style={{ fontSize: 10 }}>
              Responsavel:
            </label>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "50%",
              paddingLeft: 3,
            }}
          >
            <label className="cp-label" style={{ fontSize: 10 }}>
              Data:
            </label>
          </div>
        </div>
      </div>

      {/* ── ETAPAS — cabeçalho ─────────────────────── */}
      <div className="cp-row" style={{ height: 26, marginTop: 8 }}>
        <div
          className="cp-cell cp-no-r cp-center cp-bg-blue"
          style={{ width: 122.766 }}
        >
          <label className="cp-label cp-bold">ETAPAS:</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-center cp-bg-blue"
          style={{ width: 170 }}
        >
          <label className="cp-label cp-bold">INICIO:</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-center cp-bg-blue"
          style={{ width: 170 }}
        >
          <label className="cp-label cp-bold">FIM:</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-center cp-bg-blue"
          style={{ width: 120 }}
        >
          <label className="cp-label cp-bold">RESPONSAVEL:</label>
        </div>
        <div className="cp-cell cp-center cp-bg-blue" style={{ width: 120 }}>
          <label className="cp-label cp-bold">PAUSA:</label>
        </div>
      </div>

      <EtapaRow label="CORTE:" etapa={et.corte} />
      <EtapaRow label="CUSTOMIZACÃO:" etapa={et.customizacao} />
      <EtapaRow label="COLADEIRA:" etapa={et.coladeira} />
      <EtapaRow label="USINAGEM:" etapa={et.usinagem} />
      <EtapaRow label="MONTAGEM:" etapa={et.montagem} />
      <EtapaRow label="PAINEIS:" etapa={et.paineis} />
      <EtapaRow label="EMBALAGEM:" etapa={et.embalagem} />
      <EtapaRow label="ACAB. ESPECIAIS:" etapa={et.acabamento} />

      {/* ── PENDÊNCIAS (pequeno) ───────────────────── */}
      <div
        style={{
          height: 50,
          marginTop: 8,
          marginBottom: 8,
          border: "0.25pt solid #000",
        }}
      >
        <div className="cp-title cp-bg-blue">PENDÊNCIAS PARA EXPEDIÇÃO</div>
        <div style={{ borderTop: "0.25pt solid #000", height: "50%" }} />
      </div>

      {/* ── EXPEDIÇÃO ──────────────────────────────── */}
      <div style={{ border: "0.25pt solid #000" }}>
        <div className="cp-title cp-bg-red">EXPEDIÇÃO</div>
      </div>

      {/* Volumes de modulação */}
      <div className="cp-row" style={{ height: 26 }}>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue"
          style={{ width: "27%" }}
        >
          <label className="cp-label cp-bold cp-font-9">
            VOLUMES DE MODULAÇÃO / PEÇAS:
          </label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 205 }}
        >
          <label className="cp-label">{ex.modulos?.qtd ?? ""}</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue"
          style={{ width: 60 }}
        >
          <label className="cp-label cp-font-10">BOX:</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 80 }}
        >
          <label className="cp-label">{ex.modulos?.box ?? ""}</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue"
          style={{ width: 120 }}
        >
          <label className="cp-label cp-font-10">CONFERIDO POR:</label>
        </div>
        <div className="cp-cell cp-no-t" style={{ flex: 1 }} />
      </div>

      <ExpRow label="ACESSÓRIOS AVULSOS" item={ex.avulso} />
      <ExpRow label="PAINEIS" item={ex.paineis} />
      <ExpRow label="PORTAS DE ALUMÍNIO" item={ex.portaAluminio} />
      <ExpRow label="VIDROS / ESPELHOS" item={ex.vidros} />
      <ExpRow label="PINTURAS / LAQUEAÇÃO" item={ex.pecasPintadas} />
      <ExpRow label="TAPEÇARIAS" item={ex.tapecaria} />
      <ExpRow label="SERRALHERIA" item={ex.serralheria} />
      <ExpRow label="CABIDES" item={ex.cabide} />
      <ExpRow label="TRILHOS" item={ex.trilho} />

      {/* Total volumes */}
      <div className="cp-row" style={{ height: 26 }}>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center cp-bg-red"
          style={{ width: 114 }}
        >
          <label className="cp-label cp-font-10">TOTAL VOLUMES</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center"
          style={{ width: 119 }}
        >
          <label className="cp-label">{data.totalVolumes ?? ""}</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center cp-bg-red"
          style={{ width: 141 }}
        >
          <label className="cp-label cp-font-10">PRONTO P/ ENTREGA</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t"
          style={{ width: 159, paddingLeft: 2 }}
        >
          <label className="cp-label cp-font-9">DATA:</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-no-t cp-center cp-bg-red"
          style={{ width: 120 }}
        >
          <label className="cp-label cp-font-10">CONFERIDO POR:</label>
        </div>
        <div className="cp-cell cp-no-t cp-center" style={{ flex: 1 }}>
          <label className="cp-label">{data.conferido ?? ""}</label>
        </div>
      </div>

      {/* Saída p/ entrega */}
      <div className="cp-row" style={{ height: 26, marginTop: 8 }}>
        <div
          className="cp-cell cp-no-r cp-center cp-bg-green"
          style={{ width: 114.766 }}
        >
          <label className="cp-label cp-bold cp-font-9">SAIDA P/ ENTREGA</label>
        </div>
        <div className="cp-cell cp-no-r" style={{ flex: 1, paddingLeft: 2 }}>
          <label className="cp-label cp-font-9">DATA E HORA:</label>
        </div>
        <div
          className="cp-cell cp-no-r cp-center cp-bg-green"
          style={{ width: 153 }}
        >
          <label className="cp-label cp-bold cp-font-9">
            MOTORISTA RESPONSAVEL
          </label>
        </div>
        <div className="cp-cell cp-center" style={{ width: 203 }}>
          <label className="cp-label">{data.motorista ?? ""}</label>
        </div>
      </div>

      {/* ── ACESSÓRIOS LANÇADOS ────────────────────── */}
      <div style={{ marginTop: 10 }}>
        <div
          className="cp-title cp-bg-blue"
          style={{ border: "0.25pt solid #000" }}
        >
          ACESSÓRIOS LANÇADOS
        </div>
      </div>
      <div
        style={{
          height: 350,
          border: "0.25pt solid #000",
          borderTop: "none",
          overflow: "hidden",
        }}
      >
        <table className="cp-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Descrição</th>
              <th style={{ textAlign: "center" }}>Medida</th>
              <th style={{ textAlign: "center" }}>Qtd</th>
            </tr>
          </thead>
          <tbody>
            {acess.map((a, i) => (
              <tr key={i}>
                <td>{a.categoria}</td>
                <td>{a.descricao}</td>
                <td style={{ textAlign: "center" }}>{a.medida ?? ""}</td>
                <td style={{ textAlign: "center" }}>{a.qtd ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── CHAPAS + FITAS DE BORDA ────────────────── */}
      <div className="cp-row" style={{ marginTop: 10 }}>
        <div
          className="cp-cell cp-no-r cp-center cp-bg-blue"
          style={{ width: "50%", height: 24, fontWeight: 700, fontSize: 14 }}
        >
          CHAPAS
        </div>
        <div
          className="cp-cell cp-center cp-bg-blue"
          style={{ width: "50%", height: 24, fontWeight: 700, fontSize: 14 }}
        >
          FITAS DE BORDA
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="cp-row" style={{ height: 25 }}>
          <div className="cp-cell cp-no-r cp-no-t" style={{ width: "50%" }} />
          <div className="cp-cell cp-no-t" style={{ width: "50%" }} />
        </div>
      ))}

      {/* ── ACESSÓRIOS AVULSOS ─────────────────────── */}
      <div style={{ marginTop: 10 }}>
        <div
          className="cp-title cp-bg-blue"
          style={{ border: "0.25pt solid #000" }}
        >
          ACESSÓRIOS AVULSOS
        </div>
      </div>
      {Array.from({ length: 11 }).map((_, i) => (
        <div key={i} className="cp-row" style={{ height: 25 }}>
          <div
            className="cp-cell cp-no-r cp-no-t"
            style={{ width: "50%", paddingLeft: 4 }}
          >
            <label className="cp-label" style={{ fontSize: 17 }}>
              □
            </label>
          </div>
          <div
            className="cp-cell cp-no-t"
            style={{ width: "50%", paddingLeft: 4 }}
          >
            <label className="cp-label" style={{ fontSize: 17 }}>
              □
            </label>
          </div>
        </div>
      ))}

      {/* ── PENDÊNCIAS PARA EXPEDIÇÃO (grande) ─────── */}
      <div style={{ height: 133, marginTop: 10 }}>
        <div
          className="cp-title cp-bg-blue"
          style={{
            border: "0.25pt solid #000",
            borderBottom: "1px solid #000",
          }}
        >
          PENDÊNCIAS PARA EXPEDIÇÃO
        </div>
      </div>
    </div>
  );
}

// ── Mock data (substitua pelo fetch real usando ?id= da URL) ─

const MOCK_DATA: CapaData = {
  corte: "",
  lote: "",
  pedido: "",
  contrato: "1901",
  qtdeProjetos: "01/02",
  numProjeto: "-",
  urgente: "-",

  cliente: "AMANDA YURI BABA SILVEIRA",
  numOc: "1",
  ambiente: "DORMITORIO SOLTEIRO - BIA",
  dataEntrega: "09/04/2026",
  vendedor: "JANE RODRIGUES",
  liberador: "MONALISA",

  observacoes: "",

  tipo: "PROMOB",
  responsavel: "ELIVELTON GONZAGA",
  data: "02/05/2026",

  etapas: {
    corte: {},
    customizacao: {},
    coladeira: {},
    usinagem: {},
    montagem: {},
    paineis: {},
    embalagem: {},
    acabamento: {},
  },

  expedicao: {
    modulos: {},
    avulso: {},
    paineis: {},
    portaAluminio: {},
    vidros: {},
    pecasPintadas: {},
    tapecaria: {},
    serralheria: {},
    cabide: {},
    trilho: {},
  },

  totalVolumes: "",
  conferido: "",
  motorista: "",

  acessorios: [
    {
      categoria: "ACESSORIOS AVULSOS",
      descricao: "PUXADOR SINNAI ESCOVADO",
      medida: "30MM",
      qtd: 3,
    },
  ],
};

async function fetchCapaData(_id: string): Promise<CapaData> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return MOCK_DATA;
}

// ── Page wrapper (carregado no iframe) ───────────────────

export function CapaImpressaoPage() {
  const [data, setData] = useState<CapaData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") ?? "mock";
    fetchCapaData(id)
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Arial, sans-serif",
          color: "#c00",
        }}
      >
        Erro ao carregar dados do relatório.
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="cp-spinner" />
      </div>
    );
  }

  return <CapaImpressao data={data} />;
}
