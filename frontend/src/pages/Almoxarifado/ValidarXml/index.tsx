import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Upload, Link2, Trash2, Plus } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import { Button } from "../../../components/Button";
import { SearchSelect } from "../../../components/SearchSelect";
import { SummaryCard } from "../../../components/SummaryCard";
import { Modal } from "../../../components/Modal";
import { Input } from "../../../components/Input";
import { useToast } from "../../../context/ToastContext";
import { useApiData } from "../../../hooks/useApiData";
import { fetchMateriaisOpcoes } from "../../../services/materiais";
import { previewXml, vincularReferencia } from "../../../services/estoqueXml";
import type { ItemXml, ItemXmlTipo } from "../../../services/estoqueXml";
import { getErrorMessage } from "../../../utils/errorMessage";
import "./index.css";

interface Row extends ItemXml {
  id: string;
}

const TIPO_LABEL: Record<string, string> = {
  CHAPA: "Chapa",
  FITA: "Fita",
  FERRAGEM: "Ferragem",
};
const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };
const TIPO_POR_UNIDADE: Record<string, ItemXmlTipo> = {
  M2: "CHAPA",
  M: "FITA",
  UN: "FERRAGEM",
};

export function AlmoxarifadoValidarXmlPage() {
  const toast = useToast();
  const { data: materiais = [] } = useApiData(fetchMateriaisOpcoes);
  const materiaisOptions = materiais.map((m) => ({
    value: m.id,
    label: `${m.codigoInterno} — ${m.descricao}`,
    searchHint: m.codigoInterno,
  }));

  const [cliente, setCliente] = useState<{
    codigo: string | null;
    nome: string | null;
  } | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [nomeArquivo, setNomeArquivo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addMaterialId, setAddMaterialId] = useState<number | null>(null);
  const [addQuantidade, setAddQuantidade] = useState("");

  const semMaterial = rows.filter((r) => r.materialId == null).length;

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNomeArquivo(file.name);
    setLoading(true);
    try {
      const xml = await file.text();
      const result = await previewXml(xml);
      setCliente(result.cliente);
      const itensOrdenados = [...result.itens].sort((a, b) =>
        a.descricao.localeCompare(b.descricao, "pt-BR"),
      );
      setRows(
        itensOrdenados.map((item, i) => ({
          ...item,
          id: `${item.tipo}-${item.referencia}-${i}`,
        })),
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao ler o XML."));
      setRows([]);
      setCliente(null);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function trocarMaterial(id: string, materialId: number | null) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, materialId } : r)),
    );
  }

  async function vincularMaterial(row: Row) {
    if (!row.materialId) return;
    try {
      await vincularReferencia(row.referencia, row.materialId);
      toast.success(
        `Referência "${row.referencia}" vinculada — próximas importações já virão casadas.`,
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao vincular."));
    }
  }

  function excluirLinha(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function abrirAdicionar() {
    setAddMaterialId(null);
    setAddQuantidade("");
    setAddOpen(true);
  }

  function confirmarAdicionar() {
    const material = materiais.find((m) => m.id === addMaterialId);
    if (!material) {
      toast.error("Escolha um material.");
      return;
    }
    const quantidade = Number(addQuantidade.replace(",", "."));
    if (!quantidade || quantidade <= 0) {
      toast.error("Informe uma quantidade válida.");
      return;
    }
    const novaLinha: Row = {
      id: `manual-${material.id}-${Date.now()}`,
      tipo: TIPO_POR_UNIDADE[material.unidadeBase] ?? "FERRAGEM",
      descricao: material.descricao,
      referencia: material.codigoInterno,
      unidade: material.unidadeBase,
      quantidade,
      ambiente: null,
      material: null,
      cor: null,
      espessura: null,
      materialId: material.id,
    };
    setRows((prev) =>
      [...prev, novaLinha].sort((a, b) =>
        a.descricao.localeCompare(b.descricao, "pt-BR"),
      ),
    );
    setAddOpen(false);
  }

  const totalChapa = rows
    .filter((r) => r.tipo === "CHAPA")
    .reduce((s, r) => s + r.quantidade, 0);
  const totalFita = rows
    .filter((r) => r.tipo === "FITA")
    .reduce((s, r) => s + r.quantidade, 0);
  const totalFerragem = rows.filter((r) => r.tipo === "FERRAGEM").length;

  const columns: TableColumn<Row>[] = [
    {
      key: "referencia",
      label: "Referência Promob",
      type: "text",
      sortable: true,
      filterable: true,
      minWidth: 160,
    },
    {
      key: "descricao",
      label: "Descrição",
      type: "text",
      sortable: true,
      filterable: true,
      minWidth: 220,
    },
    {
      key: "quantidade",
      label: "Quantidade",
      type: "number",
      sortable: true,
      minWidth: 120,
      align: "right",
      render: (v, row) =>
        `${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 4 })} ${UNIDADE_LABEL[row.unidade] ?? row.unidade}`,
    },
    {
      key: "ambiente",
      label: "Ambiente",
      type: "text",
      sortable: true,
      filterable: true,
      minWidth: 140,
      render: (v) => (v as string) ?? "—",
    },
    {
      key: "tipo",
      label: "Tipo",
      type: "text",
      sortable: true,
      filterable: true,
      minWidth: 90,
      render: (v) => TIPO_LABEL[v as string] ?? String(v),
    },
    {
      key: "materialId",
      label: "Material do cadastro",
      minWidth: 280,
      render: (_v, row) => (
        <div className="validar-xml__material-cell">
          <SearchSelect
            options={materiaisOptions}
            value={row.materialId}
            onChange={(materialId) => trocarMaterial(row.id, materialId)}
            placeholder="Buscar material (nome ou código)..."
          />
          <button
            type="button"
            title="Vincular permanentemente essa referência a este material"
            className="btn-icon"
            disabled={!row.materialId}
            onClick={() => vincularMaterial(row)}
          >
            <Link2 size={14} />
          </button>
        </div>
      ),
    },
    {
      key: "id",
      label: "",
      minWidth: 50,
      render: (_v, row) => (
        <button
          type="button"
          title="Excluir da leitura"
          className="btn-icon"
          onClick={() => excluirLinha(row.id)}
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <AppLayout pageTitle="Validar XML do Promob">
      <div className="validar-xml__page">

        <div className="validar-xml__header">
          <div>
            <h2 style={{ margin: 0 }}>Validar XML do Promob</h2>
            <p
              style={{ margin: "4px 0 0", color: "var(--text)", fontSize: 13 }}
            >
              Leitura isolada, pra conferir se as quantidades batem com o Promob
              — ainda não associa a nenhum pedido.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={abrirAdicionar}>
              <Plus size={14} />
              Adicionar item
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml"
              onChange={handleFile}
              style={{ display: "none" }}
              id="xml-file-input"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={loading}
            >
              <Upload size={14} />
              Escolher XML
            </Button>
          </div>
        </div>

        {cliente && (
          <div className="validar-xml__cliente">
            <div>
              <strong>Cliente:</strong> {cliente.nome ?? "—"}{" "}
              {cliente.codigo ? `(cód. ${cliente.codigo})` : ""}
            </div>
            <div>
              <strong>Arquivo:</strong> {nomeArquivo}
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <div className="validar-xml__tiles">
            <SummaryCard
              label="Chapa (m²)"
              value={totalChapa.toLocaleString("pt-BR", {
                maximumFractionDigits: 4,
              })}
            />
            <SummaryCard
              label="Fita (m)"
              value={totalFita.toLocaleString("pt-BR", {
                maximumFractionDigits: 2,
              })}
            />
            <SummaryCard
              label="Ferragem (referências)"
              value={String(totalFerragem)}
            />
            <SummaryCard
              label="Sem material casado"
              value={String(semMaterial)}
              accent={semMaterial > 0 ? "#f97316" : undefined}
            />
          </div>
        )}

        <DataTable<Row>
          columns={columns}
          data={rows}
          rowKey="id"
          loading={loading}
          storageKey="dt:almox:validar-xml"
          showIndex
          emptyMessage="Escolha um arquivo XML do Promob para começar."
          rowClassName={(row) =>
            row.materialId == null ? "row-em-evidencia" : ""
          }
        />

        <Modal
          title="Adicionar item à lista"
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          footer={
            <div className="cad-modal-footer__right">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAddOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmarAdicionar}
              >
                Adicionar
              </Button>
            </div>
          }
        >
          <div className="cad-modal-body">
            <div className="cad-field">
              <label className="cad-field__label">Material</label>
              <SearchSelect
                options={materiaisOptions}
                value={addMaterialId}
                onChange={setAddMaterialId}
                placeholder="Buscar material (nome ou código)..."
              />
            </div>
            <Input
              label="Quantidade"
              type="text"
              inputMode="decimal"
              value={addQuantidade}
              onChange={(e) => setAddQuantidade(e.target.value)}
              placeholder="0"
            />
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
