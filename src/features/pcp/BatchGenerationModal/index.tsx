import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../../components/Modal";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { PROJECT_TYPE_LABELS } from "../../../data/pcpConfig";
import type { ProductionProject } from "../../../types/pcp";
import "./index.css";

interface Props {
  isOpen: boolean;
  projects: ProductionProject[];
  onClose: () => void;
  onGenerate: (lote: string, ids: number[]) => void;
}

function fmt(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function isPrazoProximo(entrega: string): boolean {
  if (!entrega) return false;
  const hoje = new Date().toISOString().split("T")[0];
  const diff =
    (new Date(entrega).getTime() - new Date(hoje).getTime()) / 86_400_000;
  return diff >= 0 && diff <= 7;
}

export function BatchGenerationModal({
  isOpen,
  projects,
  onClose,
  onGenerate,
}: Props) {
  const [lote, setLote] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const available = useMemo(
    () => projects.filter((p) => p.status === "disponivel"),
    [projects],
  );

  useEffect(() => {
    if (!isOpen) {
      setLote("");
      setSelectedIds(new Set());
      setConfirmOpen(false);
    }
  }, [isOpen]);

  function toggleRow(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(
      selectedIds.size === available.length
        ? new Set()
        : new Set(available.map((p) => p.id)),
    );
  }

  const canGenerate = lote.trim().length > 0 && selectedIds.size > 0;

  function handleConfirm() {
    onGenerate(lote.trim(), Array.from(selectedIds));
    setConfirmOpen(false);
  }

  if (!isOpen) return null;

  const allChecked =
    available.length > 0 && selectedIds.size === available.length;
  const someChecked =
    selectedIds.size > 0 && selectedIds.size < available.length;

  return (
    <>
      <Modal
        title="Gerar Lote de Produção"
        isOpen={isOpen}
        onClose={onClose}
        maxWidth={860}
      >
        <div className="bgen-content">
          <div className="bgen-top">
            <div className="pfield bgen-lote-field">
              <label>Número do Novo Lote</label>
              <input
                type="text"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                placeholder="Ex: 1234"
              />
            </div>
            <div className="bgen-counter">
              <span className="bgen-counter__label">
                projeto{selectedIds.size !== 1 ? "s" : ""} selecionado
                {selectedIds.size !== 1 ? "s" : ""}
              </span>
              <span className="bgen-counter__value">{selectedIds.size}</span>
            </div>
          </div>

          <div className="bgen-table-wrapper">
            {available.length === 0 ? (
              <p className="bgen-empty">
                Nenhum projeto disponível para inclusão em lote.
              </p>
            ) : (
              <table className="bgen-table">
                <thead>
                  <tr>
                    <th className="bgen-th--check">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = someChecked;
                        }}
                        onChange={toggleAll}
                      />
                    </th>
                    <th>N° OC</th>
                    <th>C.C.</th>
                    <th>Cliente</th>
                    <th>Ambiente</th>
                    <th>Tipo</th>
                    <th className="bgen-th--center">Entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {available.map((p) => {
                    const proximo = isPrazoProximo(p.entrega);
                    return (
                      <tr
                        key={p.id}
                        className={`bgen-row${selectedIds.has(p.id) ? " bgen-row--selected" : ""}${p.urgente ? " bgen-row--urgente" : ""}`}
                        onClick={() => toggleRow(p.id)}
                      >
                        <td className="bgen-td--check">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleRow(p.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="bgen-td--oc">{p.numOC}</td>
                        <td className="bgen-td--mono">{p.corteCC}</td>
                        <td className="bgen-td--min">{p.cliente}</td>
                        <td className="bgen-td--min">{p.ambiente}</td>
                        <td className="bgen-td--nowrap">
                          {PROJECT_TYPE_LABELS[p.tipo]}
                        </td>
                        <td className="bgen-td--center">
                          <span
                            className={`bgen-prazo${proximo ? " bgen-prazo--proximo" : ""}`}
                          >
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
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!canGenerate}
              onClick={() => setConfirmOpen(true)}
            >
              Gerar Lote
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        message={`Gerar lote "${lote}" com ${selectedIds.size} projeto${selectedIds.size !== 1 ? "s" : ""}?`}
        confirmLabel="Gerar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
