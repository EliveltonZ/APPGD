import { useState } from "react";
import { Send, Wrench, Trash2, Search, ClipboardList } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SearchSelect } from "../../../components/SearchSelect";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage, getFieldErrors } from "../../../utils/errorMessage";
import { fetchMateriaisOpcoes } from "../../../services/materiais";
import {
  criarSolicitacaoInterna,
  fetchMinhasSolicitacoesInternas,
  cancelarSolicitacaoInterna,
} from "../../../services/solicitacaoInterna";
import type { MinhaSolicitacaoInterna } from "../../../services/solicitacaoInterna";
import { fetchPendingByContract, insertPendingItem } from "../../../services/pending";
import type { PendingProject } from "../../../types/pending";
import { validateSolicitacaoInterna } from "../../../validation";
import "./index.css";

type Modo = "INTERNA" | "PEDIDO";

const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

function fmtQtd(v: number, unidade: string): string {
  return `${v.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} ${UNIDADE_LABEL[unidade] ?? unidade}`;
}

function fmtData(v: string): string {
  return new Date(v).toLocaleDateString("pt-BR");
}

function statusDe(
  item: MinhaSolicitacaoInterna,
): "PENDENTE" | "EM_ORCAMENTO" | "CANCELADA" {
  if (item.cancelada) return "CANCELADA";
  if (item.atendida_em) return "EM_ORCAMENTO";
  return "PENDENTE";
}

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_ORCAMENTO: "Em orçamento",
  CANCELADA: "Cancelada",
};

