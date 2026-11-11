import { useEffect, useState } from "react";
import { Modal } from "../../../../components/Modal";
import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import type { PendingItem } from "../../../../types/pending";
import "./BaixaModal.css";

interface Props {
  item: PendingItem | null;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (qtd: number) => void;
}

export function BaixaModal({ item, saving, onClose, onConfirm }: Props) {
  const [qtd, setQtd] = useState("");

  useEffect(() => {
    setQtd(item?.qtdUnConfirmada != null ? String(item.qtdUnConfirmada) : "");
  }, [item]);

  if (!item) return null;

  const qtdNum = Number(qtd.replace(",", "."));
  const valido = Number.isFinite(qtdNum) && qtdNum > 0;

  function handleConfirm() {
    if (!valido) return;
    onConfirm(qtdNum);
  }

  return (
    <Modal
      title="Dar baixa"
      isOpen={!!item}
      onClose={onClose}
      maxWidth={420}
      footer={
        <div className="cad-modal-footer">
          <div className="cad-modal-footer__right">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" loading={saving} disabled={!valido} onClick={handleConfirm}>
              Confirmar baixa
            </Button>
          </div>
        </div>
      }
    >
      <div className="cad-modal-body">
        <p className="baixa-modal__intro">
          <strong>{item.descricao}</strong> — informe o que realmente foi consumido (pode ser diferente do
          liberado). Sai da Fábrica pra Expedição automaticamente; se a Fábrica não tiver saldo suficiente
          pra esse material, o excedente é buscado direto no Almoxarifado.
        </p>
        <Input
          label="Quantidade consumida (UN)"
          type="text"
          inputMode="decimal"
          value={qtd}
          onChange={(e) => setQtd(e.target.value)}
          placeholder="0"
          autoFocus
        />
      </div>
    </Modal>
  );
}
