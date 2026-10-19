import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Modal } from "../../../../components/Modal";
import { Button } from "../../../../components/Button";
import { fetchSaldoPorLocalizacoes } from "../../../../services/estoque";
import type { SaldoLocalizacaoItem, BaixaSplit } from "../../../../services/estoque";
import type { PendingItem } from "../../../../types/pending";
import "./BaixaModal.css";

interface Props {
  item: PendingItem | null;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (splits: BaixaSplit[]) => void;
}

interface LinhaSplit {
  _key: number;
  localizacaoId: string;
  qtd: string;
}

let nextKey = 1;

function fmtQtd(v: number): string {
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

export function BaixaModal({ item, saving, onClose, onConfirm }: Props) {
  const [linhas, setLinhas] = useState<LinhaSplit[]>([{ _key: 0, localizacaoId: "", qtd: "" }]);
  const [saldos, setSaldos] = useState<SaldoLocalizacaoItem[]>([]);
  const [loadingSaldos, setLoadingSaldos] = useState(false);

  useEffect(() => {
    if (!item) return;
    setLinhas([
      { _key: nextKey++, localizacaoId: "", qtd: item.qtdUnConfirmada != null ? String(item.qtdUnConfirmada) : "" },
    ]);
    setSaldos([]);
    setLoadingSaldos(true);
    fetchSaldoPorLocalizacoes(item.materialId)
      .then(setSaldos)
      .catch(() => setSaldos([]))
      .finally(() => setLoadingSaldos(false));
  }, [item]);

  if (!item) return null;

  // Recebimento é só a gaveta de entrada da nota fiscal — material parado lá
  // ainda não foi transferido pra localização definitiva, então não pode
  // ser escolhido como origem da baixa.
  const saldosUsaveis = saldos.filter((s) => !s.padrao_recebimento);
  const soTemNoRecebimento = !loadingSaldos && saldos.length > 0 && saldosUsaveis.length === 0;

  function updateLinha(key: number, field: "localizacaoId" | "qtd", value: string) {
    setLinhas((prev) => prev.map((l) => (l._key === key ? { ...l, [field]: value } : l)));
  }

  function addLinha() {
    setLinhas((prev) => [...prev, { _key: nextKey++, localizacaoId: "", qtd: "" }]);
  }

  function removeLinha(key: number) {
    setLinhas((prev) => (prev.length > 1 ? prev.filter((l) => l._key !== key) : prev));
  }

  const splitsValidos = linhas
    .map((l) => ({ localizacaoId: Number(l.localizacaoId), qtd: Number(l.qtd.replace(",", ".")) }))
    .filter((s) => s.localizacaoId > 0 && s.qtd > 0);

  const qtdTotal = splitsValidos.reduce((acc, s) => acc + s.qtd, 0);
  const qtdNecessaria = item.qtdUnConfirmada ?? null;
  const bateComNecessario = qtdNecessaria == null || qtdTotal === qtdNecessaria;

  function handleConfirm() {
    if (splitsValidos.length === 0) return;
    onConfirm(splitsValidos);
  }

  return (
    <Modal
      title="Dar baixa"
      isOpen={!!item}
      onClose={onClose}
      maxWidth={460}
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
              disabled={splitsValidos.length === 0}
              onClick={handleConfirm}
            >
              Confirmar baixa
            </Button>
          </div>
        </div>
      }
    >
      <div className="cad-modal-body">
        <p className="baixa-modal__intro">
          <strong>{item.descricao}</strong> — informe o que realmente foi consumido (pode ser diferente do
          reservado) e de onde está saindo. Se o material estiver espalhado em mais de uma localização, dá
          pra dividir numa ação só.
        </p>

        {!loadingSaldos && saldos.length === 0 && (
          <span className="baixa-modal__hint" style={{ color: "var(--warning, #b45309)" }}>
            Esse material não tem saldo em nenhuma localização cadastrada — confira antes de continuar.
          </span>
        )}
        {soTemNoRecebimento && (
          <span className="baixa-modal__hint" style={{ color: "var(--warning, #b45309)" }}>
            Esse material só está no Recebimento, aguardando ser transferido pra localização definitiva —
            transfira antes de dar baixa.
          </span>
        )}

        <div className="baixa-modal__splits">
          {linhas.map((linha) => {
            const outrasEscolhidas = new Set(
              linhas.filter((l) => l._key !== linha._key).map((l) => l.localizacaoId),
            );
            return (
              <div key={linha._key} className="baixa-modal__split">
                <label className="cad-field">
                  <span className="cad-field__label">Localização</span>
                  <select
                    className="cad-field__input"
                    value={linha.localizacaoId}
                    onChange={(e) => updateLinha(linha._key, "localizacaoId", e.target.value)}
                    disabled={loadingSaldos}
                  >
                    <option value="">{loadingSaldos ? "Carregando..." : "Selecione..."}</option>
                    {saldosUsaveis
                      .filter((s) => !outrasEscolhidas.has(String(s.localizacao_id)))
                      .map((s) => (
                        <option key={s.localizacao_id} value={s.localizacao_id}>
                          {s.codigo}
                          {s.descricao ? ` — ${s.descricao}` : ""} ({fmtQtd(s.saldo)} un)
                        </option>
                      ))}
                  </select>
                </label>
                <label className="cad-field baixa-modal__split-qtd">
                  <span className="cad-field__label">Qtd</span>
                  <input
                    className="cad-field__input"
                    type="text"
                    inputMode="decimal"
                    value={linha.qtd}
                    onChange={(e) => updateLinha(linha._key, "qtd", e.target.value)}
                    placeholder="0"
                  />
                </label>
                <button
                  type="button"
                  className="baixa-modal__split-remove"
                  onClick={() => removeLinha(linha._key)}
                  disabled={linhas.length === 1}
                  title="Remover localização"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <button type="button" className="baixa-modal__add" onClick={addLinha} disabled={loadingSaldos}>
          <Plus size={13} />
          Dividir com outra localização
        </button>

        <p className={`baixa-modal__total ${bateComNecessario ? "baixa-modal__total--ok" : "baixa-modal__total--diff"}`}>
          Total: {fmtQtd(qtdTotal)} un
          {qtdNecessaria != null && ` (necessário: ${fmtQtd(qtdNecessaria)} un)`}
        </p>
      </div>
    </Modal>
  );
}
