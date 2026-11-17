import { useState, useEffect, useCallback } from "react";
import { KeySquare, RefreshCw, Copy, Check } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useToast } from "../../../context/ToastContext";
import { fetchKioskPin, gerarKioskPin } from "../../../services/kioskPin";
import type { KioskPinInfo } from "../../../services/kioskPin";
import { getErrorMessage } from "../../../utils/errorMessage";
import { fmtDateTime } from "../../../utils/dateUtils";
import "./index.css";

export function ConfigTerminalPinPage() {
  const toast = useToast();
  const [info, setInfo] = useState<KioskPinInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchKioskPin()
      .then(setInfo)
      .catch(() => toast.error("Erro ao carregar o PIN do terminal."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGerar() {
    setConfirmOpen(false);
    setGerando(true);
    try {
      const novo = await gerarKioskPin();
      setInfo(novo);
      setCopiado(false);
      toast.success("Novo PIN gerado — o PIN anterior parou de funcionar.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao gerar novo PIN."));
    } finally {
      setGerando(false);
    }
  }

  function handleCopy() {
    if (!info) return;
    navigator.clipboard.writeText(info.pin).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <AppLayout pageTitle="PIN do Terminal">
      <div className="tp-page">
        <div className="tp-page__top">
          <KeySquare size={18} className="tp-page__icon" />
          <div>
            <h1 className="tp-page__title">PIN do Terminal</h1>
            <p className="tp-page__subtitle">
              PIN usado uma única vez para liberar o terminal público de
              apontamento (sem login). Repasse só para quem for configurar
              o terminal — quem tiver o PIN consegue abrir e usar a tela lá.
            </p>
          </div>
        </div>

        <div className="tp-card">
          {loading ? (
            <p className="tp-card__loading">Carregando...</p>
          ) : info ? (
            <>
              <div className="tp-card__pin-row">
                <span className="tp-card__pin">{info.pin}</span>
                <button
                  type="button"
                  className="tp-card__copy-btn"
                  onClick={handleCopy}
                  title="Copiar PIN"
                >
                  {copiado ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
              <p className="tp-card__meta">
                Gerado em {fmtDateTime(info.atualizadoEm)}
              </p>
            </>
          ) : (
            <p className="tp-card__empty">
              Nenhum PIN gerado ainda — gere um para liberar o terminal.
            </p>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={gerando}
          >
            <RefreshCw size={14} />
            {info ? "Gerar novo PIN" : "Gerar PIN"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        message={
          info
            ? "Gerar um novo PIN? O PIN atual para de funcionar imediatamente — qualquer terminal configurado com ele vai precisar do novo."
            : "Gerar o primeiro PIN do terminal?"
        }
        confirmLabel={gerando ? "Gerando..." : "Gerar"}
        onConfirm={handleGerar}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppLayout>
  );
}
