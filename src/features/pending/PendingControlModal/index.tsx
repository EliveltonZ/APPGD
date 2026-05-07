import { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { FormSection } from '../../../components/FormSection';
import { ProjectSummarySection } from './sections/ProjectSummarySection';
import { PendingItemsTable } from './sections/PendingItemsTable';
import { PendingItemForm } from './sections/PendingItemForm';
import { emptyPendingItem } from '../../../data/pendingConfig';
import type { PendingItem, PendingProject } from '../../../types/pending';
import './index.css';

interface PendingControlModalProps {
  isOpen: boolean;
  project: PendingProject | null;
  onClose: () => void;
  onSave: (project: PendingProject) => void;
}

export function PendingControlModal({ isOpen, project, onClose, onSave }: PendingControlModalProps) {
  const [localProject, setLocalProject] = useState<PendingProject | null>(null);
  const [formItem, setFormItem] = useState<PendingItem>(emptyPendingItem());
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const nextId = useRef(10000);

  useEffect(() => {
    if (isOpen && project) {
      setLocalProject({ ...project, itens: project.itens.map((i) => ({ ...i })) });
      setFormItem(emptyPendingItem());
      setIsEditMode(false);
      setDeleteId(null);
      nextId.current = Math.max(0, ...project.itens.map((i) => i.id)) + 1;
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

  function handleFormSubmit() {
    if (!localProject) return;
    if (isEditMode) {
      setLocalProject({
        ...localProject,
        itens: localProject.itens.map((i) => (i.id === formItem.id ? formItem : i)),
      });
    } else {
      const newItem = { ...formItem, id: nextId.current++ };
      setLocalProject({ ...localProject, itens: [...localProject.itens, newItem] });
    }
    handleClearForm();
  }

  function handleDeleteConfirm() {
    if (!localProject || deleteId === null) return;
    setLocalProject({
      ...localProject,
      itens: localProject.itens.filter((i) => i.id !== deleteId),
    });
    setDeleteId(null);
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
      >
        {localProject && (
          <div className="pend-modal__content">
            <FormSection step={1} title="Identificação do Projeto">
              <ProjectSummarySection data={localProject} />
            </FormSection>

            <FormSection step={2} title="Itens Pendentes">
              <PendingItemsTable
                items={localProject.itens}
                onEdit={handleEditRow}
                onDelete={setDeleteId}
              />
            </FormSection>

            <FormSection step={3} title={isEditMode ? 'Editar Item' : 'Inserir Novo Item'}>
              <PendingItemForm
                item={formItem}
                isEditing={isEditMode}
                onChange={setFormItem}
                onSubmit={handleFormSubmit}
                onClear={handleClearForm}
              />
            </FormSection>

            <div className="pend-modal__footer">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={() => setConfirmSave(true)}>
                Salvar
              </Button>
            </div>
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
