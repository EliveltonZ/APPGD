import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { Button } from "../../../../components/Button";
import type { SearchSelectOption } from "../../../../components/SearchSelect";
import { XmlItensTable } from "../../../estoqueXml/XmlItensTable";
import type { XmlRow } from "../../../estoqueXml/XmlItensTable";
import { previewXml, vincularReferencia, confirmarXml } from "../../../../services/estoqueXml";
import { useToast } from "../../../../context/ToastContext";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface Props {
  ordemdecompra: number;
  materiaisOptions: SearchSelectOption[];
  onImported: () => void;
}

export function ImportarXmlSection({ ordemdecompra, materiaisOptions, onImported }: Props) {
  const toast = useToast();
  const [cliente, setCliente] = useState<{ codigo: string | null; nome: string | null } | null>(null);
  const [rows, setRows] = useState<XmlRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
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
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, materialId } : r)));
  }

  async function vincularMaterial(row: XmlRow) {
    if (!row.materialId) return;
    try {
      await vincularReferencia(row.referencia, row.materialId);
      toast.success(
        `Referência "${row.referencia}" vinculada — próximas importações já virão casadas.`,
      );
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, materialIdOriginal: r.materialId } : r)),
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao vincular."));
    }
  }

  function excluirLinha(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function cancelarImportacao() {
    setRows([]);
    setCliente(null);
    setNomeArquivo("");
  }

  async function concluirImportacao() {
    if (rows.length === 0) return;
    if (semMaterial > 0) {
      toast.error(`${semMaterial} item(ns) ainda sem material definido — resolva ou exclua antes de concluir.`);
      return;
    }
    setConfirming(true);
    try {
      // semMaterial === 0 aqui — já validado acima — então materialId é
      // garantido não-nulo em toda linha.
      const itensPraConfirmar = rows.map((r) => ({
        referencia: r.referencia,
        unidade: r.unidade,
        quantidade: r.quantidade,
        materialId: r.materialId as number,
      }));
      await confirmarXml(ordemdecompra, nomeArquivo, itensPraConfirmar);
      toast.success("XML importado com sucesso — itens lançados no pedido.");
      cancelarImportacao();
      onImported();
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao concluir a importação."));
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="pinfo-section">
      <div className="frow" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          {cliente ? (
            <span style={{ fontSize: 13, color: "var(--text)" }}>
              <strong>Cliente:</strong> {cliente.nome ?? "—"}
              {cliente.codigo ? ` (cód. ${cliente.codigo})` : ""} · <strong>Arquivo:</strong> {nomeArquivo}
            </span>
          ) : (
            <span style={{ fontSize: 13, color: "var(--text)" }}>
              Escolha o XML do Promob desse pedido — os itens casados automaticamente
              com o cadastro já ficam prontos pra lançar.
            </span>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml"
            onChange={handleFile}
            style={{ display: "none" }}
            id="xml-file-input-pedido"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={loading}
          >
            <Upload size={14} />
            Escolher XML
          </Button>
        </div>
      </div>

      {rows.length > 0 && (
        <>
          <div style={{ marginTop: 12 }}>
            <XmlItensTable
              rows={rows}
              materiaisOptions={materiaisOptions}
              loading={loading}
              storageKey="dt:pedido:importar-xml"
              onTrocarMaterial={trocarMaterial}
              onVincular={vincularMaterial}
              onExcluir={excluirLinha}
            />
          </div>
          <div className="pend-form-actions">
            <Button variant="ghost" size="sm" type="button" onClick={cancelarImportacao}>
              Cancelar importação
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              loading={confirming}
              disabled={semMaterial > 0}
              onClick={concluirImportacao}
            >
              Concluir Importação ({rows.length} {rows.length === 1 ? "item" : "itens"})
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
