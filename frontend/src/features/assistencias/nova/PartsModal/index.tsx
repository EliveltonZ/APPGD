import { useState, useEffect, useRef } from "react";
import { Plus, RotateCcw, Upload } from "lucide-react";
import { Modal } from "../../../../components/Modal";
import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { Button } from "../../../../components/Button";
import { SelectedPartsTable } from "../SelectedPartsTable";
import { ImportPreviewTable } from "./ImportPreviewTable";
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
import { analisarXmlLogisticaTemp } from "../../../../services/xmlLogisticaAnaliseTemp";
import type { ItemAnaliseXmlLogistica } from "../../../../services/xmlLogisticaAnaliseTemp";
import { filtrarMontagemFabrica, agruparESomar, dimensaoTexto } from "../../../../utils/xmlListingAnalise";
import { useToast } from "../../../../context/ToastContext";
import { getErrorMessage } from "../../../../utils/errorMessage";
import "./index.css";

// ── Helpers ──────────────────────────────────────────────

const EMPTY_FORM: PartFormData = {
  qtd: "",
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
  tipo?: string;
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
  const toast = useToast();
  const [form, setForm] = useState<PartFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<PartErrors>({});
  const [falhaOptions, setFalhaOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [ocorrenciaOptions, setOcorrenciaOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // ── Importação de XML (Promob "LISTING") ──────────────────
  const [previewItens, setPreviewItens] = useState<ItemAnaliseXmlLogistica[]>([]);
  const [importFalha, setImportFalha] = useState("");
  const [importTipo, setImportTipo] = useState("");
  const [importing, setImporting] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFalhasConfig()
      .then((items) =>
        setFalhaOptions(
          items.map((f) => ({ value: String(f.id), label: `${f.id} - ${f.label}` })),
        ),
      )
      .catch(() => {
        toast.error("Erro ao carregar tipos de falha.");
      });
    fetchOcorrenciasConfig()
      .then((items) =>
        setOcorrenciaOptions(
          items.map((o) => ({ value: String(o.id), label: o.label })),
        ),
      )
      .catch(() => {
        toast.error("Erro ao carregar ocorrências.");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof PartFormData>(key: K, value: PartFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: PartErrors = {};
    const qtdTrim = form.qtd.trim();
    if (!qtdTrim) errs.qtd = "Informe a quantidade";
    else if (!/^\d+$/.test(qtdTrim) || Number(qtdTrim) < 1)
      errs.qtd = "Quantidade deve ser um número inteiro maior que zero";
    if (!form.peca.trim()) errs.peca = "Informe o nome da peça";
    if (!form.falha) errs.falha = "Selecione o tipo de falha";
    if (!form.tipo) errs.tipo = "Selecione a ocorrência";
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
    setPreviewItens([]);
    setImportFileName("");
    onClose();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportFileName(file.name);
    setImporting(true);
    try {
      const xml = await file.text();
      const resultado = await analisarXmlLogisticaTemp(xml);
      const filtrados = filtrarMontagemFabrica(resultado.itens);
      setPreviewItens(agruparESomar(filtrados));
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao processar o XML."));
      setPreviewItens([]);
    } finally {
      setImporting(false);
    }
  }

  function removePreviewItem(index: number) {
    setPreviewItens((prev) => prev.filter((_, i) => i !== index));
  }

  function handleConfirmImport() {
    if (!importFalha || !importTipo || previewItens.length === 0) return;
    const falhaOpt = falhaOptions.find((o) => o.value === importFalha);
    const ocorrenciaOpt = ocorrenciaOptions.find((o) => o.value === importTipo);
    for (const item of previewItens) {
      onAdd({
        id: crypto.randomUUID(),
        qtd: Math.max(1, Math.round(item.quantidade ?? 1)),
        peca: item.descricao ?? "",
        dimensoes: dimensaoTexto(item),
        cor: "",
        lado: "",
        falha: falhaOpt?.label ?? importFalha,
        falhaId: Number(importFalha),
        tipo: ocorrenciaOpt?.label ?? importTipo,
        ocorrenciaId: Number(importTipo),
        observacoes: "",
      });
    }
    toast.success(`${previewItens.length} peça${previewItens.length !== 1 ? "s" : ""} importada${previewItens.length !== 1 ? "s" : ""} do XML.`);
    setPreviewItens([]);
    setImportFileName("");
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

      {/* ── Importar peças de XML (Promob "LISTING") ── */}
      <div className="pm-import">
        <h4 className="pm-form__title">Importar do XML (Promob)</h4>

        <div className="frow--3">
          <Select
            label="Falha * (aplicada a tudo que for importado)"
            value={importFalha}
            onChange={(e) => setImportFalha(e.target.value)}
            options={falhaOptions}
            placeholder="Selecionar tipo de falha..."
          />
          <Select
            label="Ocorrência *"
            value={importTipo}
            onChange={(e) => setImportTipo(e.target.value)}
            options={ocorrenciaOptions}
            placeholder="Selecionar..."
          />
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <Button
              variant="secondary"
              onClick={() => importFileRef.current?.click()}
              disabled={importing}
              type="button"
              style={{ width: "100%" }}
            >
              <Upload size={14} />
              {importing ? "Processando..." : "Escolher XML"}
            </Button>
            <input
              ref={importFileRef}
              type="file"
              accept=".xml"
              onChange={handleImportFile}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {importFileName && (
          <p className="pm-import__filename">
            {importFileName} — {previewItens.length} item{previewItens.length !== 1 ? "s" : ""} pra revisar
            (só peças de Montagem e Fábrica)
          </p>
        )}

        {previewItens.length > 0 && (
          <>
            <ImportPreviewTable itens={previewItens} onRemove={removePreviewItem} />
            <div className="as-modal-actions pm-form__actions">
              <button
                className="as-btn as-btn--ghost"
                onClick={() => { setPreviewItens([]); setImportFileName(""); }}
                type="button"
              >
                Descartar importação
              </button>
              <div style={{ flex: 1 }} />
              <button
                className="as-btn as-btn--primary"
                onClick={handleConfirmImport}
                disabled={!importFalha || !importTipo}
                type="button"
              >
                <Plus size={14} />
                Confirmar {previewItens.length} peça{previewItens.length !== 1 ? "s" : ""}
              </button>
            </div>
          </>
        )}
      </div>

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
            label="Ocorrência *"
            value={form.tipo}
            onChange={(e) => set("tipo", e.target.value)}
            options={ocorrenciaOptions}
            error={errors.tipo}
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
