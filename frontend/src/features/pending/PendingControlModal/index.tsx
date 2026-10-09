import { useState, useEffect } from "react";
import { Modal } from "../../../components/Modal";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { FormSection } from "../../../components/FormSection";
import { ProjectSummarySection } from "./sections/ProjectSummarySection";
import { PendingItemsTable } from "./sections/PendingItemsTable";
import { PendingItemForm } from "./sections/PendingItemForm";
import { ImportarXmlSection } from "./sections/ImportarXmlSection";
import {
  fetchPendingItems,
  insertPendingItem,
  deletePendingItem,
} from "../../../services/pending";
import { fetchMateriaisOpcoes } from "../../../services/materiais";
import type { PendingProject } from "../../../types/pending";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorMessage";
import "./index.css";

interface PendingControlModalProps {
  isOpen: boolean;
  project: PendingProject | null;
  onClose: () => void;
  onSave: (project: PendingProject) => void;
  onItemsChanged?: (projectId: number, delta: number) => void;
}

function footer(onClose: () => void, onClick_: (v: boolean) => void) {
  return (
    <div className="pend-modal__footer">
      <Button variant="ghost" size="sm" onClick={onClose}>
        Cancelar
      </Button>
      <Button variant="primary" size="sm" onClick={() => onClick_(true)}>
        Salvar
      </Button>
    </div>
  );
}

export function PendingControlModal({
  isOpen,
  project,
  onClose,
  onSave,
  onItemsChanged,
}: PendingControlModalProps) {
  const [localProject, setLocalProject] = useState<PendingProject | null>(null);
  const [inserting, setInserting] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [materiaisOptions, setMateriaisOptions] = useState<
    { value: number; label: string; searchHint?: string }[]
  >([]);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && project) {
      setLocalProject({ ...project, itens: [] });
      setDeleteId(null);

      if (materiaisOptions.length === 0) {
        fetchMateriaisOpcoes()
          .then((materiais) =>
            setMateriaisOptions(
              materiais.map((m) => ({
                value: m.id,
                label: `${m.codigoInterno} — ${m.descricao}`,
                searchHint: m.codigoInterno,
              })),
            ),
          )
          .catch(() => {
            toast.error("Erro ao carregar materiais.");
          });
      }

      setLoadingItems(true);
      fetchPendingItems(project.id)
        .then((itens) => {
          setLocalProject((prev) => (prev ? { ...prev, itens } : prev));
        })
        .finally(() => setLoadingItems(false));
    } else if (!isOpen) {
      setLocalProject(null);
      setDeleteId(null);
      setConfirmSave(false);
    }
  }, [isOpen, project]);

  async function refetchItens() {
    if (!localProject) return;
    const itens = await fetchPendingItems(localProject.id);
    const delta = itens.length - localProject.itens.length;
    setLocalProject((prev) => (prev ? { ...prev, itens } : prev));
    if (delta !== 0) onItemsChanged?.(localProject.id, delta);
  }

  async function handleFormSubmit(data: {
    materialId: number;
    quantidade: number;
    detalhes: string | null;
  }) {
    if (!localProject) return;
    setInserting(true);
    try {
      await insertPendingItem(localProject.id, data);
      await refetchItens();
      toast.success("Item inserido com sucesso.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao inserir item."));
    } finally {
      setInserting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!localProject || deleteId === null) return;
    try {
      await deletePendingItem(deleteId);
      setLocalProject({
        ...localProject,
        itens: localProject.itens.filter((i) => i.id !== deleteId),
      });
      onItemsChanged?.(localProject.id, -1);
      toast.success("Item excluído com sucesso.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao excluir item."));
    } finally {
      setDeleteId(null);
    }
  }

  function handleSaveConfirm() {
    if (!localProject) return;
    onSave(localProject);
    setConfirmSave(false);
  }

  if (!isOpen || !project) return null;

  return (
    <>
      <Modal
        title={`${project.numOC} — ${project.cliente} / ${project.ambiente}`}
        isOpen={isOpen}
        onClose={onClose}
        maxWidth={1100}
        footer={footer(onClose, setConfirmSave)}
      >
        {localProject && (
          <div className="pend-modal__content">
            <FormSection step={1} title="Identificação do Projeto">
              <ProjectSummarySection data={localProject} />
            </FormSection>

            <FormSection step={2} title="Itens do Pedido">
              {loadingItems ? (
                <p style={{ padding: "12px 0", opacity: 0.5, fontSize: 13 }}>
                  Carregando itens...
                </p>
              ) : (
                <PendingItemsTable
                  items={localProject.itens}
                  onDelete={setDeleteId}
                />
              )}
            </FormSection>

            <FormSection step={3} title="Importar XML do Promob">
              <ImportarXmlSection
                ordemdecompra={localProject.id}
                materiaisOptions={materiaisOptions}
                onImported={refetchItens}
              />
            </FormSection>

            <FormSection step={4} title="Inserir Item Avulso">
              <PendingItemForm
                materiaisOptions={materiaisOptions}
                inserting={inserting}
                onSubmit={handleFormSubmit}
              />
            </FormSection>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={deleteId !== null}
        message="Deseja excluir este item permanentemente?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmModal
        isOpen={confirmSave}
        message="Deseja salvar as alterações neste projeto?"
        confirmLabel="Salvar"
        cancelLabel="Cancelar"
        onConfirm={handleSaveConfirm}
        onCancel={() => setConfirmSave(false)}
      />
    </>
  );
}
