import { useState, useEffect } from "react";
import "../Producao/CapaImpressao.css";
import { waitForImages } from "../shared/waitForImages";
import { fmtDate } from "../../../utils/dateUtils";
import { useAuth } from "../../../context/AuthContext";
import { fetchCapaData } from "../capaData";
import type { CapaData } from "../capaData";

import { HeaderCapa }           from "./HeaderCapa";
import { IdentificacaoSection } from "./IdentificacaoSection";
import { ExpedicaoSection }     from "./ExpedicaoSection";
import {
  InfoContrato,
  CoresObservacoes,
  InfoProducao,
  EtapasSection,
  PendenciasSection,
} from "../shared";

// ── Componente de impressão ──────────────────────────────

export function CapaPendencias({ data = {} }: { data?: CapaData }) {
  return (
    <div className="capa-wrapper" id="impressao">
      <HeaderCapa />
      <IdentificacaoSection data={data} />
      <InfoContrato data={data} />
      <CoresObservacoes />
      <InfoProducao data={data} />
      <EtapasSection etapas={data.etapas} filled />
      <PendenciasSection />
      <ExpedicaoSection data={data} />
    </div>
  );
}

// ── Page wrapper ─────────────────────────────────────────

export function CapaPendenciasPage() {
  const params = new URLSearchParams(window.location.search);
  const urlId = params.get("id") ?? "";
  const preview = params.get("preview") === "1";
  const { user } = useAuth();

  const [data, setData] = useState<CapaData | null>(null);
  const [loading, setLoading] = useState(!!urlId);
  const [error, setError] = useState("");

  function withUserInfo(d: CapaData): CapaData {
    const nome = user?.nome
      ? user.nome.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
      : "";
    const hoje = fmtDate(new Date().toISOString().split("T")[0]);
    return { ...d, responsavel: nome, data: hoje };
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
        <CapaPendencias data={data ?? {}} />
      </>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#888", fontFamily: "Arial, sans-serif" }}>
      Nenhuma O.C. informada.
    </div>
  );
}
