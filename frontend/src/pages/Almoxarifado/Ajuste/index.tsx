import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { SearchSelect } from "../../../components/SearchSelect";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorMessage";
import { fmtDateTime } from "../../../utils/dateUtils";
import { fetchLocalizacoes } from "../../../services/localizacoes";
import { fetchMateriaisOpcoes } from "../../../services/materiais";
import { fetchSaldoLocalizacao, criarAjusteEstoque, fetchHistoricoAjustes } from "../../../services/estoque";
import type { HistoricoAjusteItem } from "../../../services/estoque";
import "./index.css";

function fmtQtd(v: number): string {
  return Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

const HISTORICO_COLUMNS: TableColumn<HistoricoAjusteItem>[] = [
  { key: "data", label: "Data/Hora", type: "text", sortable: true, minWidth: 130, render: (v) => fmtDateTime(String(v)) },
  { key: "codigo_interno", label: "Código", type: "text", sortable: true, filterable: true, minWidth: 90 },
  { key: "material_descricao", label: "Material", type: "text", sortable: true, filterable: true, minWidth: 200 },
  {
    key: "localizacao_codigo",
    label: "Localização",
    type: "text",
    sortable: true,
    filterable: true,
    minWidth: 130,
    render: (v, row) => `${v}${row.localizacao_descricao ? ` — ${row.localizacao_descricao}` : ""}`,
  },
  {
    key: "qtd_un",
    label: "Diferença",
    type: "number",
    sortable: true,
    align: "right",
    minWidth: 100,
    render: (v) => {
      const n = Number(v);
      return (
        <span className={n > 0 ? "aju-diferenca--positiva" : "aju-diferenca--negativa"}>
          {n > 0 ? "+" : ""}
          {fmtQtd(n)}
        </span>
      );
    },
  },
  { key: "usuario_login", label: "Usuário", type: "text", sortable: true, filterable: true, minWidth: 120 },
  { key: "observacoes", label: "Observações", type: "text", minWidth: 160, render: (v) => (v ? String(v) : "—") },
];

export function AlmoxarifadoAjustePage() {
  const toast = useToast();
  const { data: localizacoes = [] } = useApiData(fetchLocalizacoes);
  const { data: materiais = [] } = useApiData(fetchMateriaisOpcoes);
  const { data: historico = [], loading: loadingHistorico, refetch: refetchHistorico } = useApiData(fetchHistoricoAjustes);

  const [localizacaoId, setLocalizacaoId] = useState("");
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [saldoAtual, setSaldoAtual] = useState<number | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [contagem, setContagem] = useState("");
  const [precoUn, setPrecoUn] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    if (precoUn.trim()) {
      const precoNum = Number(precoUn.replace(",", "."));
      if (!Number.isFinite(precoNum) || precoNum <= 0) {
        toast.error("Informe um preço unitário válido (maior que zero), ou deixe em branco.");
        return;
      }
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
        preco_un: precoUn.trim() ? Number(precoUn.replace(",", ".")) : null,
      });

      const partes: string[] = [];
      if (resultado.ajustado) {
        partes.push(
          `Ajuste lançado: ${resultado.diferenca > 0 ? "+" : ""}${fmtQtd(resultado.diferenca)} un (saldo agora ${fmtQtd(resultado.saldoNovo)} un).`,
        );
      } else {
        partes.push("Contagem bate com o sistema — nenhum ajuste de quantidade necessário.");
      }
      if (resultado.precoAtualizado) {
        partes.push("Preço unitário do material atualizado.");
      }
      toast.success(partes.join(" "));
      if (resultado.ajustado || resultado.precoAtualizado) refetchHistorico();

      // mantém a localização selecionada (contagem costuma ser por prateleira,
      // um material atrás do outro) e limpa só o material/contagem/preço
      setMaterialId(null);
      setContagem("");
      setPrecoUn("");
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
            label="Preço unitário"
            type="text"
            inputMode="decimal"
            value={precoUn}
            onChange={(e) => setPrecoUn(e.target.value)}
            placeholder="Opcional — pra item sem nenhuma nota fiscal ainda"
          />
          {precoUn.trim() && (
            <p className="aju-hint">
              Vira o preço vigente deste material (até uma nota fiscal real vir com data mais nova e substituir).
            </p>
          )}

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
          <h2 className="aju-panel-title">Histórico de ajustes</h2>
          <p className="aju-hint">
            Filtre por material (coluna Código/Material) ou por usuário pra consultar ajustes anteriores.
          </p>
          <DataTable
            columns={HISTORICO_COLUMNS}
            data={historico}
            rowKey="id"
            loading={loadingHistorico}
            storageKey="almoxarifado-ajuste-historico"
            emptyMessage="Nenhum ajuste lançado ainda."
          />
        </section>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        message={
          (diferenca === 0
            ? "A contagem bate com o sistema — nenhum ajuste de quantidade será lançado."
            : `Isso vai lançar um ajuste de ${diferenca != null && diferenca > 0 ? "+" : ""}${diferenca != null ? fmtQtd(diferenca) : ""} un (saldo vai de ${saldoAtual != null ? fmtQtd(saldoAtual) : "—"} pra ${contagemNum != null ? fmtQtd(contagemNum) : "—"}).`) +
          (precoUn.trim() ? ` Também vai gravar R$ ${precoUn} como preço unitário vigente deste material.` : "") +
          " Confirmar?"
        }
        confirmLabel="Confirmar"
        onConfirm={handleConfirmar}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppLayout>
  );
}
