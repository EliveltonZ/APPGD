import { useState, useEffect } from "react";
import { Users, Save } from "lucide-react";
import { StatusBadge } from "../../forecast/StatusBadge";
import { Modal } from "../../../components/Modal";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { ProductionSector } from "../ProductionSector";
import { MaterialsTable } from "../../../components/MaterialsTable";
import { EmployeesModal } from "../EmployeesModal";
import {
  PRODUCTION_SECTORS,
  emptySetores,
} from "../../../data/productionConfig";
import {
  fetchProductionDetail,
  fetchEmployees,
  saveProductionData,
} from "../../../services/production";
import { useToast } from "../../../context/ToastContext";
import type {
  ProductionOrder,
  ProductionDetail,
  SectorData,
  Employee,
} from "../../../types/production";
import "./index.css";

interface ProductionModalProps {
  isOpen: boolean;
  order: ProductionOrder;
  onClose: () => void;
  onSave?: () => void;
}

export function ProductionModal({
  isOpen,
  order,
  onClose,
  onSave,
}: ProductionModalProps) {
  const toast = useToast();
  const [form, setForm] = useState<ProductionDetail | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empOpen, setEmpOpen] = useState(false);
  const [pickingSector, setPickingSector] = useState<string | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  useEffect(() => {
    setLoadingDetail(true);
    setForm(null);
    Promise.all([fetchProductionDetail(order.ordemdecompra), fetchEmployees()])
      .then(([detail, emps]) => {
        setEmployees(emps);
        const resolved = detail ?? {
          orderId: order.ordemdecompra,
          ordemCompra: String(order.ordemdecompra),
          contrato: String(order.contrato),
          cliente: order.cliente,
          ambiente: order.ambiente,
          numeroProjeto: order.numproj,
          lote: String(order.lote),
          chegouFabrica: order.chegoufabrica ?? "",
          prazo: order.dataentrega ?? "",
          previsao: order.previsao ?? "",
          observacoes: order.observacoes,
          setores: emptySetores(),
          materiais: [],
        };
        setForm({
          ...resolved,
          setores: { ...emptySetores(), ...resolved.setores },
        });
      })
      .catch(() => {
        toast.error("Erro ao carregar dados do projeto.");
      })
      .finally(() => {
        setLoadingDetail(false);
      });
  }, [order.ordemdecompra]);

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

  async function handleConfirmSave() {
    if (!form) return;
    setSaving(true);
    try {
      await saveProductionData(form);
      toast.success("Projeto salvo com sucesso!");
      setSaveConfirmOpen(false);
      onSave?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function footer() {
    return (
      <div className="prod-modal__footer">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setEmpOpen(true)}
          disabled={loadingDetail}
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
            disabled={saving || loadingDetail || !form}
            onClick={() => setSaveConfirmOpen(true)}
          >
            <Save size={14} />
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Modal
        title="Informações de Produção"
        isOpen={isOpen}
        onClose={onClose}
        maxWidth={960}
        footer={footer()}
      >
        {loadingDetail || !form ? (
          <div className="prod-modal__loading">Carregando...</div>
        ) : (
          <div className="prod-modal">
            {/* ── Project Info ───────────────────────────── */}
            <section className="prod-modal__section">
              <div className="plan-modal__section-header">
                <h3 className="plan-modal__section-title">
                  Informações do Projeto
                </h3>
                <StatusBadge status={order.status} />
              </div>
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
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={saveConfirmOpen}
        message="Deseja confirmar as alterações feitas?"
        confirmLabel="Confirmar"
        onConfirm={handleConfirmSave}
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
