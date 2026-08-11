import { useState, useEffect, useRef } from "react";
import { Modal } from "../../../components/Modal";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { FormSection } from "../../../components/FormSection";
import { ProjectSummarySection } from "./sections/ProjectSummarySection";
import { PendingItemsTable } from "./sections/PendingItemsTable";
import { PendingItemForm } from "./sections/PendingItemForm";
import { emptyPendingItem } from "../../../data/pendingConfig";
import {
  fetchPendingCategories,
  fetchPendingItems,
  insertPendingItem,
  updatePendingItem,
  deletePendingItem,
  type PendingCategory,
} from "../../../services/pending";
import type { PendingItem, PendingProject } from "../../../types/pending";
import { useToast } from "../../../context/ToastContext";
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
  const [formItem, setFormItem] = useState<PendingItem>(emptyPendingItem());
  const [isEditMode, setIsEditMode] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [categories, setCategories] = useState<PendingCategory[]>([]);
  const nextId = useRef(10000);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && project) {
      setLocalProject({ ...project, itens: [] });
      setFormItem(emptyPendingItem());
      setIsEditMode(false);
      setDeleteId(null);
      nextId.current = 1;

      if (categories.length === 0) {
        fetchPendingCategories()
          .then(setCategories)
          .catch(() => {});
      }

      setLoadingItems(true);
      fetchPendingItems(project.id)
        .then((itens) => {
          setLocalProject((prev) => (prev ? { ...prev, itens } : prev));
          nextId.current = Math.max(0, ...itens.map((i) => i.id)) + 1;
        })
        .finally(() => setLoadingItems(false));
    } else if (!isOpen) {
      setLocalProject(null);
      setFormItem(emptyPendingItem());
      setIsEditMode(false);
      setDeleteId(null);
      setConfirmSave(false);
    }
  }, [isOpen, project]);

  function handleEditRow(item: PendingItem) {
    setFormItem({ ...item });
    setIsEditMode(true);
  }

  function handleClearForm() {
    setFormItem(emptyPendingItem());
    setIsEditMode(false);
  }

  async function handleFormSubmit() {
    if (!localProject) return;

    if (isEditMode) {
      setInserting(true);
      try {
        await updatePendingItem(formItem);
        setLocalProject({
          ...localProject,
          itens: localProject.itens.map((i) =>
            i.id === formItem.id ? formItem : i,
          ),
        });
        handleClearForm();
        toast.success("Item atualizado com sucesso.");
      } catch {
        toast.error("Erro ao atualizar item.");
      } finally {
        setInserting(false);
      }
      return;
    }

    // New item → insert directly in DB
    setInserting(true);
    try {
      await insertPendingItem(localProject.id, formItem);
      const newItem = { ...formItem, id: nextId.current++ };
      setLocalProject({
        ...localProject,
        itens: [...localProject.itens, newItem],
      });
      onItemsChanged?.(localProject.id, 1);
      handleClearForm();
      toast.success("Item inserido com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao inserir item.");
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
    } catch {
      toast.error("Erro ao excluir item.");
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
        maxWidth={960}
        footer={footer(onClose, setConfirmSave)}
      >
        {localProject && (
          <div className="pend-modal__content">
            <FormSection step={1} title="Identificação do Projeto">
              <ProjectSummarySection data={localProject} />
            </FormSection>

            <FormSection step={2} title="Itens Pendentes">
              {loadingItems ? (
                <p style={{ padding: "12px 0", opacity: 0.5, fontSize: 13 }}>
                  Carregando itens...
                </p>
              ) : (
                <PendingItemsTable
                  items={localProject.itens}
                  onEdit={handleEditRow}
                  onDelete={setDeleteId}
                />
              )}
            </FormSection>

            <FormSection
              step={3}
              title={isEditMode ? "Editar Item" : "Inserir Novo Item"}
            >
              <PendingItemForm
                item={formItem}
                categories={categories}
                isEditing={isEditMode}
                inserting={inserting}
                onChange={setFormItem}
                onSubmit={handleFormSubmit}
                onClear={handleClearForm}
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
