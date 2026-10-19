import { useState } from "react";
import { Pencil, Trash2, Link2 } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import { Modal } from "../../../components/Modal";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { SearchSelect } from "../../../components/SearchSelect";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorMessage";
import { fetchMateriaisOpcoes } from "../../../services/materiais";
import {
  fetchVinculos,
  atualizarVinculo,
  excluirVinculo,
} from "../../../services/notaFiscal";
import type { VinculoListItem } from "../../../services/notaFiscal";
import "./index.css";

const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

function fmtFator(v: VinculoListItem): string {
  if (v.m2_por_unidade == null) return "—";
  const rotulo = v.unidade_base === "M" ? "m/rolo" : v.unidade_base === "M2" ? "m²/chapa" : "";
  return `${v.m2_por_unidade.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}${rotulo ? ` ${rotulo}` : ""}`;
}

export function AlmoxarifadoVinculosPage() {
  const toast = useToast();
  const { data: vinculos = [], loading, refetch } = useApiData(fetchVinculos);
  const { data: materiais = [] } = useApiData(fetchMateriaisOpcoes);

  const [editando, setEditando] = useState<VinculoListItem | null>(null);
  const [novoMaterialId, setNovoMaterialId] = useState<number | null>(null);
  const [novoFator, setNovoFator] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState<VinculoListItem | null>(null);

  const materiaisOptions = materiais.map((m) => ({
    value: m.id,
    label: `${m.codigoInterno} — ${m.descricao}`,
    searchHint: m.codigoInterno,
  }));

  function abrirEdicao(v: VinculoListItem) {
    setEditando(v);
    setNovoMaterialId(v.material_id);
    setNovoFator(v.m2_por_unidade != null ? String(v.m2_por_unidade) : "");
  }

  async function salvarEdicao() {
    if (!editando || !novoMaterialId) return;
    setSalvando(true);
    try {
      await atualizarVinculo(editando.id, {
        material_id: novoMaterialId,
        m2_por_unidade: novoFator.trim() ? Number(novoFator.replace(",", ".")) : null,
      });
      toast.success("Vínculo atualizado.");
      setEditando(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao atualizar vínculo."));
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    if (!excluindo) return;
    try {
      await excluirVinculo(excluindo.id);
      toast.success("Vínculo removido.");
      setExcluindo(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao remover vínculo."));
    }
  }

  const columns: TableColumn<VinculoListItem>[] = [
    { key: "fornecedor_nome", label: "Fornecedor", type: "text", sortable: true, filterable: true, minWidth: 180 },
    { key: "codigo_nf", label: "Código do Fornecedor", type: "text", sortable: true, filterable: true, minWidth: 140 },
    { key: "codigo_interno", label: "Material", type: "text", sortable: true, filterable: true, minWidth: 110 },
    { key: "material_descricao", label: "Descrição", type: "text", sortable: true, filterable: true, minWidth: 220 },
    {
      key: "unidade_compra",
      label: "Unid. Compra",
      type: "text",
      align: "center",
      minWidth: 100,
    },
    {
      key: "m2_por_unidade",
      label: "Fator",
      type: "text",
      align: "right",
      minWidth: 120,
      render: (_v, row) => fmtFator(row),
    },
    {
      key: "id",
      label: "Ações",
      type: "text",
      align: "center",
      minWidth: 90,
      render: (_v, row) => (
        <div className="vinc-actions">
          <button type="button" className="vinc-action-btn" title="Editar vínculo" onClick={() => abrirEdicao(row)}>
            <Pencil size={13} />
          </button>
          <button type="button" className="vinc-action-btn" title="Remover vínculo" onClick={() => setExcluindo(row)}>
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout pageTitle="Vínculos de Nota Fiscal">
      <div className="vinc-page">
        <div className="vinc-page__top">
          <div>
            <h1 className="vinc-page__title">Vínculos de Nota Fiscal</h1>
            <p className="vinc-page__subtitle">
              Associação entre o código do fornecedor e o material do cadastro, usada pra casar itens
              automaticamente ao importar uma nota fiscal. Corrija aqui um vínculo feito errado — material
              trocado, ou fator de conversão (metros por rolo / m² por chapa) incorreto.
            </p>
          </div>
        </div>

        <div className="vinc-summary">
          <SummaryCard
            label="Vínculos cadastrados"
            value={vinculos.length}
            accent="var(--text-h)"
            icon={<Link2 size={13} />}
            loading={loading}
          />
        </div>

        <DataTable
          columns={columns}
          data={vinculos}
          rowKey="id"
          loading={loading}
          storageKey="almoxarifado-vinculos"
          emptyMessage="Nenhum vínculo salvo ainda."
        />
      </div>

      <Modal
        title="Editar vínculo"
        isOpen={!!editando}
        onClose={() => setEditando(null)}
        maxWidth={460}
        footer={
          <div className="cad-modal-footer">
            <div className="cad-modal-footer__right">
              <Button variant="ghost" size="sm" onClick={() => setEditando(null)} disabled={salvando}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" loading={salvando} disabled={!novoMaterialId} onClick={salvarEdicao}>
                Salvar
              </Button>
            </div>
          </div>
        }
      >
        {editando && (
          <div className="cad-modal-body">
            <p className="vinc-edit__info">
              <strong>{editando.fornecedor_nome}</strong> — código <strong>{editando.codigo_nf}</strong>
              {" "}(comprado em {UNIDADE_LABEL[editando.unidade_compra] ?? editando.unidade_compra})
            </p>

            <div className="pfield">
              <label>Material vinculado *</label>
              <SearchSelect
                options={materiaisOptions}
                value={novoMaterialId}
                onChange={setNovoMaterialId}
                placeholder="Buscar material (nome ou código)..."
              />
            </div>

            <Input
              label="Fator de conversão"
              type="text"
              inputMode="decimal"
              value={novoFator}
              onChange={(e) => setNovoFator(e.target.value)}
              placeholder="Ex: 20 (metros/rolo) ou 5,0416 (m²/chapa)"
            />
            <span className="vinc-edit__hint">
              Deixe em branco se esse material não precisa de fator (ferragem, ou chapa/fita já compradas
              direto na unidade de estoque).
            </span>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!excluindo}
        message={
          excluindo
            ? `Remover o vínculo entre "${excluindo.fornecedor_nome}" (código ${excluindo.codigo_nf}) e "${excluindo.codigo_interno}"? Próximas notas desse fornecedor com esse código vão pedir pra vincular de novo.`
            : ""
        }
        confirmLabel="Remover"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluindo(null)}
      />
    </AppLayout>
  );
}
