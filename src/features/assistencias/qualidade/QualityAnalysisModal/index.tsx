import { Save, X as Close } from "lucide-react";
import { Modal } from "../../../../components/Modal";
import { ClientSection } from "./sections/ClientSection";
import { ItemDataSection } from "./sections/ItemDataSection";
import { ClassificationSection } from "./sections/ClassificationSection";
import { ObservationsSection } from "./sections/ObservationsSection";
import { RootCauseSection } from "./sections/RootCauseSection";
import type { QualityItem } from "../../../../types/qualityControl";
import "./index.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: QualityItem;
  onChange: <K extends keyof QualityItem>(
    key: K,
    value: QualityItem[K],
  ) => void;
  onSave: () => void;
}

export function QualityAnalysisModal({
  isOpen,
  onClose,
  data,
  onChange,
  onSave,
}: Props) {
  return (
    <Modal
      title={`${data.codigo} — ${data.peca}`}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={820}
    >
      <div className="qc-modal-body">
        <ClientSection data={data} />
        <ItemDataSection data={data} />
        <ClassificationSection data={data} onChange={onChange} />
        <ObservationsSection data={data} />
        <RootCauseSection data={data} onChange={onChange} />
      </div>

      <div className="qc-modal-actions">
        <button
          className="qc-btn qc-btn--ghost"
          onClick={onClose}
          type="button"
        >
          <Close size={13} />
          Fechar
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="qc-btn qc-btn--primary"
          onClick={onSave}
          type="button"
        >
          <Save size={14} />
          Salvar Análise
        </button>
      </div>
    </Modal>
  );
}
