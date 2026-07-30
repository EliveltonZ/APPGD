import { useState, useEffect } from "react";
import { Modal } from "../../../components/Modal";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { FormSection } from "../../../components/FormSection";
import {
  emptyProjectRelease,
  ALL_PROJECT_TYPES,
  PROJECT_TYPE_LABELS,
} from "../../../data/pcpConfig";
import {
  searchProjectForRelease,
  updateProjectPcp,
} from "../../../services/pcp";
import { useToast } from "../../../context/ToastContext";
import type {
  ProductionProject,
  ProjectReleaseFormData,
  ProjectType,
} from "../../../types/pcp";
import "./index.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: ProductionProject) => void;
}

export function ProjectReleaseModal({ isOpen, onClose, onSave }: Props) {
  const toast = useToast();
  const [form, setForm] = useState<ProjectReleaseFormData>(
    emptyProjectRelease(),
  );
  const [searchMsg, setSearchMsg] = useState("");
  const [searchOk, setSearchOk] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm(emptyProjectRelease());
      setSearchMsg("");
      setSearchOk(false);
      setConfirmOpen(false);
    }
  }, [isOpen]);

  function set<K extends keyof ProjectReleaseFormData>(
    field: K,
    value: ProjectReleaseFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch() {
    const oc = Number(form.numOC.trim());
    if (!oc) {
      setSearchMsg("Informe um N° OC válido.");
      setSearchOk(false);
      return;
    }
    setSearching(true);
    setSearchMsg("");
    try {
      const found = await searchProjectForRelease(oc);
      if (found) {
        setForm((prev) => ({ ...prev, ...found }));
        setSearchMsg("Projeto encontrado — dados preenchidos.");
        setSearchOk(true);
      } else {
        setSearchMsg("Nenhum projeto encontrado para este N° OC.");
        setSearchOk(false);
      }
    } catch {
      setSearchMsg("Erro ao buscar projeto.");
      setSearchOk(false);
    } finally {
      setSearching(false);
    }
  }

  async function handleSaveConfirm() {
    setConfirmOpen(false);
    setSaving(true);
    try {
      await updateProjectPcp(form);
      const project: ProductionProject = {
        id: Number(form.numOC),
        ...form,
        status: "disponivel",
      };
      onSave(project);
      toast.success("Projeto liberado com sucesso.");
      setForm(emptyProjectRelease());
      setSearchMsg("");
      setSearchOk(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao liberar projeto.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  function footer() {
    return (
      <div className="prel-footer">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="sm"
          loading={saving}
          onClick={() => setConfirmOpen(true)}
        >
          Liberar Projeto
        </Button>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      <Modal
        title="Liberação de Projeto para Produção"
        isOpen={isOpen}
        onClose={onClose}
        maxWidth={860}
        footer={footer()}
      >
        <div className="prel-content">
          <FormSection step={1} title="Cliente">
            <div className="pinfo-section">
              <div className="frow frow--4">
                <div className="pfield pfield--span2">
                  <label>Num. OC</label>
                  <div className="prel-search-row">
                    <input
                      type="text"
                      value={form.numOC}
                      onChange={(e) => {
                        set("numOC", e.target.value);
                        setSearchMsg("");
                      }}
                      placeholder="Ex: OC-2026-001"
                    />
                    <button
                      type="button"
                      className="prel-search-btn"
                      onClick={handleSearch}
                      disabled={searching}
                    >
                      {searching ? "Buscando..." : "Buscar"}
                    </button>
                  </div>
                  {searchMsg && (
                    <span
                      className={`prel-search-msg${searchOk ? " prel-search-msg--ok" : " prel-search-msg--err"}`}
                    >
                      {searchMsg}
                    </span>
                  )}
                </div>
                <div className="pfield">
                  <label>Contrato</label>
                  <input
                    type="text"
                    value={form.contrato}
                    onChange={(e) => set("contrato", e.target.value)}
                    placeholder="CT-XXX"
                    disabled
                  />
                </div>
                <div className="pfield">
                  <label>Urgente</label>
                  <button
                    type="button"
                    className={`prel-urgente-btn${form.urgente ? " prel-urgente-btn--active" : ""}`}
                    onClick={() => set("urgente", !form.urgente)}
                  >
                    {form.urgente ? "Sim — Urgente" : "Não"}
                  </button>
                </div>
              </div>
              <div className="frow frow--1">
                <div className="pfield">
                  <label>Cliente</label>
                  <input
                    type="text"
                    value={form.cliente}
                    onChange={(e) => set("cliente", e.target.value)}
                    placeholder="Nome do cliente..."
                    disabled
                  />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection step={2} title="Projeto">
            <div className="pinfo-section">
              <div className="frow frow--4">
                <div className="pfield">
                  <label>Corte Certo / C.C.</label>
                  <input
                    type="text"
                    value={form.corteCC}
                    onChange={(e) => set("corteCC", e.target.value)}
                    placeholder="Ex: 4201"
                  />
                </div>
                <div className="pfield pfield--span2">
                  <label>Ambiente</label>
                  <input
                    type="text"
                    value={form.ambiente}
                    onChange={(e) => set("ambiente", e.target.value)}
                    placeholder="Ex: Cozinha Americana"
                    disabled
                  />
                </div>
                <div className="pfield">
                  <label>N° Projeto</label>
                  <input
                    type="text"
                    value={form.numProjeto}
                    onChange={(e) => set("numProjeto", e.target.value)}
                    placeholder="Ex: 01/01"
                    disabled
                  />
                </div>
              </div>
              <div className="frow frow--4">
                <div className="pfield">
                  <label>Pedido</label>
                  <input
                    type="text"
                    value={form.pedido}
                    onChange={(e) => set("pedido", e.target.value)}
                    placeholder="Ex: 1234"
                  />
                </div>
                <div className="pfield">
                  <label>Tipo</label>
                  <select
                    className="pfield__select"
                    value={form.tipo}
                    onChange={(e) => set("tipo", e.target.value as ProjectType)}
                  >
                    {ALL_PROJECT_TYPES.map((t) => (
                      <option key={t} value={t.toUpperCase()}>
                        {PROJECT_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pfield">
                  <label>Peças</label>
                  <input
                    type="number"
                    min={0}
                    value={form.pecas}
                    onChange={(e) => set("pecas", Number(e.target.value))}
                  />
                </div>
                <div className="pfield">
                  <label>Área (m²)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.area}
                    onChange={(e) => set("area", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection step={3} title="Produção">
            <div className="pinfo-section">
              <div className="frow frow--3">
                <div className="pfield">
                  <label>Lote</label>
                  <input
                    type="text"
                    value={form.lote}
                    onChange={(e) => set("lote", e.target.value)}
                    placeholder="Ex: 1234"
                  />
                </div>
                <div className="pfield">
                  <label>Chegada na Fábrica</label>
                  <input
                    type="date"
                    value={form.chegouFabrica}
                    onChange={(e) => set("chegouFabrica", e.target.value)}
                    disabled
                  />
                </div>
                <div className="pfield">
                  <label>Entrega</label>
                  <input
                    type="date"
                    value={form.entrega}
                    onChange={(e) => set("entrega", e.target.value)}
                    disabled
                  />
                </div>
              </div>
            </div>
          </FormSection>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        message="Deseja liberar este projeto para produção?"
        confirmLabel="Liberar"
        cancelLabel="Cancelar"
        onConfirm={handleSaveConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
