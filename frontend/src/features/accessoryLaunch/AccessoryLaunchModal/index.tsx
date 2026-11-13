import { useState, useEffect, useRef } from "react";
import { Modal } from "../../../components/Modal";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { FormSection } from "../../../components/FormSection";
import { ProjectSummarySection } from "./sections/ProjectSummarySection";
import { AccessoryItemsTable } from "./sections/AccessoryItemsTable";
import { AccessoryItemForm } from "./sections/AccessoryItemForm";
import { emptyAccessoryLaunchItem } from "../../../data/accessoryLaunchConfig";
import {
  fetchAccessoryLaunchCategories,
  fetchAccessoryLaunchItems,
  insertAccessoryLaunchItem,
  updateAccessoryLaunchItem,
  deleteAccessoryLaunchItem,
} from "../../../services/accessoryLaunch";
import type { Category } from "../../../services/utils";
import type { AccessoryLaunchItem, AccessoryLaunchProject } from "../../../types/accessoryLaunch";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorMessage";
import "./index.css";

interface AccessoryLaunchModalProps {
  isOpen: boolean;
  project: AccessoryLaunchProject | null;
  onClose: () => void;
  onItemsChanged?: (projectId: number, delta: number) => void;
}

function footer(onClose: () => void) {
  return (
    <div className="acc-modal__footer">
      <Button variant="secondary" size="sm" onClick={onClose}>
        Fechar
      </Button>
    </div>
  );
}

export function AccessoryLaunchModal({
  isOpen,
  project,
  onClose,
  onItemsChanged,
}: AccessoryLaunchModalProps) {
  const [items, setItems] = useState<AccessoryLaunchItem[]>([]);
  const [formItem, setFormItem] = useState<AccessoryLaunchItem>(emptyAccessoryLaunchItem());
  const [isEditMode, setIsEditMode] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const nextId = useRef(10000);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && project) {
      setItems([]);
      setFormItem(emptyAccessoryLaunchItem());
      setIsEditMode(false);
      setDeleteId(null);

      if (categories.length === 0) {
        fetchAccessoryLaunchCategories()
          .then(setCategories)
          .catch(() => {
            toast.error("Erro ao carregar categorias.");
          });
      }

      setLoadingItems(true);
      fetchAccessoryLaunchItems(project.id)
        .then((itens) => {
          setItems(itens);
          nextId.current = Math.max(0, ...itens.map((i) => i.id)) + 1;
        })
        .catch(() => {
          toast.error("Erro ao carregar itens.");
          setItems([]);
        })
        .finally(() => setLoadingItems(false));
    } else if (!isOpen) {
      setItems([]);
      setFormItem(emptyAccessoryLaunchItem());
      setIsEditMode(false);
      setDeleteId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, project]);

  function handleEditRow(item: AccessoryLaunchItem) {
    setFormItem({ ...item });
    setIsEditMode(true);
  }

  function handleClearForm() {
    setFormItem(emptyAccessoryLaunchItem());
    setIsEditMode(false);
  }

  async function handleFormSubmit() {
    if (!project) return;

    if (isEditMode) {
      setInserting(true);
      try {
        await updateAccessoryLaunchItem(formItem);
        setItems((prev) => prev.map((i) => (i.id === formItem.id ? formItem : i)));
        handleClearForm();
        toast.success("Item atualizado com sucesso.");
      } catch (err) {
        toast.error(getErrorMessage(err, "Erro ao atualizar item."));
      } finally {
        setInserting(false);
      }
      return;
    }

    setInserting(true);
    try {
      await insertAccessoryLaunchItem(project.id, formItem);
      const newItem = { ...formItem, id: nextId.current++ };
      setItems((prev) => [...prev, newItem]);
      onItemsChanged?.(project.id, 1);
      handleClearForm();
      toast.success("Item inserido com sucesso.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao inserir item."));
    } finally {
      setInserting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!project || deleteId === null) return;
    try {
      await deleteAccessoryLaunchItem(deleteId);
      setItems((prev) => prev.filter((i) => i.id !== deleteId));
      onItemsChanged?.(project.id, -1);
      toast.success("Item excluído com sucesso.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao excluir item."));
    } finally {
      setDeleteId(null);
    }
  }

  if (!isOpen || !project) return null;

  return (
    <>
      <Modal
        title={`${project.numOC} — ${project.cliente} / ${project.ambiente}`}
        isOpen={isOpen}
        onClose={onClose}
        maxWidth={960}
        footer={footer(onClose)}
      >
        <div className="acc-modal__content">
          <FormSection step={1} title="Identificação do Projeto">
            <ProjectSummarySection data={project} />
          </FormSection>

          <FormSection step={2} title="Itens Lançados">
            {loadingItems ? (
              <p style={{ padding: "12px 0", opacity: 0.5, fontSize: 13 }}>
                Carregando itens...
              </p>
            ) : (
              <AccessoryItemsTable
                items={items}
                onEdit={handleEditRow}
                onDelete={setDeleteId}
              />
            )}
          </FormSection>

          <FormSection
            step={3}
            title={isEditMode ? "Editar Item" : "Lançar Novo Item"}
          >
            <AccessoryItemForm
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
      </Modal>

      <ConfirmModal
        isOpen={deleteId !== null}
        message="Deseja excluir este item permanentemente?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
