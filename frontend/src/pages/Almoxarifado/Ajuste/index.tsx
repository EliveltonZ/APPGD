import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { SearchSelect } from "../../../components/SearchSelect";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorMessage";
import { fetchLocalizacoes } from "../../../services/localizacoes";
import { fetchMateriaisOpcoes } from "../../../services/materiais";
import { fetchSaldoLocalizacao, criarAjusteEstoque } from "../../../services/estoque";
import "./index.css";

interface AjusteFeito {
  _key: number;
  codigoInterno: string;
  descricao: string;
  localizacaoCodigo: string;
  saldoAnterior: number;
  saldoNovo: number;
  diferenca: number;
  hora: string;
}

function fmtQtd(v: number): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

let nextKey = 1;

export function AlmoxarifadoAjustePage() {
  const toast = useToast();
  const { data: localizacoes = [] } = useApiData(fetchLocalizacoes);
  const { data: materiais = [] } = useApiData(fetchMateriaisOpcoes);

  const [localizacaoId, setLocalizacaoId] = useState("");
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [saldoAtual, setSaldoAtual] = useState<number | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [contagem, setContagem] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [sessao, setSessao] = useState<AjusteFeito[]>([]);

  const localizacoesOptions = localizacoes
    .filter((l) => l.ativo)
    .map((l) => ({ value: l.id, label: `${l.codigo}${l.descricao ? ` — ${l.descricao}` : ""}` }));
  const materiaisOptions = materiais.map((m) => ({
    value: m.id,
    label: `${m.codigoInterno} — ${m.descricao}`,
    searchHint: m.codigoInterno,
  }));

  async function carregarSaldo(novoMaterialId: number | null, novaLocalizacaoId: string) {
    if (!novoMaterialId || !novaLocalizacaoId) {
      setSaldoAtual(null);
      return;
    }
    setLoadingSaldo(true);
    try {
      const { saldo } = await fetchSaldoLocalizacao(novoMaterialId, Number(novaLocalizacaoId));
      setSaldoAtual(saldo);
    } catch {
      setSaldoAtual(null);
    } finally {
      setLoadingSaldo(false);
    }
  }

  function handleMaterialChange(id: number | null) {
    setMaterialId(id);
    carregarSaldo(id, localizacaoId);
  }

  function handleLocalizacaoChange(id: string) {
    setLocalizacaoId(id);
    carregarSaldo(materialId, id);
  }

  const contagemNum = contagem.trim() ? Number(contagem.replace(",", ".")) : null;
  const diferenca =
    contagemNum != null && saldoAtual != null ? Math.round((contagemNum - saldoAtual) * 1000) / 1000 : null;

  function handleLancar() {
    if (!materialId) {
      toast.error("Selecione o material.");
      return;
    }
    if (!localizacaoId) {
      toast.error("Selecione a localização.");
      return;
    }
    if (contagemNum == null || Number.isNaN(contagemNum) || contagemNum < 0) {
      toast.error("Informe a quantidade contada (zero ou mais).");
      return;
    }
    setConfirmOpen(true);
  }

  async function handleConfirmar() {
    if (!materialId || !localizacaoId || contagemNum == null) return;
    setConfirmOpen(false);
    setSaving(true);
    try {
      const resultado = await criarAjusteEstoque({
        material_id: materialId,
        localizacao_id: Number(localizacaoId),
        contagem: contagemNum,
        observacoes: observacoes.trim() || null,
      });

      const material = materiais.find((m) => m.id === materialId);
      const localizacao = localizacoes.find((l) => String(l.id) === localizacaoId);

      if (resultado.ajustado) {
        setSessao((prev) => [
          {
            _key: nextKey++,
            codigoInterno: material?.codigoInterno ?? "",
            descricao: material?.descricao ?? "",
            localizacaoCodigo: localizacao?.codigo ?? "",
            saldoAnterior: resultado.saldoAnterior,
            saldoNovo: resultado.saldoNovo,
            diferenca: resultado.diferenca,
            hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          },
          ...prev,
        ]);
        toast.success(
          `Ajuste lançado: ${resultado.diferenca > 0 ? "+" : ""}${fmtQtd(resultado.diferenca)} un (saldo agora ${fmtQtd(resultado.saldoNovo)} un).`,
        );
      } else {
        toast.success("Contagem bate com o sistema — nenhum ajuste necessário.");
      }

      // mantém a localização selecionada (contagem costuma ser por prateleira,
      // um material atrás do outro) e limpa só o material/contagem
      setMaterialId(null);
      setContagem("");
      setObservacoes("");
      setSaldoAtual(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao lançar ajuste."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout pageTitle="Ajuste de Estoque">
      <div className="aju-page">
        <aside className="aju-form-panel">
          <h2 className="aju-panel-title">Ajuste por contagem</h2>
          <p className="aju-hint">
            Pra inventário periódico — conte o que tem de verdade numa localização, o sistema calcula a diferença
            contra o saldo atual e lança o ajuste sozinho.
          </p>

          <div className="aju-divider" />

          <Select
            label="Localização *"
            options={localizacoesOptions}
            value={localizacaoId}
            onChange={(e) => handleLocalizacaoChange(e.target.value)}
            placeholder="Selecione..."
          />

          <div className="pfield">
            <label>Material *</label>
            <SearchSelect
              options={materiaisOptions}
              value={materialId}
              onChange={handleMaterialChange}
              placeholder="Buscar material (nome ou código)..."
            />
          </div>

          {materialId && localizacaoId && (
            <p className="aju-saldo">
              {loadingSaldo ? "Carregando saldo..." : `Saldo no sistema: ${saldoAtual != null ? fmtQtd(saldoAtual) : "—"} un`}
            </p>
          )}

          <Input
            label="Quantidade contada *"
            type="text"
            inputMode="decimal"
            value={contagem}
            onChange={(e) => setContagem(e.target.value)}
            placeholder="0"
          />

          {diferenca != null && diferenca !== 0 && (
            <p className={`aju-diferenca ${diferenca > 0 ? "aju-diferenca--positiva" : "aju-diferenca--negativa"}`}>
              {diferenca > 0 ? "Entrada" : "Saída"} de {fmtQtd(Math.abs(diferenca))} un
            </p>
          )}
          {diferenca === 0 && <p className="aju-hint">Bate com o sistema — nenhum ajuste será lançado.</p>}

          <Input
            label="Observações"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Opcional — ex: Inventário trimestral"
          />

          <Button variant="primary" loading={saving} onClick={handleLancar} style={{ width: "100%", marginTop: 8 }}>
            <ClipboardCheck size={14} />
            Lançar ajuste
          </Button>
        </aside>

        <section className="aju-sessao-panel">
          <h2 className="aju-panel-title">Ajustes desta sessão</h2>
          {sessao.length === 0 ? (
            <p style={{ padding: "12px 0", opacity: 0.5, fontSize: 13 }}>Nenhum ajuste lançado ainda.</p>
          ) : (
            <div className="aju-sessao-lista">
              {sessao.map((a) => (
                <div key={a._key} className="aju-sessao-item">
                  <div className="aju-sessao-item__info">
                    <strong>{a.codigoInterno}</strong> — {a.descricao}
                    <span className="aju-sessao-item__detalhe">
                      {a.localizacaoCodigo} · {fmtQtd(a.saldoAnterior)} → {fmtQtd(a.saldoNovo)} un · {a.hora}
                    </span>
                  </div>
                  <span className={`aju-sessao-item__diff ${a.diferenca > 0 ? "aju-diferenca--positiva" : "aju-diferenca--negativa"}`}>
                    {a.diferenca > 0 ? "+" : ""}
                    {fmtQtd(a.diferenca)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        message={
          diferenca === 0
            ? "A contagem bate com o sistema — nenhum ajuste será lançado. Confirmar mesmo assim?"
            : `Isso vai lançar um ajuste de ${diferenca != null && diferenca > 0 ? "+" : ""}${diferenca != null ? fmtQtd(diferenca) : ""} un (saldo vai de ${saldoAtual != null ? fmtQtd(saldoAtual) : "—"} pra ${contagemNum != null ? fmtQtd(contagemNum) : "—"}). Confirmar?`
        }
        confirmLabel="Confirmar"
        onConfirm={handleConfirmar}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppLayout>
  );
}
