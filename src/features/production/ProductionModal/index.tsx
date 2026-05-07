import { useState, useEffect } from "react";
import { Users, Save } from "lucide-react";
import { Modal } from "../../../components/Modal";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { ProductionSector } from "../ProductionSector";
import { MaterialsTable } from "../MaterialsTable";
import { EmployeesModal } from "../EmployeesModal";
import { useToast } from "../../../context/ToastContext";
import {
  PRODUCTION_SECTORS,
  emptySetores,
} from "../../../data/productionConfig";
import type {
  ProductionDetail,
  SectorData,
  Employee,
} from "../../../types/production";
import "./index.css";

interface ProductionModalProps {
  isOpen: boolean;
  detail: ProductionDetail | null;
  employees: Employee[];
  onClose: () => void;
  onSave: (detail: ProductionDetail) => void;
}

export function ProductionModal({
  isOpen,
  detail,
  employees,
  onClose,
  onSave,
}: ProductionModalProps) {
  const [form, setForm] = useState<ProductionDetail | null>(null);
  const [empOpen, setEmpOpen] = useState(false);
  const [pickingSector, setPickingSector] = useState<string | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && detail) {
      setForm({
        ...detail,
        setores: { ...emptySetores(), ...detail.setores },
      });
    }
  }, [isOpen, detail]);

  function updateField<K extends keyof ProductionDetail>(
    field: K,
    value: ProductionDetail[K],
  ) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function updateSector(
    sectorId: string,
    field: keyof SectorData,
    value: string | boolean,
  ) {
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        setores: {
          ...prev.setores,
          [sectorId]: { ...prev.setores[sectorId], [field]: value },
        },
      };
    });
  }

  function handlePickEmployee(sectorId: string) {
    setPickingSector(sectorId);
    setEmpOpen(true);
  }

  function handleSelectEmployee(emp: Employee) {
    if (pickingSector) {
      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          setores: {
            ...prev.setores,
            [pickingSector]: {
              ...prev.setores[pickingSector],
              responsavelId: emp.id,
              responsavelNome: emp.nome,
            },
          },
        };
      });
    }
    setPickingSector(null);
    setEmpOpen(false);
  }

  function handleCloseEmp() {
    setEmpOpen(false);
    setPickingSector(null);
  }

  return (
    <>
      <Modal
        title="Informações de Produção"
        isOpen={isOpen}
        onClose={onClose}
        maxWidth={960}
      >
        {form && (
          <div className="prod-modal">
            {/* ── Project Info ───────────────────────────── */}
            <section className="prod-modal__section">
              <h3 className="prod-modal__section-title">
                Informações do Projeto
              </h3>
              <div className="prod-modal__info-grid">
                <div className="pfield">
                  <label>Ordem de Compra</label>
                  <input type="text" value={form.ordemCompra} disabled />
                </div>
                <div className="pfield">
                  <label>Contrato</label>
                  <input type="text" value={form.contrato} disabled />
                </div>
                <div className="pfield pfield--span2">
                  <label>Cliente</label>
                  <input type="text" value={form.cliente} disabled />
                </div>
                <div className="pfield pfield--span2">
                  <label>Ambiente</label>
                  <input type="text" value={form.ambiente} disabled />
                </div>
                <div className="pfield">
                  <label>N° Projeto</label>
                  <input type="text" value={form.numeroProjeto} disabled />
                </div>
                <div className="pfield">
                  <label>Lote</label>
                  <input type="text" value={form.lote} disabled />
                </div>
                <div className="pfield">
                  <label>Chegou Fábrica</label>
                  <input type="date" value={form.chegouFabrica} disabled />
                </div>
                <div className="pfield">
                  <label>Prazo</label>
                  <input type="date" value={form.prazo} disabled />
                </div>
                <div className="pfield">
                  <label>Previsão</label>
                  <input
                    type="date"
                    value={form.previsao}
                    onChange={(e) => updateField("previsao", e.target.value)}
                  />
                </div>
                <div className="pfield pfield--full">
                  <label>Observações</label>
                  <textarea
                    value={form.observacoes}
                    onChange={(e) => updateField("observacoes", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </section>

            {/* ── Production Sectors ────────────────────── */}
            <section className="prod-modal__section">
              <h3 className="prod-modal__section-title">Etapas de Produção</h3>
              <div className="prod-modal__sectors-grid">
                {PRODUCTION_SECTORS.map((sectorConfig) => (
                  <ProductionSector
                    key={sectorConfig.id}
                    config={sectorConfig}
                    data={form.setores[sectorConfig.id]}
                    onChange={(field, value) =>
                      updateSector(sectorConfig.id, field, value)
                    }
                    onPickEmployee={() => handlePickEmployee(sectorConfig.id)}
                  />
                ))}
              </div>
            </section>

            {/* ── Materials ─────────────────────────────── */}
            <section className="prod-modal__section">
              <h3 className="prod-modal__section-title">Materiais</h3>
              <MaterialsTable materials={form.materiais} />
            </section>

            {/* ── Footer ────────────────────────────────── */}
            <div className="prod-modal__footer">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEmpOpen(true)}
              >
                <Users size={14} />
                Funcionários
              </Button>
              <div className="prod-modal__footer-right">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSaveConfirmOpen(true)}
                >
                  <Save size={14} />
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={saveConfirmOpen}
        message="Deseja confirmar as alterações feitas?"
        confirmLabel="Confirmar"
        onConfirm={() => {
          // chamar funcao backend para salvar dados aqui !!!
          if (form) onSave(form);
          setSaveConfirmOpen(false);
          toast.success("Projeto Salvo com Sucesso !!");
        }}
        onCancel={() => setSaveConfirmOpen(false)}
      />

      <EmployeesModal
        isOpen={empOpen}
        employees={employees}
        onClose={handleCloseEmp}
        onSelect={handleSelectEmployee}
      />
    </>
  );
}
