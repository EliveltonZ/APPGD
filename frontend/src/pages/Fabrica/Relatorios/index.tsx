import { useState, useRef, useEffect } from "react";
import { FileText, Search } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import {
  fetchCapaRelatorio,
  saveTipoUrgente,
} from "../../../services/production";
import "./index.css";

interface ReportCard {
  icon: React.ReactNode;
  title: string;
  src: (oc: string, tipo: string, volumes: number) => string;
}

const TIPO_OPTIONS = [
  { value: "PROMOB", label: "PROMOB" },
  { value: "PLANO DE CORTE", label: "PLANO DE CORTE" },
  { value: "PROMOB/PLANO", label: "PROMOB/PLANO" },
];

const REPORTS: ReportCard[] = [
  {
    icon: <FileText size={22} />,
    title: "Controle de Produção",
    src: (oc, tipo) =>
      `/impressao/capa?id=${oc}&tipo=${encodeURIComponent(tipo)}`,
  },
  {
    icon: <FileText size={22} />,
    title: "Entregue c/ Pendências",
    src: (oc, tipo) =>
      `/impressao/capa-pendencias?id=${oc}&tipo=${encodeURIComponent(tipo)}`,
  },
  {
    icon: <FileText size={22} />,
    title: "Verificação Volumétrica",
    src: (oc, _tipo, volumes) =>
      `/impressao/capa-verificacao?id=${oc}&volumes=${volumes}`,
  },
];

export function RelatoriosPcpPage() {
  const [oc, setOc] = useState("");
  const [tipo, setTipo] = useState("");
  const [urgente, setUrgente] = useState(false);
  const [tipoError, setTipoError] = useState(false);
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<boolean | null>(null);
  const [ocVolumes, setOcVolumes] = useState(0);
  const [printSrc, setPrintSrc] = useState<string | null>(null);
  const [printLoading, setPrintLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data !== "capa-ready" || !iframeRef.current) return;
      const win = iframeRef.current.contentWindow;
      if (!win) return;
      setPrintLoading(false);
      win.addEventListener("afterprint", () => setPrintSrc(null), {
        once: true,
      });
      win.print();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function handleSubmit() {
    const id = oc.trim();
    if (!id) return;
    setSearching(true);
    setFound(null);
    setOcVolumes(0);
    try {
      const result = await fetchCapaRelatorio(Number(id));
      setFound(result.found);
      setOcVolumes(result.totalvolumes);
      if (result.found) {
        setTipo(result.tipo);
        setUrgente(result.urgente);
      }
    } catch {
      setFound(false);
    } finally {
      setSearching(false);
    }
  }

  async function handleTipoChange(value: string) {
    setTipo(value);
    setTipoError(false);
    if (found && oc.trim())
      await saveTipoUrgente(oc.trim(), value, urgente).catch(() => {});
  }

  async function handleUrgenteChange(value: boolean) {
    setUrgente(value);
    if (found && oc.trim())
      await saveTipoUrgente(oc.trim(), tipo, value).catch(() => {});
  }

  function handleReport(report: ReportCard) {
    if (report.title === "Controle de Produção" && !tipo) {
      setTipoError(true);
      return;
    }
    setTipoError(false);
    setPrintSrc(report.src(oc.trim(), tipo, ocVolumes));
    setPrintLoading(true);
  }

  const isPrinting = printSrc !== null;

  return (
    <AppLayout pageTitle="Relatórios">
      <div className="rel-page">
        {/* ── Card principal ── */}
        <div className="rel-card">
          <h2 className="rel-card__title">Relatórios de Produção</h2>

          {/* Busca */}
          <div className="rel-field">
            <label className="rel-label">Ordem de Compra</label>
            <div className="rel-row">
              <input
                className="rel-input"
                type="number"
                min={1}
                placeholder="N° O.C."
                value={oc}
                onChange={(e) => {
                  setOc(e.target.value);
                  setFound(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoFocus
              />
              <button
                className="rel-btn rel-btn--primary"
                onClick={handleSubmit}
                disabled={!oc.trim() || searching}
              >
                <Search size={14} />
                {searching ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>

          {/* Tipo + Urgente — só aparecem após encontrar */}
          {found === true && (
            <>
              <div className="rel-divider" />

              <div className="rel-controls">
                <div className="rel-field">
                  <label className="rel-label">
                    Tipo do Projeto
                    {tipoError && (
                      <span className="rel-error-hint"> — obrigatório</span>
                    )}
                  </label>
                  <select
                    className={`rel-select${tipoError ? " rel-select--error" : ""}`}
                    value={tipo}
                    onChange={(e) => handleTipoChange(e.target.value)}
                  >
                    <option value="">Selecionar tipo...</option>
                    {TIPO_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rel-field rel-field--urgente">
                  <label className="rel-label">Urgente</label>
                  <label className="rel-checkbox">
                    <input
                      type="checkbox"
                      checked={urgente}
                      onChange={(e) => handleUrgenteChange(e.target.checked)}
                    />
                    <span>Marcar como urgente</span>
                  </label>
                </div>
              </div>

              <div className="rel-divider" />

              {/* Cards de relatório */}
              <p className="rel-oc-label">
                O.C. <strong>{oc.trim()}</strong> — selecione o relatório para
                imprimir
              </p>
              <div className="rel-grid">
                {REPORTS.map((r) => (
                  <button
                    key={r.title}
                    className={`rel-report-card${isPrinting ? " rel-report-card--loading" : ""}`}
                    onClick={() => handleReport(r)}
                    disabled={isPrinting}
                  >
                    <span className="rel-report-card__icon">{r.icon}</span>
                    <span className="rel-report-card__title">
                      {printLoading ? "Carregando..." : r.title}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {found === false && (
            <p className="rel-not-found">
              Ordem de Compra <strong>{oc.trim()}</strong> não encontrada.
            </p>
          )}
        </div>
      </div>

      {printSrc && (
        <iframe
          ref={iframeRef}
          src={printSrc}
          title="impressao"
          style={{
            position: "fixed",
            top: "-9999px",
            left: "-9999px",
            width: "210mm",
            height: "297mm",
            border: "none",
          }}
        />
      )}
    </AppLayout>
  );
}
