import { Printer, Save, X as Close } from "lucide-react";
import { Modal as ModalBase } from "../../../../components/Modal";
import { IdentificationSection } from "./sections/IdentificationSection";
import { ResponsibleSection } from "./sections/ResponsibleSection";
import { ProductionSection } from "./sections/ProductionSection";
import { OperationalStatusSection } from "./sections/OperationalStatusSection";
import { LogisticsSection } from "./sections/LogisticsSection";
import { NotesSection } from "./sections/NotesSection";
import { useToast } from "../../../../context/ToastContext";
import { TeamTable } from "./sections/TeamTable";
import { ConfirmModal } from "../../../../components/ConfirmModal";
import type { AssistanceProduction } from "../../../../types/assistenciaProducao";
import { fetchAssistanciaDetail, saveAssistencia } from "../../../../services/assistenciaProducao";
import { useState, useEffect, useRef } from "react";
import "./index.css";

interface Props {
  isOpen: boolean;
  id: string;
  onClose: () => void;
  onSaved?: (updated: AssistanceProduction) => void;
  readOnly?: boolean;
  logisticsMode?: boolean;
  producaoMode?: boolean;
}

export function Modal({
  isOpen,
  id,
  onClose,
  onSaved,
  readOnly = false,
  logisticsMode = false,
  producaoMode = false,
}: Props) {
  const toast = useToast();
  const [data, setData] = useState<AssistanceProduction | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [printSrc, setPrintSrc] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoadingDetail(true);
    setData(null);
    fetchAssistanciaDetail(id)
      .then(setData)
      .catch(() => toast.error('Erro ao carregar assistência'))
      .finally(() => setLoadingDetail(false));
  }, [id]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data !== "capa-ready" || !iframeRef.current) return;
      const win = iframeRef.current.contentWindow;
      if (!win) return;
      win.addEventListener("afterprint", () => setPrintSrc(null), { once: true });
      win.print();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function handleChange<K extends keyof AssistanceProduction>(key: K, value: AssistanceProduction[K]) {
    setData((prev) => (prev ? { ...prev, [key]: value } : null));
  }

  function footer() {
    return (
      <div className="ap-modal-actions">
        <button className="ap-btn ap-btn--ghost" onClick={onClose} type="button">
          <Close size={13} />
          Fechar
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="ap-btn ap-btn--secondary"
          onClick={() => setPrintSrc(`/impressao/capa-assistencia?id=${id}`)}
          type="button"
          disabled={!data}
        >
          <Printer size={14} />
          Imprimir
        </button>
        {(!readOnly || logisticsMode) && (
          <button
            className="ap-btn ap-btn--primary"
            onClick={() => setSaveConfirmOpen(true)}
            type="button"
            disabled={!data}
          >
            <Save size={14} />
            Salvar
          </button>
        )}
      </div>
    );
  }

  const title = data
    ? `${data.numSolicitacao} — ${data.cliente} · ${data.ambiente}`
    : id;

  return (
    <>
      <ModalBase title={title} isOpen={isOpen} onClose={onClose} maxWidth={960} footer={footer()}>
        {loadingDetail || !data ? (
          <div className="ap-modal-loading">Carregando...</div>
        ) : (
          <div className="ap-modal-body">
            <IdentificationSection    data={data} onChange={handleChange} readOnly={readOnly || logisticsMode} />
            <ResponsibleSection       data={data} onChange={handleChange} readOnly={readOnly || logisticsMode} readOnlySupervisors={producaoMode} />
            <ProductionSection        data={data} onChange={handleChange} readOnly={readOnly || logisticsMode} />
            <OperationalStatusSection data={data} onChange={handleChange} readOnly={readOnly || logisticsMode} />
            <LogisticsSection         data={data} onChange={handleChange} readOnly={readOnly || logisticsMode} />
            <NotesSection
              data={data}
              onChange={handleChange}
              readOnlyFactory={readOnly || logisticsMode}
              readOnlyLogistics={readOnly || producaoMode}
            />
            <div className="ap-section">
              <h4 className="ap-section__title">Equipe</h4>
              <div className="ap-section__body">
                <TeamTable equipe={data.equipe} />
              </div>
            </div>
          </div>
        )}
      </ModalBase>

      {(!readOnly || logisticsMode) && (
        <ConfirmModal
          isOpen={saveConfirmOpen}
          message="Deseja confirmar as alterações feitas?"
          confirmLabel="Confirmar"
          onConfirm={async () => {
            setSaveConfirmOpen(false);
            if (!data) return;
            try {
              await saveAssistencia(data);
              onSaved?.(data);
              toast.success("Projeto salvo com sucesso!");
            } catch {
              toast.error("Erro ao salvar assistência.");
            }
          }}
          onCancel={() => setSaveConfirmOpen(false)}
        />
      )}

      {printSrc && (
        <iframe
          ref={iframeRef}
          src={printSrc}
          title="impressao-assistencia"
          style={{ position: "fixed", width: 0, height: 0, border: "none", visibility: "hidden" }}
        />
      )}
    </>
  );
}
