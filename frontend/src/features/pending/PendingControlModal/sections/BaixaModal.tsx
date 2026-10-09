import { useEffect, useState } from "react";
import { Modal } from "../../../../components/Modal";
import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { fetchLocalizacoes } from "../../../../services/localizacoes";
import type { Localizacao } from "../../../../services/localizacoes";
import type { PendingItem } from "../../../../types/pending";

interface Props {
  item: PendingItem | null;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (data: { qtdUnBaixada: number; localizacaoId: number }) => void;
}

export function BaixaModal({ item, saving, onClose, onConfirm }: Props) {
  const [qtd, setQtd] = useState("");
  const [localizacaoId, setLocalizacaoId] = useState("");
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    if (!item) return;
    setQtd(item.qtdUnConfirmada != null ? String(item.qtdUnConfirmada) : "");
    setLocalizacaoId("");
    setLoadingLoc(true);
    fetchLocalizacoes()
      .then((rows) => setLocalizacoes(rows.filter((l) => l.ativo)))
      .catch(() => setLocalizacoes([]))
      .finally(() => setLoadingLoc(false));
  }, [item]);

  if (!item) return null;

  function handleConfirm() {
    const n = Number(qtd.replace(",", "."));
    if (!n || n <= 0 || !localizacaoId) return;
    onConfirm({ qtdUnBaixada: n, localizacaoId: Number(localizacaoId) });
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
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              disabled={!qtd.trim() || !localizacaoId}
              onClick={handleConfirm}
            >
              Confirmar baixa
            </Button>
          </div>
        </div>
      }
    >
      <div className="cad-modal-body">
        <p style={{ margin: 0, fontSize: 13, color: "var(--text)" }}>
          <strong>{item.descricao}</strong> — informe o que realmente foi
          consumido (pode ser diferente do reservado) e de onde está saindo.
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
        <label className="cad-field">
          <span className="cad-field__label">Localização</span>
          <select
            className="cad-field__input"
            value={localizacaoId}
            onChange={(e) => setLocalizacaoId(e.target.value)}
            disabled={loadingLoc}
          >
            <option value="">
              {loadingLoc ? "Carregando..." : "Selecione..."}
            </option>
            {localizacoes.map((l) => (
              <option key={l.id} value={l.id}>
                {l.codigo}
                {l.descricao ? ` — ${l.descricao}` : ""}
              </option>
            ))}
          </select>
          {!loadingLoc && localizacoes.length === 0 && (
            <span style={{ fontSize: 12, color: "var(--warning, #b45309)" }}>
              Nenhuma localização cadastrada — cadastre uma em Cadastros → Localizações antes de dar baixa.
            </span>
          )}
        </label>
      </div>
    </Modal>
  );
}