export function FabricaSolicitacaoInternaPage() {
  const toast = useToast();
  const { data: materiais = [] } = useApiData(fetchMateriaisOpcoes);
  const {
    data: minhas = [],
    loading,
    refetch,
  } = useApiData(fetchMinhasSolicitacoesInternas);

  const [modo, setModo] = useState<Modo>("INTERNA");

  const [materialId, setMaterialId] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState("");
  const [observacao, setObservacao] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [cancelando, setCancelando] = useState<MinhaSolicitacaoInterna | null>(
    null,
  );

  // ── Modo "pra um pedido" — reaproveita exatamente a mesma ação de
  // "adicionar item manual" que Itens Pedido já usa (busca + insert em
  // tblXmlConsumo), só que numa tela sem as outras capacidades daquela
  // tela (remover item, reservar, dar baixa) — segura pra dar acesso à
  // produção sem abrir o resto do PCP pra ela.
  const [contrato, setContrato] = useState("");
  const [buscandoContrato, setBuscandoContrato] = useState(false);
  const [pedidosEncontrados, setPedidosEncontrados] = useState<PendingProject[]>([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PendingProject | null>(null);
  const [materialIdPedido, setMaterialIdPedido] = useState<number | null>(null);
  const [quantidadePedido, setQuantidadePedido] = useState("");
  const [detalhesPedido, setDetalhesPedido] = useState("");
  const [errosPedido, setErrosPedido] = useState<Record<string, string>>({});
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  const materiaisOptions = materiais.map((m) => ({
    value: m.id,
    label: `${m.codigoInterno} — ${m.descricao}`,
    searchHint: m.codigoInterno,
  }));

  async function handleSubmit() {
    const resultado = validateSolicitacaoInterna({ materialId, quantidade });
    if (!resultado.valid) {
      setErrors(resultado.errors);
      toast.error(Object.values(resultado.errors)[0]);
      return;
    }
    setErrors({});
    setEnviando(true);
    try {
      await criarSolicitacaoInterna({
        material_id: materialId as number,
        quantidade: Number(quantidade.replace(",", ".")),
        observacao: observacao.trim() || null,
      });
      toast.success(
        "Solicitação enviada — já aparece em Necessidade de Compra.",
      );
      setMaterialId(null);
      setQuantidade("");
      setObservacao("");
      refetch();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) setErrors(fieldErrors);
      toast.error(getErrorMessage(err, "Erro ao enviar solicitação."));
    } finally {
      setEnviando(false);
    }
  }

  async function handleBuscarContrato() {
    if (!contrato.trim()) {
      toast.error("Informe o contrato.");
      return;
    }
    setPedidoSelecionado(null);
    setBuscandoContrato(true);
    try {
      const resultado = await fetchPendingByContract(contrato.trim());
      setPedidosEncontrados(resultado);
      if (resultado.length === 0) {
        toast.error("Nenhum pedido encontrado com este contrato.");
      } else if (resultado.length === 1) {
        setPedidoSelecionado(resultado[0]);
      }
    } catch (err) {
      setPedidosEncontrados([]);
      toast.error(getErrorMessage(err, "Erro ao buscar contrato."));
    } finally {
      setBuscandoContrato(false);
    }
  }

  async function handleEnviarPedido() {
    const erros: Record<string, string> = {};
    if (!pedidoSelecionado) erros.pedido = "Busque e selecione o pedido primeiro.";
    if (!materialIdPedido) erros.materialIdPedido = "Material é obrigatório";
    const qtd = Number(quantidadePedido.replace(",", "."));
    if (!qtd || qtd <= 0) erros.quantidadePedido = "Quantidade deve ser maior que zero";
    if (Object.keys(erros).length > 0) {
      setErrosPedido(erros);
      toast.error(Object.values(erros)[0]);
      return;
    }
    setErrosPedido({});
    setEnviandoPedido(true);
    try {
      await insertPendingItem(pedidoSelecionado!.id, {
        materialId: materialIdPedido as number,
        quantidade: qtd,
        detalhes: detalhesPedido.trim() || null,
      });
      toast.success(
        `Item adicionado ao pedido ${pedidoSelecionado!.numOC} — se não tiver estoque, já aparece em Necessidade de Compra.`,
      );
      setMaterialIdPedido(null);
      setQuantidadePedido("");
      setDetalhesPedido("");
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) setErrosPedido(fieldErrors);
      toast.error(getErrorMessage(err, "Erro ao adicionar item ao pedido."));
    } finally {
      setEnviandoPedido(false);
    }
  }

  async function confirmarCancelamento() {
    if (!cancelando) return;
    try {
      await cancelarSolicitacaoInterna(cancelando.id);
      toast.success("Solicitação cancelada.");
      setCancelando(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao cancelar solicitação."));
    }
  }

  const columns: TableColumn<MinhaSolicitacaoInterna>[] = [
    {
      key: "id",
      label: "ID",
      type: "text",
      sortable: true,
      align: "center",
      minWidth: 60,
    },
    {
      key: "codigo_interno",
      label: "Código",
      type: "text",
      sortable: true,
      filterable: true,
      minWidth: 100,
    },
    {
      key: "material_descricao",
      label: "Descrição",
      type: "text",
      sortable: true,
      filterable: true,
      minWidth: 200,
    },
    {
      key: "solicitante_login",
      label: "Responsável",
      type: "text",
      sortable: true,
      filterable: true,
      minWidth: 130,
    },
    {
      key: "quantidade",
      label: "Quantidade",
      type: "text",
      align: "right",
      minWidth: 110,
      render: (_v, row) => fmtQtd(row.quantidade, row.unidade_base),
    },
    {
      key: "data_solicitacao",
      label: "Solicitado em",
      type: "text",
      align: "center",
      minWidth: 100,
      render: (v) => fmtData(v as string),
    },
    {
      key: "observacao",
      label: "Observação",
      type: "text",
      minWidth: 180,
      render: (v) => (v as string) || "—",
    },
    {
      key: "cancelada",
      label: "Status",
      type: "text",
      align: "center",
      minWidth: 110,
      render: (_v, row) => {
        const status = statusDe(row);
        return (
          <span
            className={`si-status-badge si-status-badge--${status.toLowerCase()}`}
          >
            {STATUS_LABEL[status]}
          </span>
        );
      },
    },
    {
      key: "atendida_em",
      label: "Ações",
      type: "text",
      align: "center",
      minWidth: 80,
      render: (_v, row) =>
        statusDe(row) === "PENDENTE" ? (
          <button
            type="button"
            className="si-action-btn"
            title="Cancelar solicitação"
            onClick={() => setCancelando(row)}
          >
            <Trash2 size={13} />
          </button>
        ) : null,
    },
  ];

  return (
    <AppLayout pageTitle="Solicitação Interna">
      <div className="si-page">
        <div className="si-page__top">
          <div>
            <h1 className="si-page__title">Solicitação de Material</h1>
            <p className="si-page__subtitle">
              Escolha abaixo se é um pedido avulso (ferramenta, peça de máquina, EPI, limpeza, acabamento,
              botijão da empilhadeira etc. — sem nenhum pedido de venda por trás) ou uma reposição para um
              pedido específico (ex: uma chapa que estragou na produção). Nos dois casos, se não tiver
              estoque, já cai em Necessidade de Compra.
            </p>
          </div>
        </div>

        <div className="si-modo-chips">
          <button
            type="button"
            className={`si-modo-chip${modo === "INTERNA" ? " si-modo-chip--ativo" : ""}`}
            onClick={() => setModo("INTERNA")}
          >
            <Wrench size={13} /> Solicitação interna (sem pedido)
          </button>
          <button
            type="button"
            className={`si-modo-chip${modo === "PEDIDO" ? " si-modo-chip--ativo" : ""}`}
            onClick={() => setModo("PEDIDO")}
          >
            <ClipboardList size={13} /> Reposição para um pedido específico
          </button>
        </div>

        {modo === "INTERNA" ? (
          <section className="si-form">
            <div className="pfield">
              <label>Material *</label>
              <SearchSelect
                options={materiaisOptions}
                value={materialId}
                onChange={setMaterialId}
                placeholder="Buscar material (nome ou código)..."
              />
              {errors.materialId && (
                <span className="si-field-error">{errors.materialId}</span>
              )}
            </div>

            <div className="si-form__row">
              <Input
                label="Quantidade *"
                type="text"
                inputMode="decimal"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0"
                error={errors.quantidade}
              />
              <Input
                label="Observação"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Opcional — ex: botijão vazio da empilhadeira 2"
              />
            </div>

            <Button
              variant="primary"
              loading={enviando}
              onClick={handleSubmit}
              style={{ alignSelf: "flex-start" }}
            >
              <Send size={14} />
              Enviar Solicitação
            </Button>
          </section>
        ) : (
          <section className="si-form">
            <div className="si-form__row">
              <Input
                label="Contrato *"
                value={contrato}
                onChange={(e) => setContrato(e.target.value)}
                placeholder="Número do contrato"
                error={errosPedido.pedido}
              />
              <Button
                variant="secondary"
                loading={buscandoContrato}
                onClick={handleBuscarContrato}
                style={{ alignSelf: "flex-end" }}
              >
                <Search size={14} />
                Buscar
              </Button>
            </div>

            {pedidosEncontrados.length > 1 && (
              <div className="si-pedidos-lista">
                {pedidosEncontrados.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`si-pedido-item${pedidoSelecionado?.id === p.id ? " si-pedido-item--ativo" : ""}`}
                    onClick={() => setPedidoSelecionado(p)}
                  >
                    <strong>OC {p.numOC}</strong> — {p.ambiente} — {p.cliente}
                  </button>
                ))}
              </div>
            )}

            {pedidoSelecionado && (
              <p className="si-pedido-selecionado">
                Pedido selecionado: <strong>OC {pedidoSelecionado.numOC}</strong> — {pedidoSelecionado.ambiente} —{" "}
                {pedidoSelecionado.cliente}
              </p>
            )}

            <div className="pfield">
              <label>Material *</label>
              <SearchSelect
                options={materiaisOptions}
                value={materialIdPedido}
                onChange={setMaterialIdPedido}
                placeholder="Buscar material (nome ou código)..."
              />
              {errosPedido.materialIdPedido && (
                <span className="si-field-error">{errosPedido.materialIdPedido}</span>
              )}
            </div>

            <div className="si-form__row">
              <Input
                label="Quantidade *"
                type="text"
                inputMode="decimal"
                value={quantidadePedido}
                onChange={(e) => setQuantidadePedido(e.target.value)}
                placeholder="0"
                error={errosPedido.quantidadePedido}
              />
              <Input
                label="Detalhes"
                value={detalhesPedido}
                onChange={(e) => setDetalhesPedido(e.target.value)}
                placeholder="Opcional — ex: chapa riscada durante o corte"
              />
            </div>

            <Button
              variant="primary"
              loading={enviandoPedido}
              onClick={handleEnviarPedido}
              style={{ alignSelf: "flex-start" }}
            >
              <Send size={14} />
              Adicionar ao Pedido
            </Button>
          </section>
        )}

        <section className="si-section">
          <h2 className="si-section__title">
            <Wrench size={14} /> Minhas solicitações recentes
          </h2>
          <DataTable
            columns={columns}
            data={minhas}
            rowKey="id"
            loading={loading}
            storageKey="fabrica-solicitacao-interna"
            emptyMessage="Você ainda não fez nenhuma solicitação interna."
          />
        </section>
      </div>

      <ConfirmModal
        isOpen={!!cancelando}
        message={
          cancelando
            ? `Cancelar a solicitação de "${cancelando.codigo_interno}" (${fmtQtd(cancelando.quantidade, cancelando.unidade_base)})?`
            : ""
        }
        confirmLabel="Cancelar"
        onConfirm={confirmarCancelamento}
        onCancel={() => setCancelando(null)}
      />
    </AppLayout>
  );
}
