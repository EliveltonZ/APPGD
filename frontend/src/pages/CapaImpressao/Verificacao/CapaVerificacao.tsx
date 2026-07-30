import { useState, useEffect } from "react";
import logo from "../../../assets/gd-color.png";
import { waitForImages } from "../shared/waitForImages";
import { fetchCapaData } from "../capaData";
import type { CapaData } from "../capaData";
import "../Producao/CapaImpressao.css";
import "./CapaVerificacao.css";

import { HeaderCapa } from "./HeaderCapa";
import { IdentificacaoSection } from "./IdentificacaoSection";
import { VolumeCheckboxes } from "./VolumeCheckboxes";
import { PrintFooter } from "./PrintFooter";
import { InfoContrato } from "../shared";

// ── Page component ───────────────────────────────────────

export function CapaVerificacaoPage() {
  const params = new URLSearchParams(window.location.search);
  const urlOc = Number(params.get("id") ?? 0);
  const urlVolumes = Math.max(0, Number(params.get("volumes") ?? 0));

  const [data, setData] = useState<CapaData | null>(null);
  const [loading, setLoading] = useState(!!urlOc);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!urlOc) return;
    fetchCapaData(urlOc)
      .then((d) => setData(d))
      .catch(() => setError("O.C. não encontrada."))
      .finally(() => setLoading(false));
  }, [urlOc]);

  useEffect(() => {
    if (!data || !urlOc) return;
    waitForImages().then(() => {
      if (window.parent !== window) {
        window.parent.postMessage("capa-ready", "*");
      } else {
        window.print();
      }
    });
  }, [data, urlOc]);

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
        <div className="cp-spinner" />
      </div>
    );

  if (error || (!loading && !data && urlOc))
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
        {error || "O.C. não encontrada."}
      </div>
    );

  if (!data) {
    return (
      <div className="capa-overlay">
        <div className="capa-modal">
          <img src={logo} alt="GD" className="capa-modal__logo" />
          <h2 className="capa-modal__title">Verificação Volumétrica</h2>
          <p className="capa-modal__sub">Informe o número da O.C.</p>
          <input
            className="capa-modal__input"
            placeholder="N° O.C."
            autoFocus
          />
        </div>
      </div>
    );
  }

  const volumeCount =
    urlVolumes > 0 ? urlVolumes : Number(data.totalVolumes ?? 0);

  return (
    <>
      <div className="capa-toolbar no-print">
        <button className="capa-toolbar__btn" onClick={() => window.print()}>
          Imprimir
        </button>
        <button
          className="capa-toolbar__btn capa-toolbar__btn--ghost"
          onClick={() => window.history.back()}
        >
          Voltar
        </button>
      </div>
      <div className="capa-wrapper" id="impressao">
        <HeaderCapa />
        <IdentificacaoSection data={data} />
        <InfoContrato data={data} />
        {volumeCount > 0 && (
          <div style={{ marginTop: 8 }}>
            <div className="cp-title cp-bg-green cp-cell">VOLUMES</div>
            <VolumeCheckboxes total={volumeCount} />
          </div>
        )}
        <PrintFooter data={data} />
      </div>
    </>
  );
}
