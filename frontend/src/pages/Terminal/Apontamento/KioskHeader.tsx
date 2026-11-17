import { useRef, useState, type KeyboardEvent } from "react";
import { Search, Barcode, Save, Loader2, X, IdCard } from "lucide-react";
import type { Operator } from "../../../features/apontamento/types";

interface Props {
  onPedido: (code: string) => void;
  onStage: (code: string) => void;
  hasPedido: boolean;
  loading: boolean;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onClear: () => void;
  operadorAtual: Operator | null;
}

// Header do terminal público — igual ao ProductionHeader (Apontamento
// autenticado), mas sem o listener global de "stage" embutido: aqui quem
// controla o único listener de teclado (pedido/etapa/crachá, todos lidos
// pelo mesmo leitor) é a página, pra não ter dois listeners brigando pelo
// mesmo código escaneado.
export function KioskHeader({
  onPedido,
  onStage,
  hasPedido,
  loading,
  dirty,
  saving,
  onSave,
  onClear,
  operadorAtual,
}: Props) {
  const pedidoRef = useRef<HTMLInputElement>(null);
  const [pedidoInput, setPedidoInput] = useState("");
  const [stageInput, setStageInput] = useState("");

  function handlePedidoKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const val = e.currentTarget.value.trim();
    setPedidoInput("");
    if (val) onPedido(val);
  }

  function handleStageKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const val = e.currentTarget.value.trim();
    setStageInput("");
    if (val) onStage(val);
  }

  return (
    <header className="apt-header">
      <div className="apt-header__brand">
        <span className="apt-header__title">Apontamento</span>
        <span className="apt-header__sub">Terminal</span>
      </div>

      <div className="kiosk-header__operador">
        <IdCard size={16} className="kiosk-header__operador-icon" />
        <div>
          <span className="kiosk-header__operador-lbl">Operador</span>
          <span
            className={`kiosk-header__operador-nome${!operadorAtual ? " kiosk-header__operador-nome--empty" : ""}`}
          >
            {operadorAtual ? operadorAtual.nome : "Escaneie o crachá"}
          </span>
        </div>
      </div>

      <div className="apt-header__field-wrap">
        <label className="apt-header__field-label">Pedido</label>
        <div className="apt-header__input-wrap">
          {loading ? (
            <Loader2 className="apt-header__icon apt-header__icon--spin" size={16} />
          ) : (
            <Search className="apt-header__icon" size={16} />
          )}
          <input
            ref={pedidoRef}
            className="apt-header__input"
            type="text"
            inputMode="numeric"
            placeholder="Escanear ou digitar + Enter"
            value={pedidoInput}
            onChange={(e) => setPedidoInput(e.target.value)}
            onKeyDown={handlePedidoKey}
            disabled={loading}
            autoComplete="off"
          />
          {hasPedido && (
            <button
              className="apt-header__clear-btn"
              type="button"
              title="Limpar pedido"
              onClick={onClear}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div
        className={`apt-header__field-wrap${!hasPedido ? " apt-header__field-wrap--disabled" : ""}`}
      >
        <label className="apt-header__field-label">Etapa</label>
        <div className="apt-header__input-wrap">
          <Barcode className="apt-header__icon" size={16} />
          <input
            className="apt-header__input"
            type="text"
            inputMode="numeric"
            placeholder="Escanear código de etapa"
            value={stageInput}
            onChange={(e) => setStageInput(e.target.value)}
            onKeyDown={handleStageKey}
            disabled={!hasPedido}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="apt-header_buttons">
        <button
          className={`apt-header__save-btn${dirty ? " apt-header__save-btn--dirty" : ""}`}
          type="button"
          onClick={onSave}
          disabled={!dirty || saving}
          title={dirty ? "Salvar apontamentos" : "Sem alterações"}
        >
          {saving ? (
            <Loader2 size={15} className="apt-header__icon--spin" />
          ) : (
            <Save size={15} />
          )}
          <span>{saving ? "Salvando…" : "Salvar"}</span>
          {dirty && !saving && <span className="apt-header__dirty-dot" />}
        </button>
      </div>
    </header>
  );
}
