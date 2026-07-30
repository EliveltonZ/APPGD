import { useState, useEffect } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { Modal } from "../../../../components/Modal";
import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { SelectedPartsTable } from "../SelectedPartsTable";
import type {
  ServicePart,
  PartFormData,
  PartSide,
} from "../../../../types/assistencia";
import { PART_SIDE_OPTIONS } from "../../../../data/assistenciaConfig";
import {
  fetchFalhasConfig,
  fetchOcorrenciasConfig,
} from "../../../../services/assistencia";
import "./index.css";

// ── Helpers ──────────────────────────────────────────────

const EMPTY_FORM: PartFormData = {
  qtd: "1",
  peca: "",
  dimensoes: "",
  cor: "",
  lado: "",
  falha: "",
  tipo: "",
  observacoes: "",
};

interface PartErrors {
  qtd?: string;
  peca?: string;
  falha?: string;
}

// ── Component ────────────────────────────────────────────

interface PartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pecas: ServicePart[];
  onAdd: (part: ServicePart) => void;
  onRemove: (id: string) => void;
}

export function PartsModal({
  isOpen,
  onClose,
  pecas,
  onAdd,
  onRemove,
}: PartsModalProps) {
  const [form, setForm] = useState<PartFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<PartErrors>({});
  const [falhaOptions, setFalhaOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [ocorrenciaOptions, setOcorrenciaOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    fetchFalhasConfig()
      .then((items) =>
        setFalhaOptions(
          items.map((f) => ({ value: String(f.id), label: f.label })),
        ),
      )
      .catch(() => {});
    fetchOcorrenciasConfig()
      .then((items) =>
        setOcorrenciaOptions(
          items.map((o) => ({ value: String(o.id), label: o.label })),
        ),
      )
      .catch(() => {});
  }, []);

  function set<K extends keyof PartFormData>(key: K, value: PartFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: PartErrors = {};
    if (!form.qtd || Number(form.qtd) < 1) errs.qtd = "Informe a quantidade";
    if (!form.peca.trim()) errs.peca = "Informe o nome da peça";
    if (!form.falha) errs.falha = "Selecione o tipo de falha";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleInsert() {
    if (!validate()) return;
    const falhaOpt = falhaOptions.find((o) => o.value === form.falha);
    const ocorrenciaOpt = ocorrenciaOptions.find((o) => o.value === form.tipo);
    onAdd({
      id: crypto.randomUUID(),
      qtd: Math.max(1, Number(form.qtd)),
      peca: form.peca.trim(),
      dimensoes: form.dimensoes.trim(),
      cor: form.cor.trim(),
      lado: form.lado,
      falha: falhaOpt?.label ?? form.falha, // text label for display
      falhaId: Number(form.falha), // numeric ID for DB
      tipo: ocorrenciaOpt?.label ?? form.tipo, // text label for display
      ocorrenciaId: Number(form.tipo), // numeric ID for DB
      observacoes: form.observacoes.trim(),
    });
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function handleClear() {
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  }

  return (
    <Modal
      title={`Peças para Assistência${pecas.length ? ` (${pecas.length})` : ""}`}
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth={860}
    >
      {/* ── Peças já inseridas ── */}
      {pecas.length > 0 && (
        <div className="pm-existing">
          <SelectedPartsTable pecas={pecas} onRemove={onRemove} />
        </div>
      )}

      {/* ── Formulário nova peça ── */}
      <div className="pm-form">
        <h4 className="pm-form__title">Nova Peça</h4>

        <div className="frow--4">
          <Input
            label="Quantidade *"
            type="number"
            min="1"
            value={form.qtd}
            onChange={(e) => set("qtd", e.target.value)}
            error={errors.qtd}
            style={{ width: "100%" }}
          />
          <Input
            label="Peça *"
            value={form.peca}
            onChange={(e) => set("peca", e.target.value)}
            error={errors.peca}
            placeholder="Descrição da peça"
            className="fcol--span3"
          />
        </div>

        <div className="frow--3">
          <Input
            label="Dimensões"
            value={form.dimensoes}
            onChange={(e) => set("dimensoes", e.target.value)}
            placeholder="Ex: 600x800"
          />
          <Input
            label="Cor"
            value={form.cor}
            onChange={(e) => set("cor", e.target.value)}
            placeholder="Ex: Branco TX"
          />
          <Select
            label="Lado"
            value={form.lado}
            onChange={(e) => set("lado", e.target.value as PartSide | "")}
            options={PART_SIDE_OPTIONS}
            placeholder="Selecionar..."
          />
        </div>

        <div className="frow--2">
          <Select
            label="Falha *"
            value={form.falha}
            onChange={(e) => set("falha", e.target.value)}
            options={falhaOptions}
            error={errors.falha}
            placeholder="Selecionar tipo de falha..."
          />
          <Select
            label="Ocorrência"
            value={form.tipo}
            onChange={(e) => set("tipo", e.target.value)}
            options={ocorrenciaOptions}
            placeholder="Selecionar..."
          />
        </div>

        <Input
          label="Observações"
          value={form.observacoes}
          onChange={(e) => set("observacoes", e.target.value)}
          placeholder="Observações adicionais sobre a peça..."
        />

        <div className="as-modal-actions pm-form__actions">
          <button
            className="as-btn as-btn--ghost"
            onClick={handleClear}
            type="button"
          >
            <RotateCcw size={13} />
            Limpar
          </button>
          <div style={{ flex: 1 }} />
          <button
            className="as-btn as-btn--secondary"
            onClick={handleClose}
            type="button"
          >
            Fechar
          </button>
          <button
            className="as-btn as-btn--primary"
            onClick={handleInsert}
            type="button"
          >
            <Plus size={14} />
            Inserir Peça
          </button>
        </div>
      </div>
    </Modal>
  );
}
