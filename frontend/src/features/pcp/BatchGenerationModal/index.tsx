import { useReducer, useEffect, useState } from "react";
import { Modal } from "../../../components/Modal";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { fetchLoteAvailable, atualizarLote, fetchLastLote } from "../../../services/pcp";
import { useToast } from "../../../context/ToastContext";
import { exportLoteExcel, fmtEntrega, type LoteExportRow } from "../../../utils/exportExcel";
import type { LoteAvailableProject } from "../../../types/pcp";
import "./index.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (lote: string, ids: number[]) => void;
}

type State = {
  lote: string;
  available: LoteAvailableProject[];
  selectedIds: Set<number>;
  confirmOpen: boolean;
};

type Action =
  | { type: "set_lote"; value: string }
  | { type: "set_available"; value: LoteAvailableProject[] }
  | { type: "toggle_row"; id: number }
  | { type: "toggle_all" }
  | { type: "set_confirm"; value: boolean }
  | { type: "reset" };

const INITIAL: State = { lote: "", available: [], selectedIds: new Set(), confirmOpen: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set_lote":
      return { ...state, lote: action.value };
    case "set_available":
      return { ...state, available: action.value, selectedIds: new Set() };
    case "toggle_row": {
      const next = new Set(state.selectedIds);
      next.has(action.id) ? next.delete(action.id) : next.add(action.id);
      return { ...state, selectedIds: next };
    }
    case "toggle_all":
      return {
        ...state,
        selectedIds:
          state.selectedIds.size === state.available.length
            ? new Set()
            : new Set(state.available.map((p) => p.id)),
      };
    case "set_confirm":
      return { ...state, confirmOpen: action.value };
    case "reset":
      return INITIAL;
  }
}

function fmt(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function isDeadlineNear(entrega: string): boolean {
  if (!entrega) return false;
  const today = new Date().toISOString().split("T")[0];
  const diff = (new Date(entrega).getTime() - new Date(today).getTime()) / 86_400_000;
  return diff >= 0 && diff <= 7;
}

export function BatchGenerationModal({ isOpen, onClose, onGenerate }: Props) {
  const [{ lote, available, selectedIds, confirmOpen }, dispatch] = useReducer(reducer, INITIAL);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      Promise.all([fetchLoteAvailable(), fetchLastLote()]).then(([rows, last]) => {
        dispatch({ type: "set_available", value: rows });
        dispatch({ type: "set_lote", value: String(last + 1) });
      });
    } else {
      dispatch({ type: "reset" });
    }
  }, [isOpen]);

  const canGenerate = lote.trim().length > 0 && selectedIds.size > 0;

  async function handleConfirm() {
    const loteNum = Number(lote.trim());
    setSaving(true);
    try {
      const selected = available.filter((p) => selectedIds.has(p.id));
      await Promise.all(selected.map((p) => atualizarLote(p.id, loteNum)));

      const excelRows: LoteExportRow[] = selected.map((p) => ({
        "C.C.": p.corteCC,
        Pedido: p.pedido,
        Ambiente: p.ambiente,
        Cliente: p.cliente,
        Entrega: fmtEntrega(p.entrega),
        Lote: lote.trim(),
      }));
      await exportLoteExcel(excelRows, lote.trim());

      toast.success(`Lote ${loteNum} gerado com ${selected.length} projeto${selected.length !== 1 ? "s" : ""}.`);
      onGenerate(lote.trim(), Array.from(selectedIds));
      dispatch({ type: "set_confirm", value: false });
    } catch {
      toast.error("Erro ao gerar lote. Tente novamente.");
      dispatch({ type: "set_confirm", value: false });
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  const allChecked = available.length > 0 && selectedIds.size === available.length;
  const someChecked = selectedIds.size > 0 && selectedIds.size < available.length;

  return (
    <>
      <Modal title="Gerar Lote de Produção" isOpen={isOpen} onClose={onClose} maxWidth={860}>
        <div className="bgen-content">
          <div className="bgen-top">
            <div className="pfield bgen-lote-field">
              <label>Número do Novo Lote</label>
              <input
                type="text"
                value={lote}
                onChange={(e) => dispatch({ type: "set_lote", value: e.target.value })}
                placeholder="Ex: 1234"
              />
            </div>
            <div className="bgen-counter">
              <span className="bgen-counter__label">
                projeto{selectedIds.size !== 1 ? "s" : ""} selecionado{selectedIds.size !== 1 ? "s" : ""}
              </span>
              <span className="bgen-counter__value">{selectedIds.size}</span>
            </div>
          </div>

          <div className="bgen-table-wrapper">
            {available.length === 0 ? (
              <p className="bgen-empty">Nenhum projeto disponível para inclusão em lote.</p>
            ) : (
              <table className="bgen-table">
                <thead>
                  <tr>
                    <th className="bgen-th--check">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={(el) => { if (el) el.indeterminate = someChecked; }}
                        onChange={() => dispatch({ type: "toggle_all" })}
                      />
                    </th>
                    <th>N° OC</th>
                    <th>C.C.</th>
                    <th>Cliente</th>
                    <th>Ambiente</th>
                    <th className="bgen-th--center">Entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {available.map((p) => {
                    const isNear = isDeadlineNear(p.entrega);
                    return (
                      <tr
                        key={p.id}
                        className={`bgen-row${selectedIds.has(p.id) ? " bgen-row--selected" : ""}`}
                        onClick={() => dispatch({ type: "toggle_row", id: p.id })}
                      >
                        <td className="bgen-td--check">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => dispatch({ type: "toggle_row", id: p.id })}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="bgen-td--oc">{p.numOC}</td>
                        <td className="bgen-td--mono">{p.corteCC}</td>
                        <td className="bgen-td--min">{p.cliente}</td>
                        <td className="bgen-td--min">{p.ambiente}</td>
                        <td className="bgen-td--center">
                          <span className={`bgen-prazo${isNear ? " bgen-prazo--proximo" : ""}`}>
                            {fmt(p.entrega)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="bgen-footer">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!canGenerate}
              onClick={() => dispatch({ type: "set_confirm", value: true })}
            >
              Gerar Lote
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        message={`Gerar lote "${lote}" com ${selectedIds.size} projeto${selectedIds.size !== 1 ? "s" : ""}?`}
        confirmLabel={saving ? "Gerando…" : "Gerar"}
        cancelLabel="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => { if (!saving) dispatch({ type: "set_confirm", value: false }); }}
      />
    </>
  );
}
