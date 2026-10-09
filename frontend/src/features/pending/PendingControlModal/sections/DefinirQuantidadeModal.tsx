import { useEffect, useState } from "react";
import { Modal } from "../../../../components/Modal";
import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import type { PendingItem } from "../../../../types/pending";

const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };
const UN_LABEL: Record<string, string> = { CHAPA: "chapas inteiras", FITA: "rolos" };

interface Props {
  item: PendingItem | null;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (qtdUnConfirmada: number) => void;
}

export function DefinirQuantidadeModal({ item, saving, onClose, onConfirm }: Props) {
  const [qtd, setQtd] = useState("");

  useEffect(() => {
    setQtd(item?.qtdUnConfirmada != null ? String(item.qtdUnConfirmada) : "");
  }, [item]);

  if (!item) return null;

  function handleConfirm() {
    const n = Number(qtd.replace(",", "."));
    if (!n || n <= 0) return;
    onConfirm(n);
  }

  return (
    <Modal
      title="Definir quantidade pra reserva"
      isOpen={!!item}
      onClose={onClose}
      maxWidth={420}
      footer={
        <div className="cad-modal-footer">
          <div className="cad-modal-footer__right">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleConfirm}>
              Confirmar
            </Button>
          </div>
        </div>
      }
    >
      <div className="cad-modal-body">
        <p style={{ margin: 0, fontSize: 13, color: "var(--text)" }}>
          <strong>{item.descricao}</strong> — o XML pede{" "}
          {item.quantidade.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}{" "}
          {UNIDADE_LABEL[item.unidade] ?? item.unidade}. Quantos{" "}
          {UN_LABEL[item.tipo] ?? "UN"} o pedido vai usar?
        </p>
        <Input
          label="Quantidade (UN)"
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
