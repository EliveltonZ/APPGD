import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { waitForImages } from "../shared/waitForImages";
import { apiGet } from "../../../services/api";
import "./CapaAssistencia.css";
import { B } from "./constants";
import type { AssistData, Peca } from "./types";
import { PecaItem } from "./itensParts";
import { StageRow } from "./StageRow";
import { ClienteBlock } from "./ClienteBlock";
import { HeaderImg } from "./HeaderPrincipal";
import { HeaderSolicitation } from "./HeaderSolicitation";
import { PartsHeaders } from "./PartsHeaders";
import { AstecaBlock } from "./AstecaBlock";
import { ExpedicaoBlock } from "./ExpedicaoBlock";
import { RetiradaBlock } from "./RetiradaBlock";

// ── Data fetching ────────────────────────────────────────

async function fetchAssistData(id: string): Promise<AssistData> {
  type R = Record<string, unknown>;
  const rows = await apiGet<R[]>("/assistencias/projeto", {
    p_solicitacao: id,
  });
  if (!rows.length) throw new Error("Assistência não encontrada");
  const r = rows[0];
  const dtStr = String(r.datasolicitacao ?? "");
  const [datePart = "", timePart = ""] = dtStr.split("T");
  const [y = "", m = "", d = ""] = datePart.split("-");
  const time = timePart.split(".")[0] ?? "";
  return {
    numSolicitacao: String(r.solicitacao ?? ""),
    numContrato: String(r.contrato ?? ""),
    corte: String(r.corte ?? ""),
    pedido: String(r.pedido ?? ""),
    cliente: String(r.cliente ?? ""),
    ambiente: String(r.ambiente ?? ""),
    montador: String(r.montador ?? ""),
    solicitante: String(r.solicitante ?? ""),
    supervisor: String(r.supervisor ?? ""),
    responsavel: String(r.responsavel ?? ""),
    dataHora: datePart ? `${d}/${m}/${y}${time ? " " + time : ""}` : "",
    urgente: String(r.urgente ?? "nao").toUpperCase(),
  };
}

async function fetchPecas(id: string): Promise<Peca[]> {
  try {
    return await apiGet<Peca[]>("/pecas", { p_id_assistencia: id });
  } catch {
    return [];
  }
}

// ── Etapas de produção ───────────────────────────────────

const STAGES = [
  "CORTE:",
  "CUSTOMIZAÇÃO:",
  "COLADEIRA:",
  "USINAGEM:",
  "MONTAGEM:",
  "PAINEIS:",
  "EMBALAGEM:",
];

// ── Layout do documento ──────────────────────────────────

function CapaAssistencia({ data, pecas }: { data: AssistData; pecas: Peca[] }) {
  const urgenteClass = data.urgente === "SIM" ? "div-urgente-sim" : "";

  return (
    <div
      className="ca-wrapper text-reset justify-content-center"
      id="impressao"
    >
      {/* ── 1ª VIA ── */}
      <HeaderImg />
      <HeaderSolicitation data={data} urgenteClass={urgenteClass} />
      <ClienteBlock data={data} />
      <PartsHeaders />
      {STAGES.map((s) => (
        <StageRow key={s} label={s} />
      ))}
      <AstecaBlock supervisor={data.supervisor} />
      <ExpedicaoBlock />
      <div style={{ marginTop: 16, border: "1px dashed #6c757d" }} />
      <RetiradaBlock
        cliente={data.cliente}
        numSolicitacao={data.numSolicitacao}
      />
      <div
        className="div-parts"
        style={{ marginTop: 10, padding: 10, border: B }}
      >
        {pecas.map((p) => (
          <PecaItem key={p.codigo} peca={p} />
        ))}
      </div>

      {/* ── 2ª VIA ── */}
      <div className="ca-page-break" />
      <HeaderImg />
      <HeaderSolicitation data={data} urgenteClass={urgenteClass} />
      <ClienteBlock data={data} />
      <div
        className="div-parts"
        style={{ marginTop: 10, padding: 10, border: B }}
      >
        {pecas.map((p) => (
          <PecaItem key={`2-${p.codigo}`} peca={p} />
        ))}
      </div>
    </div>
  );
}

// ── Page wrapper ─────────────────────────────────────────

export function CapaAssistenciaPage() {
  const params = new URLSearchParams(window.location.search);
  const urlId = params.get("id") ?? "";
  const { user } = useAuth();
  const [data, setData] = useState<AssistData | null>(null);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(!!urlId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!urlId) return;
    Promise.all([fetchAssistData(urlId), fetchPecas(urlId)])
      .then(([d, p]) => {
        setData({ ...d, responsavel: user?.nome ?? d.responsavel });
        setPecas(p);
      })
      .catch(() => setError("Assistência não encontrada."))
      .finally(() => setLoading(false));
  }, [urlId, user?.nome]);

  useEffect(() => {
    if (!data || !urlId) return;
    waitForImages().then(() => {
      if (window.parent !== window) {
        window.parent.postMessage("capa-ready", "*");
      } else {
        window.print();
      }
    });
  }, [data, urlId]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="ca-spinner" />
      </div>
    );

  if (error || (!loading && !data && urlId))
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#c00",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {error || "Assistência não encontrada."}
      </div>
    );

  if (!data) return null;

  return <CapaAssistencia data={data} pecas={pecas} />;
}
