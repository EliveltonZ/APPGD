import { useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "../../components/Button";
import { DataTable } from "../../components/DataTable";
import type { TableColumn } from "../../components/DataTable";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errorMessage";
import { analisarXmlLogisticaTemp } from "../../services/xmlLogisticaAnaliseTemp";
import type { ItemAnaliseXmlLogistica } from "../../services/xmlLogisticaAnaliseTemp";
import { filtrarFamiliasRelevantes, agruparESomar } from "../../utils/xmlListingAnalise";

// Tela TEMPORÁRIA — só pra ver, cru, o que o XML "LISTING" (pasta
// "xml logistica", formato diferente do XML_BUILDER usado em Validar XML)
// retorna. Não grava nada. Remover junto com o service/rota de backend
// quando a decisão sobre aproveitar essa fonte estiver tomada.
export function XmlLogisticaAnaliseTempPage() {
  const toast = useToast();
  const [itens, setItens] = useState<ItemAnaliseXmlLogistica[]>([]);
  const [totalNos, setTotalNos] = useState(0);
  const [totalComponentes, setTotalComponentes] = useState(0);
  const [loading, setLoading] = useState(false);
  // Com o filtro de família (Montagem/Fábrica/Acessórios) ligado por padrão,
  // "só componentes" vira um refinamento à parte, desligado por padrão —
  // senão esconderia as ferragens de Fábrica (componente=false) junto com o
  // resto.
  const [soComponentes, setSoComponentes] = useState(false);
  const [soFamiliasRelevantes, setSoFamiliasRelevantes] = useState(true);
  const [agrupar, setAgrupar] = useState(false);
  const [nomeArquivo, setNomeArquivo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setNomeArquivo(file.name);
    setLoading(true);
    try {
      const xml = await file.text();
      const resultado = await analisarXmlLogisticaTemp(xml);
      setItens(resultado.itens);
      setTotalNos(resultado.totalNos);
      setTotalComponentes(resultado.totalComponentes);
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao processar o XML."));
    } finally {
      setLoading(false);
    }
  }

  const itensExibidos = useMemo(() => {
    let base = itens;
    if (soFamiliasRelevantes) base = filtrarFamiliasRelevantes(base);
    if (soComponentes) base = base.filter((i) => i.componente);
    return agrupar ? agruparESomar(base) : base;
  }, [itens, soComponentes, soFamiliasRelevantes, agrupar]);

  const columns: TableColumn<ItemAnaliseXmlLogistica>[] = [
    { key: "ambiente", label: "Ambiente", type: "text", sortable: true, filterable: true, minWidth: 140 },
    { key: "categoria", label: "Categoria", type: "text", sortable: true, filterable: true, minWidth: 140 },
    { key: "nivel", label: "Nível", type: "number", align: "center", minWidth: 60 },
    {
      key: "componente",
      label: "Peça?",
      type: "text",
      align: "center",
      minWidth: 70,
      render: (v) => (v ? "Sim" : "—"),
    },
    { key: "descricao", label: "Descrição", type: "text", sortable: true, filterable: true, minWidth: 260 },
    { key: "referencia", label: "Referência", type: "text", sortable: true, filterable: true, minWidth: 130 },
    { key: "unidade", label: "Unid.", type: "text", align: "center", minWidth: 60 },
    { key: "quantidade", label: "Qtd", type: "number", align: "right", minWidth: 80 },
    {
      key: "textDimension",
      label: "Dimensões (L x A x P)",
      type: "text",
      minWidth: 170,
      render: (_v, row) =>
        row.textDimension || [row.largura, row.altura, row.profundidade].filter((n) => n != null).join(" x ") || "—",
    },
    { key: "familia", label: "Família", type: "text", sortable: true, filterable: true, minWidth: 140 },
    { key: "grupo", label: "Grupo", type: "text", sortable: true, filterable: true, minWidth: 140 },
    { key: "estruturaChave", label: "Estrutura (material/operação)", type: "text", minWidth: 150, render: (v) => (v ? String(v) : "—") },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20 }}>Análise XML Logística (temporário)</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--text-muted)" }}>
          Tela só pra inspecionar o que o XML "LISTING" (pasta "xml logistica") traz de peça/componente,
          antes de decidir se dá pra aproveitar. Nada é salvo no banco.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
          <Upload size={14} />
          Escolher XML
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {nomeArquivo && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{nomeArquivo}</span>}
        {totalNos > 0 && (
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {totalNos} nós no total, {totalComponentes} marcados como peça (COMPONENT="Y")
          </span>
        )}
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginLeft: "auto" }}>
          <input
            type="checkbox"
            checked={soFamiliasRelevantes}
            onChange={(e) => setSoFamiliasRelevantes(e.target.checked)}
          />
          Só Montagem, Fábrica e Acessórios
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={soComponentes} onChange={(e) => setSoComponentes(e.target.checked)} />
          Mostrar só as peças (componentes)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={agrupar} onChange={(e) => setAgrupar(e.target.checked)} />
          Agrupar itens iguais (somar qtd)
        </label>
      </div>

      <DataTable
        columns={columns}
        data={itensExibidos}
        showIndex
        loading={loading}
        emptyMessage="Escolha um XML pra ver o resultado."
      />
    </div>
  );
}
