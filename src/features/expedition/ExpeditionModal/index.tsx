import { useState, useEffect } from "react";
import { Modal } from "../../../components/Modal";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { FormSection } from "../../../components/FormSection";
import { UsersModal } from "../UsersModal";
import { ProjectInfoSection } from "./sections/ProjectInfoSection";
import { AccessoriesChecklistSection } from "./sections/AccessoriesChecklistSection";
import { OperationalStatusSection } from "./sections/OperationalStatusSection";
import { NotesSection } from "./sections/NotesSection";
import { PendingAccessoriesTable } from "./sections/PendingAccessoriesTable";
import { useToast } from "../../../context/ToastContext";
import type {
  ExpeditionDetail,
  ExpeditionUser,
  AccessoryChecklistItem,
  VolumeSize,
  OperationalStatus,
} from "../../../types/expedition";
import "./index.css";

interface ExpeditionModalProps {
  isOpen: boolean;
  detail: ExpeditionDetail | null;
  users: ExpeditionUser[];
  onClose: () => void;
  onSave: (detail: ExpeditionDetail) => void;
}

export function ExpeditionModal({
  isOpen,
  detail,
  users,
  onClose,
  onSave,
}: ExpeditionModalProps) {
  const [form, setForm] = useState<ExpeditionDetail | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [pickingFor, setPickingFor] = useState<
    "embalagem" | "pronto" | "entrega" | null
  >(null);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && detail) {
      setForm(JSON.parse(JSON.stringify(detail)));
    } else if (!isOpen) {
      setForm(null);
      setSaveConfirmOpen(false);
      setUserModalOpen(false);
      setPickingFor(null);
    }
  }, [isOpen, detail]);

  function updateChecklist(checklist: AccessoryChecklistItem[]) {
    if (!form) return;
    setForm({ ...form, checklist });
  }

  function updateVolumes(volumes: VolumeSize, total: number) {
    if (!form) return;
    setForm({ ...form, volumes, totalVolumes: total });
  }

  function updateOperacional(op: OperationalStatus) {
    if (!form) return;
    setForm({ ...form, operacional: op });
  }

  function updateObservacoes(v: string) {
    if (!form) return;
    setForm({ ...form, observacoes: v });
  }

  function handlePickUser(role: "embalagem" | "pronto" | "entrega") {
    setPickingFor(role);
    setUserModalOpen(true);
  }

  function handleSelectUser(user: ExpeditionUser) {
    if (!form || !pickingFor) return;
    if (pickingFor === "embalagem") {
      setForm({
        ...form,
        operacional: {
          ...form.operacional,
          embalagem: {
            ...form.operacional.embalagem,
            responsavelId: user.id,
            responsavelNome: user.nome,
          },
        },
      });
    } else if (pickingFor === "pronto") {
      setForm({
        ...form,
        operacional: {
          ...form.operacional,
          prontoResponsavelId: user.id,
          prontoResponsavelNome: user.nome,
        },
      });
    } else if (pickingFor === "entrega") {
      setForm({
        ...form,
        operacional: {
          ...form.operacional,
          entregaResponsavelId: user.id,
          entregaResponsavelNome: user.nome,
        },
      });
    }
    setUserModalOpen(false);
    setPickingFor(null);
  }

  function handleSaveConfirm() {
    if (!form) return;
    onSave(form);
    setSaveConfirmOpen(false);
    // chamar backend aqui
    toast.success("Projeto salvo com sucesso !!");
  }

  if (!isOpen) return null;

  return (
    <>
      <Modal
        title="Controle de Expedição"
        isOpen={isOpen}
        onClose={onClose}
        maxWidth={1080}
      >
        {form && (
          <div className="exped-modal__content">
            <FormSection step={1} title="Identificação">
              <ProjectInfoSection detail={form} />
            </FormSection>

            <FormSection step={2} title="Acessórios e Volumes">
              <AccessoriesChecklistSection
                checklist={form.checklist}
                volumes={form.volumes}
                totalVolumes={form.totalVolumes}
                onChecklistChange={updateChecklist}
                onVolumesChange={(volumes) =>
                  updateVolumes(volumes, form.totalVolumes)
                }
                onTotalVolumesChange={(total) =>
                  updateVolumes(form.volumes, total)
                }
              />
            </FormSection>

            <FormSection step={3} title="Status Operacional">
              <OperationalStatusSection
                data={form.operacional}
                onChange={updateOperacional}
                onPickUser={handlePickUser}
              />
            </FormSection>

            <FormSection step={4} title="Observações">
              <NotesSection
                value={form.observacoes}
                onChange={updateObservacoes}
              />
            </FormSection>

            <FormSection step={5} title="Compras Pendentes">
              <PendingAccessoriesTable items={form.acessoriosCompra} />
            </FormSection>

            <div className="exped-modal__footer">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setPickingFor(null);
                  setUserModalOpen(true);
                }}
              >
                Funcionários
              </Button>
              <div className="exped-modal__footer-actions">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSaveConfirmOpen(true)}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={saveConfirmOpen}
        message="Deseja salvar as alterações deste pedido de expedição?"
        confirmLabel="Salvar"
        cancelLabel="Cancelar"
        onConfirm={handleSaveConfirm}
        onCancel={() => setSaveConfirmOpen(false)}
      />

      <UsersModal
        isOpen={userModalOpen}
        users={users}
        onClose={() => {
          setUserModalOpen(false);
          setPickingFor(null);
        }}
        onSelect={handleSelectUser}
      />
    </>
  );
}
