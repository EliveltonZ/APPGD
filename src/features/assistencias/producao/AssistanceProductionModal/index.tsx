import { Printer, Save, X as Close } from "lucide-react";
import { Modal } from "../../../../components/Modal";
import { IdentificationSection } from "./sections/IdentificationSection";
import { ResponsibleSection } from "./sections/ResponsibleSection";
import { ProductionSection } from "./sections/ProductionSection";
import { OperationalStatusSection } from "./sections/OperationalStatusSection";
import { LogisticsSection } from "./sections/LogisticsSection";
import { NotesSection } from "./sections/NotesSection";
import { useToast } from "../../../../context/ToastContext";
import { AssistanceTeamTable } from "./sections/TeamTable";
import { ConfirmModal } from "../../../../components/ConfirmModal";
import type { AssistanceProduction } from "../../../../types/assistenciaProducao";
import { useState } from "react";
import "./index.css";

interface AssistanceProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AssistanceProduction;
  onChange: <K extends keyof AssistanceProduction>(
    key: K,
    value: AssistanceProduction[K],
  ) => void;
  onSave: () => void;
}

export function AssistanceProductionModal({
  isOpen,
  onClose,
  data,
  onChange,
  onSave,
}: AssistanceProductionModalProps) {
  const toast = useToast();
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [form, setForm] = useState<null>(null);

  function handlePrint() {
    console.log("[AssistanceProductionModal] Imprimir:", data.numSolicitacao);
    window.print();
  }

  function handleSave() {
    toast.success("Projeto salvo com sucesso !!");
  }

  return (
    <>
      <Modal
        title={`${data.numSolicitacao} — ${data.cliente} · ${data.ambiente}`}
        isOpen={isOpen}
        onClose={onClose}
        maxWidth={960}
      >
        <div className="ap-modal-body">
          <IdentificationSection data={data} onChange={onChange} />
          <ResponsibleSection data={data} onChange={onChange} />
          <ProductionSection data={data} onChange={onChange} />
          <OperationalStatusSection data={data} onChange={onChange} />
          <LogisticsSection data={data} onChange={onChange} />
          <NotesSection data={data} onChange={onChange} />

          <div className="ap-section">
            <h4 className="ap-section__title">Equipe</h4>
            <div className="ap-section__body">
              <AssistanceTeamTable equipe={data.equipe} />
            </div>
          </div>
        </div>

        <div className="ap-modal-actions">
          <button
            className="ap-btn ap-btn--ghost"
            onClick={onClose}
            type="button"
          >
            <Close size={13} />
            Fechar
          </button>
          <div style={{ flex: 1 }} />
          <button
            className="ap-btn ap-btn--secondary"
            onClick={handlePrint}
            type="button"
          >
            <Printer size={14} />
            Imprimir
          </button>
          <button
            className="ap-btn ap-btn--primary"
            onClick={() => setSaveConfirmOpen(true)}
            type="button"
          >
            <Save size={14} />
            Salvar
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={saveConfirmOpen}
        message="Deseja confirmar as alterações feitas?"
        confirmLabel="Confirmar"
        onConfirm={() => {
          // chamar funcao backend para salvar dados aqui !!!
          if (form) onSave();
          setSaveConfirmOpen(false);
          toast.success("Projeto Salvo com Sucesso !!");
        }}
        onCancel={() => setSaveConfirmOpen(false)}
      />
    </>
  );
}
