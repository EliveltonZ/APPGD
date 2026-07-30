import { useRef, useEffect, useImperativeHandle, forwardRef, type KeyboardEvent } from 'react';
import { Search, Barcode, Save, Loader2, X } from 'lucide-react';
import './index.css';

export interface ProductionHeaderHandle {
  focusStage: () => void;
}

interface Props {
  onPedido:  (code: string) => void;
  onStage:   (code: string) => void;
  hasPedido: boolean;
  loading:   boolean;
  dirty:     boolean;
  saving:    boolean;
  onSave:    () => void;
  onClear:   () => void;
}

export const ProductionHeader = forwardRef<ProductionHeaderHandle, Props>(function ProductionHeader(
  { onPedido, onStage, hasPedido, loading, dirty, saving, onSave, onClear }, ref
) {
  const pedidoRef = useRef<HTMLInputElement>(null);
  const stageRef  = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusStage: () => stageRef.current?.focus(),
  }));

  useEffect(() => {
    if (!hasPedido) return;

    let buffer   = '';
    let lastTime = 0;

    function onKey(e: globalThis.KeyboardEvent) {
      if (document.activeElement === stageRef.current)  return;
      if (document.activeElement === pedidoRef.current) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const now = Date.now();
      if (now - lastTime > 150) buffer = '';
      lastTime = now;

      if (e.key === 'Enter') {
        const code = buffer.trim();
        buffer = '';
        if (code.length >= 4) {
          onStage(code);
          setTimeout(() => stageRef.current?.focus(), 50);
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        buffer += e.key;
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasPedido, onStage]);

  function handlePedidoKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    const val = e.currentTarget.value.trim();
    e.currentTarget.value = '';
    if (val) onPedido(val);
  }

  function handleStageKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    const val = e.currentTarget.value.trim();
    e.currentTarget.value = '';
    if (val) onStage(val);
  }

  return (
    <header className="apt-header">
      <div className="apt-header__brand">
        <span className="apt-header__title">Apontamento</span>
        <span className="apt-header__sub">Produção</span>
      </div>

      <div className="apt-header__field-wrap">
        <label className="apt-header__field-label">Pedido</label>
        <div className="apt-header__input-wrap">
          {loading
            ? <Loader2 className="apt-header__icon apt-header__icon--spin" size={16} />
            : <Search  className="apt-header__icon" size={16} />
          }
          <input
            ref={pedidoRef}
            className="apt-header__input"
            type="text"
            inputMode="numeric"
            placeholder="Escanear ou digitar + Enter"
            onKeyDown={handlePedidoKey}
            disabled={loading}
            autoFocus
            autoComplete="off"
          />
          {hasPedido && (
            <button className="apt-header__clear-btn" type="button" title="Limpar pedido" onClick={onClear}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className={`apt-header__field-wrap${!hasPedido ? ' apt-header__field-wrap--disabled' : ''}`}>
        <label className="apt-header__field-label">Etapa</label>
        <div className="apt-header__input-wrap">
          <Barcode className="apt-header__icon" size={16} />
          <input
            ref={stageRef}
            className="apt-header__input"
            type="text"
            inputMode="numeric"
            placeholder="Escanear código de etapa"
            onKeyDown={handleStageKey}
            disabled={!hasPedido}
            autoComplete="off"
          />
        </div>
      </div>

      <button
        className={`apt-header__save-btn${dirty ? ' apt-header__save-btn--dirty' : ''}`}
        type="button"
        onClick={onSave}
        disabled={!dirty || saving}
        title={dirty ? 'Salvar apontamentos' : 'Sem alterações'}
      >
        {saving
          ? <Loader2 size={15} className="apt-header__icon--spin" />
          : <Save size={15} />
        }
        <span>{saving ? 'Salvando…' : 'Salvar'}</span>
        {dirty && !saving && <span className="apt-header__dirty-dot" />}
      </button>
    </header>
  );
});
