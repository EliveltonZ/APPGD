import { useRef, useState } from "react";
import { FileText, Plus, Trash2, Upload } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { SearchSelect } from "../../../components/SearchSelect";
import { Modal } from "../../../components/Modal";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorMessage";
import { localDateStr } from "../../../utils/dateUtils";
import { fetchFornecedores, createFornecedor } from "../../../services/fornecedores";
import { fetchLocalizacoes } from "../../../services/localizacoes";
import { fetchMateriaisOpcoes } from "../../../services/materiais";
import {
  fetchNotasFiscais,
  fetchItensNota,
  criarNotaFiscal,
  fetchVinculo,
  previewNotaFiscalXml,
} from "../../../services/notaFiscal";
import type {
  NotaFiscalResumo,
  NotaFiscalItem,
} from "../../../services/notaFiscal";
import "./index.css";

interface ItemRascunho {
  _key: number;
  materialId: number | null;
  codigoInterno: string;
  descricao: string;
  codigoNf: string | null;
  descricaoNf: string | null;
  unidadeCompra: string;
  qtdNf: number;
  qtdUn: number;
  precoNf: number | null;
  precoUn: number | null;
  salvarVinculo: boolean;
  fator: number | null;
}

function fmtQtd(v: number): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function fmtMoeda(v: number | null): string {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toNumber(s: string): number | null {
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

const HIST_COLUMNS: TableColumn<NotaFiscalResumo>[] = [
  { key: "numero_nota", label: "Número", type: "text", sortable: true, filterable: true, minWidth: 100 },
  { key: "fornecedor_nome", label: "Fornecedor", type: "text", sortable: true, filterable: true, minWidth: 200 },
  { key: "data_entrada", label: "Entrada", type: "text", sortable: true, minWidth: 100, render: (v) => fmtDate(v as string) },
  { key: "total_itens", label: "Itens", type: "number", align: "center", minWidth: 70 },
  { key: "valor_total", label: "Valor", type: "number", align: "right", sortable: true, minWidth: 110, render: (v) => fmtMoeda(v != null ? Number(v) : null) },
  { key: "usuario_login", label: "Lançado por", type: "text", sortable: true, filterable: true, minWidth: 110 },
];

let nextKey = 1;

export function AlmoxarifadoNotaFiscalPage() {
  const toast = useToast();
  const { data: fornecedores = [], refetch: recarregarFornecedores } = useApiData(fetchFornecedores);
  const { data: localizacoes = [] } = useApiData(fetchLocalizacoes);
  const { data: materiais = [] } = useApiData(fetchMateriaisOpcoes);
  const { data: historico = [], loading: loadingHist, refetch: recarregarHist } = useApiData(fetchNotasFiscais);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importandoXml, setImportandoXml] = useState(false);

  const [fornecedorId, setFornecedorId] = useState("");
  const [numeroNota, setNumeroNota] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataEntrada, setDataEntrada] = useState(localDateStr());
  const [localizacaoId, setLocalizacaoId] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [itens, setItens] = useState<ItemRascunho[]>([]);
  const [saving, setSaving] = useState(false);

  const [materialId, setMaterialId] = useState<number | null>(null);
  const [codigoNf, setCodigoNf] = useState("");
  const [unidadeCompra, setUnidadeCompra] = useState("UN");
  const [qtdNf, setQtdNf] = useState("");
  const [fator, setFator] = useState("");
  const [qtdUn, setQtdUn] = useState("");
  const [precoNf, setPrecoNf] = useState("");
  const [precoUn, setPrecoUn] = useState("");
  const [salvarVinculo, setSalvarVinculo] = useState(true);
  const [vinculoCarregado, setVinculoCarregado] = useState(false);

  const [viewNota, setViewNota] = useState<NotaFiscalResumo | null>(null);
  const [viewItens, setViewItens] = useState<NotaFiscalItem[] | null>(null);
  const [loadingViewItens, setLoadingViewItens] = useState(false);

  const materiaisOptions = materiais.map((m) => ({
    value: m.id,
    label: `${m.codigoInterno} — ${m.descricao}`,
    searchHint: m.codigoInterno,
  }));
  const fornecedoresOptions = fornecedores.filter((f) => f.ativo).map((f) => ({ value: f.id, label: f.nome }));
  const localizacoesOptions = localizacoes
    .filter((l) => l.ativo)
    .map((l) => ({ value: l.id, label: `${l.codigo}${l.descricao ? ` — ${l.descricao}` : ""}` }));

  function recomputeQtdUn(qtdNfStr: string, fatorStr: string): string {
    const qn = toNumber(qtdNfStr);
    const f = toNumber(fatorStr);
    if (!qn) return "";
    if (!f || f === 1) return String(qn);
    return String(Math.round((qn / f) * 1000) / 1000);
  }

  function recomputePrecoUn(qtdNfStr: string, precoNfStr: string, qtdUnStr: string): string {
    const qn = toNumber(qtdNfStr);
    const pn = toNumber(precoNfStr);
    const qu = toNumber(qtdUnStr);
    if (!qn || !pn || !qu) return "";
    return String(Math.round(((qn * pn) / qu) * 10000) / 10000);
  }

  async function handleMaterialChange(id: number | null) {
    setMaterialId(id);
    setVinculoCarregado(false);
    if (!id || !fornecedorId) return;
    try {
      const vinculo = await fetchVinculo(id, Number(fornecedorId));
      if (vinculo) {
        setCodigoNf(vinculo.codigoNf);
        setUnidadeCompra(vinculo.unidadeCompra);
        setFator(vinculo.m2PorUnidade != null ? String(vinculo.m2PorUnidade) : "");
        setSalvarVinculo(false);
        setVinculoCarregado(true);
      } else {
        setSalvarVinculo(true);
      }
    } catch {
      // sem vínculo prévio — segue com os campos em branco
    }
  }

  function handleQtdNfChange(v: string) {
    setQtdNf(v);
    setQtdUn(recomputeQtdUn(v, fator));
    setPrecoUn(recomputePrecoUn(v, precoNf, recomputeQtdUn(v, fator)));
  }

  function handleFatorChange(v: string) {
    setFator(v);
    const novoQtdUn = recomputeQtdUn(qtdNf, v);
    setQtdUn(novoQtdUn);
    setPrecoUn(recomputePrecoUn(qtdNf, precoNf, novoQtdUn));
  }

  function handlePrecoNfChange(v: string) {
    setPrecoNf(v);
    setPrecoUn(recomputePrecoUn(qtdNf, v, qtdUn));
  }

  function resetItemForm() {
    setMaterialId(null);
    setCodigoNf("");
    setUnidadeCompra("UN");
    setQtdNf("");
    setFator("");
    setQtdUn("");
    setPrecoNf("");
    setPrecoUn("");
    setSalvarVinculo(true);
    setVinculoCarregado(false);
  }

  function handleAddItem() {
    if (!materialId) {
      toast.error("Selecione o material.");
      return;
    }
    const material = materiais.find((m) => m.id === materialId);
    const qn = toNumber(qtdNf);
    const qu = toNumber(qtdUn);
    if (!qn || qn <= 0) {
      toast.error("Informe a quantidade da nota.");
      return;
    }
    if (!qu || qu <= 0) {
      toast.error("Informe a quantidade em UN.");
      return;
    }
    if (!unidadeCompra.trim()) {
      toast.error("Informe a unidade de compra.");
      return;
    }

    setItens((prev) => [
      ...prev,
      {
        _key: nextKey++,
        materialId,
        codigoNf: codigoNf.trim() || null,
        descricaoNf: null,
        unidadeCompra: unidadeCompra.trim().toUpperCase(),
        qtdNf: qn,
        qtdUn: qu,
        precoNf: toNumber(precoNf),
        precoUn: toNumber(precoUn),
        salvarVinculo: salvarVinculo && !!codigoNf.trim(),
        fator: toNumber(fator),
        codigoInterno: material?.codigoInterno ?? "",
        descricao: material?.descricao ?? "",
      },
    ]);
    resetItemForm();
  }

  function handleRemoveItem(key: number) {
    setItens((prev) => prev.filter((i) => i._key !== key));
  }

  function handleAssignMaterial(key: number, newMaterialId: number | null) {
    const material = materiais.find((m) => m.id === newMaterialId);
    setItens((prev) =>
      prev.map((i) =>
        i._key === key
          ? {
              ...i,
              materialId: newMaterialId,
              codigoInterno: material?.codigoInterno ?? "",
              descricao: material?.descricao ?? "",
              // material escolhido na mão pra um item que veio do XML sem
              // vínculo — próxima nota do mesmo fornecedor já vem casada.
              salvarVinculo: newMaterialId != null,
            }
          : i,
      ),
    );
  }

  function handlePickXmlFile() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImportandoXml(true);
    try {
      const xmlText = await file.text();
      const preview = await previewNotaFiscalXml(xmlText);

      if (preview.numeroNota) setNumeroNota(preview.numeroNota);
      if (preview.dataEmissao) setDataEmissao(preview.dataEmissao);
      if (preview.dataEntrada) setDataEntrada(preview.dataEntrada);

      let fornecedorIdResolvido = preview.fornecedor.id;
      if (!fornecedorIdResolvido && preview.fornecedor.nome) {
        const novo = await createFornecedor({
          nome: preview.fornecedor.nome,
          cnpj: preview.fornecedor.cnpj,
          contato: null,
          ativo: true,
          inscricao_estadual: preview.fornecedor.inscricaoEstadual,
          endereco: preview.fornecedor.endereco,
          numero: preview.fornecedor.numero,
          bairro: preview.fornecedor.bairro,
          cidade: preview.fornecedor.cidade,
          cep: preview.fornecedor.cep,
          estado: preview.fornecedor.estado,
        });
        fornecedorIdResolvido = novo.id;
        recarregarFornecedores();
      }
      if (fornecedorIdResolvido) setFornecedorId(String(fornecedorIdResolvido));

      const novosItens: ItemRascunho[] = preview.itens.map((item) => ({
        _key: nextKey++,
        materialId: item.materialId,
        codigoInterno: item.codigoInterno ?? "",
        descricao: item.materialDescricao ?? item.descricao ?? "",
        codigoNf: item.codigoNf,
        descricaoNf: item.descricao,
        unidadeCompra: (item.unidadeCompra ?? "UN").toUpperCase(),
        qtdNf: item.qtdNf ?? 0,
        qtdUn: item.qtdNf ?? 0,
        precoNf: item.precoNf,
        precoUn: item.precoNf,
        salvarVinculo: false,
        fator: null,
      }));
      setItens((prev) => [...prev, ...novosItens]);

      const semMaterial = novosItens.filter((i) => i.materialId == null).length;
      if (semMaterial > 0) {
        toast.error(`XML importado: ${novosItens.length} ite${novosItens.length === 1 ? "m" : "ns"}, ${semMaterial} sem material associado — escolha abaixo antes de lançar.`);
      } else {
        toast.success(`XML importado: ${novosItens.length} ite${novosItens.length === 1 ? "m" : "ns"}, todos já casados com o cadastro.`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao importar XML."));
    } finally {
      setImportandoXml(false);
    }
  }

  const valorTotalRascunho = itens.reduce((acc, i) => acc + (i.precoNf != null ? i.precoNf * i.qtdNf : 0), 0);

  async function handleSubmit() {
    if (!fornecedorId) {
      toast.error("Selecione o fornecedor.");
      return;
    }
    if (!numeroNota.trim()) {
      toast.error("Informe o número da nota.");
      return;
    }
    if (!dataEntrada) {
      toast.error("Informe a data de entrada.");
      return;
    }
    if (!localizacaoId) {
      toast.error("Selecione a localização de entrada.");
      return;
    }
    if (itens.length === 0) {
      toast.error("Adicione ao menos um item.");
      return;
    }
    const semMaterial = itens.filter((i) => i.materialId == null).length;
    if (semMaterial > 0) {
      toast.error(`${semMaterial} ite${semMaterial === 1 ? "m" : "ns"} ainda sem material associado — resolva antes de lançar.`);
      return;
    }

    setSaving(true);
    try {
      await criarNotaFiscal({
        fornecedorId: Number(fornecedorId),
        numeroNota: numeroNota.trim(),
        dataEmissao: dataEmissao || null,
        dataEntrada,
        localizacaoId: Number(localizacaoId),
        observacoes: observacoes.trim() || null,
        itens: itens.map((i) => ({
          materialId: i.materialId as number,
          codigoNf: i.codigoNf,
          descricaoNf: i.descricaoNf,
          unidadeCompra: i.unidadeCompra,
          qtdNf: i.qtdNf,
          qtdUn: i.qtdUn,
          precoNf: i.precoNf,
          precoUn: i.precoUn,
          salvarVinculo: i.salvarVinculo,
          fator: i.fator,
        })),
      });
      toast.success("Nota fiscal lançada com sucesso.");
      setNumeroNota("");
      setDataEmissao("");
      setObservacoes("");
      setItens([]);
      recarregarHist();
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao lançar nota fiscal."));
    } finally {
      setSaving(false);
    }
  }

  async function handleViewItens(nota: NotaFiscalResumo) {
    setViewNota(nota);
    setLoadingViewItens(true);
    try {
      const rows = await fetchItensNota(nota.id);
      setViewItens(rows);
    } catch {
      setViewItens([]);
    } finally {
      setLoadingViewItens(false);
    }
  }

  return (
    <AppLayout pageTitle="Nota Fiscal">
      <div className="nf-page">
        <aside className="nf-form-panel">
          <h2 className="nf-panel-title">Nova Nota Fiscal</h2>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,text/xml"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button
            variant="secondary"
            size="sm"
            loading={importandoXml}
            onClick={handlePickXmlFile}
            style={{ width: "100%" }}
          >
            <Upload size={14} />
            Importar XML da NF-e
          </Button>
          <p className="nf-hint" style={{ margin: 0 }}>
            Lê fornecedor e itens do XML — tenta casar cada item com o cadastro automaticamente.
          </p>

          <div className="nf-divider" />

          <div className="frow frow--2">
            <Select
              label="Fornecedor *"
              options={fornecedoresOptions}
              value={fornecedorId}
              onChange={(e) => setFornecedorId(e.target.value)}
              placeholder="Selecione..."
            />
            <Input
              label="Número da nota *"
              value={numeroNota}
              onChange={(e) => setNumeroNota(e.target.value)}
              placeholder="Ex: 12345"
            />
          </div>

          <div className="frow frow--3">
            <Input label="Emissão" type="date" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} />
            <Input label="Entrada *" type="date" value={dataEntrada} onChange={(e) => setDataEntrada(e.target.value)} />
            <Select
              label="Localização *"
              options={localizacoesOptions}
              value={localizacaoId}
              onChange={(e) => setLocalizacaoId(e.target.value)}
              placeholder="Selecione..."
            />
          </div>

          <Input
            label="Observações"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Opcional..."
          />

          <div className="nf-divider" />

          <h3 className="nf-subtitle">Adicionar item</h3>

          <div className="pfield">
            <label>Material</label>
            <SearchSelect
              options={materiaisOptions}
              value={materialId}
              onChange={handleMaterialChange}
              placeholder="Buscar material (nome ou código)..."
            />
          </div>

          {vinculoCarregado && (
            <p className="nf-hint">Vínculo já conhecido com este fornecedor — campos pré-preenchidos.</p>
          )}

          <div className="frow frow--2">
            <Input label="Código na NF" value={codigoNf} onChange={(e) => setCodigoNf(e.target.value)} placeholder="Opcional" />
            <Input
              label="Unidade de compra"
              uppercase
              maxLength={10}
              value={unidadeCompra}
              onChange={(e) => setUnidadeCompra(e.target.value)}
              placeholder="UN"
            />
          </div>

          <div className="frow frow--3">
            <Input
              label="Qtd (NF) *"
              type="text"
              inputMode="decimal"
              value={qtdNf}
              onChange={(e) => handleQtdNfChange(e.target.value)}
              placeholder="0"
            />
            <Input
              label="Fator conversão"
              type="text"
              inputMode="decimal"
              value={fator}
              onChange={(e) => handleFatorChange(e.target.value)}
              placeholder="1"
            />
            <Input
              label="Qtd (UN) *"
              type="text"
              inputMode="decimal"
              value={qtdUn}
              onChange={(e) => setQtdUn(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="frow frow--2">
            <Input
              label="Preço (NF)"
              type="text"
              inputMode="decimal"
              value={precoNf}
              onChange={(e) => handlePrecoNfChange(e.target.value)}
              placeholder="0,00"
            />
            <Input
              label="Preço (UN)"
              type="text"
              inputMode="decimal"
              value={precoUn}
              onChange={(e) => setPrecoUn(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <label className="nf-checkbox">
            <input
              type="checkbox"
              checked={salvarVinculo}
              onChange={(e) => setSalvarVinculo(e.target.checked)}
              disabled={!codigoNf.trim()}
            />
            Salvar vínculo (código + unidade + fator) pra próxima nota deste fornecedor
          </label>

          <Button variant="secondary" size="sm" onClick={handleAddItem} style={{ width: "100%" }}>
            <Plus size={14} />
            Adicionar item
          </Button>

          {itens.length > 0 && (
            <div className="nf-itens-rascunho">
              {itens.map((i) =>
                i.materialId == null ? (
                  <div key={i._key} className="nf-item-row nf-item-row--evidencia">
                    <div className="nf-item-row__info" style={{ flex: 1 }}>
                      <strong>Sem material — {i.descricaoNf ?? i.codigoNf}</strong>
                      <span className="nf-item-row__qtd">
                        {fmtQtd(i.qtdNf)} {i.unidadeCompra}
                        {i.precoNf != null ? ` · ${fmtMoeda(i.precoNf)}/${i.unidadeCompra}` : ""}
                        {i.codigoNf ? ` · código NF ${i.codigoNf}` : ""}
                      </span>
                      <SearchSelect
                        options={materiaisOptions}
                        value={null}
                        onChange={(id) => handleAssignMaterial(i._key, id)}
                        placeholder="Escolher material do cadastro..."
                      />
                    </div>
                    <button type="button" className="nf-item-row__remove" onClick={() => handleRemoveItem(i._key)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <div key={i._key} className="nf-item-row">
                    <div className="nf-item-row__info">
                      <strong>{i.codigoInterno}</strong> — {i.descricao}
                      <span className="nf-item-row__qtd">
                        {fmtQtd(i.qtdNf)} {i.unidadeCompra} → {fmtQtd(i.qtdUn)} un
                        {i.precoUn != null ? ` · ${fmtMoeda(i.precoUn)}/un` : ""}
                      </span>
                    </div>
                    <button type="button" className="nf-item-row__remove" onClick={() => handleRemoveItem(i._key)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ),
              )}
              <div className="nf-total-rascunho">Total: {fmtMoeda(valorTotalRascunho || null)}</div>
            </div>
          )}

          <Button variant="primary" loading={saving} onClick={handleSubmit} style={{ width: "100%", marginTop: 8 }}>
            <FileText size={14} />
            Lançar Nota Fiscal
          </Button>
        </aside>

        <section className="nf-hist-panel">
          <h2 className="nf-panel-title">Histórico</h2>
          <DataTable
            columns={HIST_COLUMNS}
            data={historico}
            rowKey="id"
            loading={loadingHist}
            storageKey="nota-fiscal-hist"
            onRowClick={handleViewItens}
            emptyMessage="Nenhuma nota fiscal lançada."
          />
        </section>
      </div>

      <Modal
        title={viewNota ? `NF ${viewNota.numero_nota} — ${viewNota.fornecedor_nome}` : ""}
        isOpen={!!viewNota}
        onClose={() => {
          setViewNota(null);
          setViewItens(null);
        }}
        maxWidth={760}
      >
        {loadingViewItens ? (
          <p style={{ padding: "12px 0", opacity: 0.5, fontSize: 13 }}>Carregando...</p>
        ) : (
          <table className="nf-view-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Material</th>
                <th>Qtd NF</th>
                <th>Qtd UN</th>
                <th>Preço UN</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(viewItens ?? []).map((i) => (
                <tr key={i.id}>
                  <td>{i.codigo_interno}</td>
                  <td>{i.material_descricao}</td>
                  <td>
                    {fmtQtd(Number(i.qtd_nf))} {i.unidade_compra}
                  </td>
                  <td>{fmtQtd(Number(i.qtd_un))}</td>
                  <td>{i.preco_un != null ? fmtMoeda(Number(i.preco_un)) : "—"}</td>
                  <td>{i.total != null ? fmtMoeda(Number(i.total)) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>
    </AppLayout>
  );
}
