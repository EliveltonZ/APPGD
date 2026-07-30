import { useState, useEffect } from "react";
import "./CapaImpressao.css";
import logo from "../../../assets/gd-color.png";
import { waitForImages } from "../shared/waitForImages";
import { fmtDate } from "../../../utils/dateUtils";
import { useAuth } from "../../../context/AuthContext";
import { fetchCapaData } from "../capaData";
import type { CapaData } from "../capaData";

import { HeaderCapa }           from "./HeaderCapa";
import { IdentificacaoSection } from "./IdentificacaoSection";
import { ExpedicaoSection }     from "./ExpedicaoSection";
import { AcessoriosLancados }   from "./AcessoriosLancados";
import { ChapasFitas }          from "./ChapasFitas";
import { AcessoriosAvulsos }    from "./AcessoriosAvulsos";
import { PendenciasGrande }     from "./PendenciasGrande";
import {
  InfoContrato,
  CoresObservacoes,
  InfoProducao,
  EtapasSection,
  PendenciasSection,
} from "../shared";

// ── Componente de impressão ──────────────────────────────

export function CapaImpressao({ data = {} }: { data?: CapaData }) {
  return (
    <div className="capa-wrapper" id="impressao">
      <HeaderCapa />
      <IdentificacaoSection data={data} />
      <InfoContrato data={data} />
      <CoresObservacoes />
      <InfoProducao data={data} />
      <EtapasSection etapas={data.etapas} />
      <PendenciasSection />
      <ExpedicaoSection />
      <AcessoriosLancados acessorios={data.acessorios} />
      <ChapasFitas />
      <AcessoriosAvulsos />
      <PendenciasGrande />
    </div>
  );
}

// ── Page wrapper ─────────────────────────────────────────

export function CapaImpressaoPage() {
  const params  = new URLSearchParams(window.location.search);
  const urlId   = params.get("id") ?? "";
  const urlTipo = params.get("tipo") ?? "";
  const preview = params.get("preview") === "1";
  const { user } = useAuth();

  const [oc, setOc] = useState("");
  const [data, setData] = useState<CapaData | null>(null);
  const [loading, setLoading] = useState(!!urlId);
  const [error, setError] = useState("");

  function withUserInfo(d: CapaData): CapaData {
    const nome = user?.nome
      ? user.nome.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
      : "";
    const hoje = fmtDate(new Date().toISOString().split("T")[0]);
    return { ...d, responsavel: nome, data: hoje, ...(urlTipo ? { tipo: urlTipo } : {}) };
  }

  useEffect(() => {
    if (!urlId) return;
    fetchCapaData(Number(urlId))
      .then((d) => setData(withUserInfo(d)))
      .catch(() => setError("Projeto não encontrado."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId]);

  useEffect(() => {
    if (!data || !urlId || preview) return;
    waitForImages().then(() => {
      if (window.parent !== window) {
        window.parent.postMessage("capa-ready", "*");
      } else {
        window.print();
      }
    });
  }, [data, urlId, preview]);

  async function handleBuscar() {
    const id = oc.trim();
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const result = await fetchCapaData(Number(id));
      setData(withUserInfo(result));
    } catch {
      setError("Projeto não encontrado ou erro ao buscar.");
    } finally {
      setLoading(false);
    }
  }

  if (urlId) {
    if (loading) return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="cp-spinner" />
      </div>
    );
    if (error) return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#c00", fontFamily: "Arial, sans-serif" }}>
        {error}
      </div>
    );
    return (
      <>
        <div className="capa-toolbar no-print">
          <button className="capa-toolbar__btn" onClick={() => window.print()}>Imprimir</button>
          <button className="capa-toolbar__btn capa-toolbar__btn--ghost" onClick={() => window.history.back()}>Voltar</button>
        </div>
        <CapaImpressao data={data ?? {}} />
      </>
    );
  }

  if (!data) {
    return (
      <div className="capa-overlay">
        <div className="capa-modal">
          <img src={logo} alt="GD" className="capa-modal__logo" />
          <h2 className="capa-modal__title">Controle de Produção</h2>
          <p className="capa-modal__sub">Informe o número da Ordem de Compra</p>
          <input
            className="capa-modal__input"
            type="number"
            min={1}
            value={oc}
            onChange={(e) => { setOc(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
            placeholder="N° O.C."
            autoFocus
          />
          {error && <p className="capa-modal__error">{error}</p>}
          <button className="capa-modal__btn" onClick={handleBuscar} disabled={loading || !oc.trim()}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="capa-toolbar no-print">
        <button className="capa-toolbar__btn" onClick={() => window.print()}>Imprimir</button>
        <button className="capa-toolbar__btn capa-toolbar__btn--ghost" onClick={() => setData(null)}>Nova Busca</button>
      </div>
      <CapaImpressao data={data} />
    </>
  );
}
