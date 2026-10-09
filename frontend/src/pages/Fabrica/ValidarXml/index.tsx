import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Button } from "../../../components/Button";
import { SummaryCard } from "../../../components/SummaryCard";
import { XmlItensTable } from "../../../features/estoqueXml/XmlItensTable";
import type { XmlRow } from "../../../features/estoqueXml/XmlItensTable";
import { useToast } from "../../../context/ToastContext";
import { useApiData } from "../../../hooks/useApiData";
import { fetchMateriaisOpcoes } from "../../../services/materiais";
import { previewXml, vincularReferencia } from "../../../services/estoqueXml";
import { getErrorMessage } from "../../../utils/errorMessage";
import "./index.css";

export function FabricaValidarXmlPage() {
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
  const [rows, setRows] = useState<XmlRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [nomeArquivo, setNomeArquivo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          materialIdOriginal: item.materialId,
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

  async function vincularMaterial(row: XmlRow) {
    if (!row.materialId) return;
    try {
      await vincularReferencia(row.referencia, row.materialId);
      toast.success(
        `Referência "${row.referencia}" vinculada — próximas importações já virão casadas.`,
      );
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, materialIdOriginal: r.materialId } : r,
        ),
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao vincular."));
    }
  }

  function excluirLinha(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const totalChapa = rows
    .filter((r) => r.tipo === "CHAPA")
    .reduce((s, r) => s + r.quantidade, 0);
  const totalFita = rows
    .filter((r) => r.tipo === "FITA")
    .reduce((s, r) => s + r.quantidade, 0);
  const totalFerragem = rows.filter((r) => r.tipo === "FERRAGEM").length;

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
              — não lança nada em nenhum pedido. Pra lançar itens de verdade,
              use a tela Itens Pedido.
            </p>
          </div>
          <div>
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

        <XmlItensTable
          rows={rows}
          materiaisOptions={materiaisOptions}
          loading={loading}
          storageKey="dt:fabrica:validar-xml"
          onTrocarMaterial={trocarMaterial}
          onVincular={vincularMaterial}
          onExcluir={excluirLinha}
        />
      </div>
    </AppLayout>
  );
}
