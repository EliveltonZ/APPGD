import { useEffect, useRef, useState } from "react";
import { FileText, Lock, Plus, Trash2, Upload } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { SearchSelect } from "../../../components/SearchSelect";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage, getFieldErrors } from "../../../utils/errorMessage";
import { localDateStr } from "../../../utils/dateUtils";
import { fetchFornecedores, createFornecedor } from "../../../services/fornecedores";
import { fetchRecebimento } from "../../../services/localizacoes";
import { fetchMateriaisOpcoes } from "../../../services/materiais";
import {
  criarNotaFiscal,
  fetchVinculo,
  previewNotaFiscalXml,
} from "../../../services/notaFiscal";
import type { NFePreviewDuplicata } from "../../../services/notaFiscal";
import { fetchPedidosAbertosPorFornecedor } from "../../../services/solicitacaoCompras";
import type { PedidoAbertoPorFornecedor } from "../../../services/solicitacaoCompras";
import { validateNotaFiscalItem, validateNotaFiscal } from "../../../validation";
import { normalizarUnidadeCompra } from "../../../utils/unidadeCompra";
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
  // Item que veio de um XML de NF-e importado não pode ser removido do
  // rascunho — só reassociado a outro material. Garante que a nota lançada
  // sempre tem exatamente os itens da nota real, nunca menos (ver
  // handleRemoveItem).
  origemXml: boolean;
  // Fita é comprada em rolo (metros variam por produto/fornecedor — 20m,
  // 300m etc.) mas o estoque dela é controlado em METROS, não em rolos —
  // sem saber quantos metros tem o rolo (fator), não dá pra lançar o item
  // sem arriscar salvar "5" no estoque quando era "5 rolos de 20m = 100m".
  needsFator: boolean;
  // Se este item da NF é a chegada de um pedido de compra já confirmado —
  // vincula esse pedido (marca ele como recebido/concluído em Compras >
  // Pedidos). Opcional: nem toda entrada de estoque vem de um pedido.
  pedidoItemId: number | null;
}

function fmtQtd(v: number): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

function fmtMoeda(v: number | null): string {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toNumber(s: string): number | null {
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

let nextKey = 1;

export function AlmoxarifadoNotaFiscalPage() {
  const toast = useToast();
  const { data: fornecedores = [], refetch: recarregarFornecedores } = useApiData(fetchFornecedores);
  const { data: recebimento } = useApiData(fetchRecebimento);
  const { data: materiais = [] } = useApiData(fetchMateriaisOpcoes);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importandoXml, setImportandoXml] = useState(false);

  const [fornecedorId, setFornecedorId] = useState("");
  const [numeroNota, setNumeroNota] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataEntrada, setDataEntrada] = useState(localDateStr());
  const [observacoes, setObservacoes] = useState("");
  const [chave, setChave] = useState<string | null>(null);
  const [duplicata, setDuplicata] = useState<NFePreviewDuplicata | null>(null);

  const [itens, setItens] = useState<ItemRascunho[]>([]);
  const [saving, setSaving] = useState(false);
  const [pedidosAbertos, setPedidosAbertos] = useState<PedidoAbertoPorFornecedor[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

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

  const materiaisOptions = materiais.map((m) => ({
    value: m.id,
    label: `${m.codigoInterno} — ${m.descricao}`,
    searchHint: m.codigoInterno,
  }));
  const fornecedoresOptions = fornecedores.filter((f) => f.ativo).map((f) => ({ value: f.id, label: f.nome }));

  // Pedidos já confirmados com este fornecedor, ainda sem nota vinculada —
  // candidatos pra "este item da nota é a chegada de qual pedido".
  useEffect(() => {
    if (!fornecedorId) {
      setPedidosAbertos([]);
      return;
    }
    fetchPedidosAbertosPorFornecedor(Number(fornecedorId))
      .then(setPedidosAbertos)
      .catch((err) => {
        setPedidosAbertos([]);
        toast.error(getErrorMessage(err, "Erro ao buscar pedidos abertos deste fornecedor."));
      });
  }, [fornecedorId]);

  // fator = quantidade física (em metros, pra fita) que cabe em 1 unidade de
  // compra (1 rolo). Rolo de 20m comprando 5 rolos → 5 × 20 = 100m de
  // estoque, não 5 — era isso que estava invertido (dividia em vez de
  // multiplicar).
  function recomputeQtdUn(qtdNfStr: string, fatorStr: string): string {
    const qn = toNumber(qtdNfStr);
    const f = toNumber(fatorStr);
    if (!qn) return "";
    if (!f || f === 1) return String(qn);
    return String(Math.round(qn * f * 1000) / 1000);
  }

  // Material cuja unidade de estoque (metros — fita) é diferente da unidade
  // que ele é comprado (ex: rolo) — precisa de um fator de conversão
  // informado por fornecedor (comprimento do rolo varia), nunca pode
  // assumir 1:1 silenciosamente.
  function precisaFator(matId: number | null, unCompra: string): boolean {
    const material = materiais.find((m) => m.id === matId);
    return material?.unidadeBase === "M" && normalizarUnidadeCompra(unCompra) !== "M";
  }

  // Dado material + unidade de compra + quantidades, resolve qtdUn/precoUn
  // de estoque — ou sinaliza que falta informação pra fazer essa conta com
  // segurança, em vez de arriscar salvar a quantidade errada no estoque.
  // unidadeCompra é normalizada primeiro (UN/UND/UNID → UN, M²→M2 etc.) —
  // fornecedores diferentes escrevem a mesma unidade de jeitos diferentes
  // na nota (ex.: LEO Madeiras manda chapa em "UN", a Arauco na mesma
  // chapa em "M2") e a identificação da conversão precisa ser automática
  // independente de como cada um escreveu.
  function resolverConversao(
    matId: number | null,
    unCompra: string,
    qtdNfVal: number,
    precoNfVal: number | null,
    fatorConhecido: number | null,
  ): { qtdUn: number; precoUn: number | null; needsFator: boolean; fator: number | null } {
    const material = materiais.find((m) => m.id === matId);
    const unCompraNorm = normalizarUnidadeCompra(unCompra);

    if (material?.unidadeBase === "M2") {
      // Chapa comprada em m² (alguns fornecedores faturam por área, não
      // por chapa inteira) — a conversão pra UN (chapa inteira) usa o
      // m²/chapa fixo do próprio cadastro do material, nunca precisa ser
      // digitada: ao contrário do rolo de fita, a área de uma chapa não
      // muda por fornecedor, então uma vez cadastrada já resolve sozinho
      // pra sempre.
      if (unCompraNorm === "M2") {
        const m2PorChapa = material.m2PorUnidade;
        if (!m2PorChapa) {
          return { qtdUn: 0, precoUn: null, needsFator: true, fator: null };
        }
        // Arredonda pra baixo — estoque de chapa não trabalha fracionado,
        // então a sobra de área (ex.: 0,675 chapa) não entra como saldo.
        const qtdUn = Math.floor(qtdNfVal / m2PorChapa);
        const precoUn = precoNfVal != null ? Math.round(precoNfVal * m2PorChapa * 10000) / 10000 : null;
        return { qtdUn, precoUn, needsFator: false, fator: m2PorChapa };
      }
      // Chapa comprada direto em UN (ex.: LEO Madeiras) — 1 unidade
      // comprada = 1 chapa inteira de estoque, sem conversão nenhuma.
      if (unCompraNorm === "UN") {
        return { qtdUn: qtdNfVal, precoUn: precoNfVal, needsFator: false, fator: null };
      }
      // Unidade que não é nem M2 nem UN pra uma chapa — não arrisca
      // assumir 1:1 silenciosamente (era exatamente esse o bug: qualquer
      // unidade desconhecida caía na conta de "sem conversão", tratando
      // área como se fosse unidade inteira). Bloqueia e pede resolução
      // manual, igual já acontece pra fita sem fator.
      return { qtdUn: 0, precoUn: null, needsFator: true, fator: null };
    }

    if (!precisaFator(matId, unCompra)) {
      return { qtdUn: qtdNfVal, precoUn: precoNfVal, needsFator: false, fator: null };
    }
    if (fatorConhecido != null && fatorConhecido > 0) {
      const qtdUn = Math.round(qtdNfVal * fatorConhecido * 1000) / 1000;
      const precoUn = precoNfVal != null ? Math.round((precoNfVal / fatorConhecido) * 10000) / 10000 : null;
      return { qtdUn, precoUn, needsFator: false, fator: fatorConhecido };
    }
    return { qtdUn: 0, precoUn: null, needsFator: true, fator: null };
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
    } catch (err) {
      // fetchVinculo resolve null (não lança) quando simplesmente não existe
      // vínculo salvo — chegar aqui é falha real de rede/servidor, não "sem
      // vínculo", então precisa aparecer pro usuário, não ficar silenciosa.
      toast.error(getErrorMessage(err, "Erro ao consultar vínculo deste material com o fornecedor."));
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
    setItemErrors({});
  }

  function handleAddItem() {
    const resultado = validateNotaFiscalItem({
      materialId,
      qtdNf,
      qtdUn,
      unidadeCompra,
      fator,
      precisaFator: precisaFator(materialId, unidadeCompra),
    });
    if (!resultado.valid) {
      setItemErrors(resultado.errors);
      toast.error(Object.values(resultado.errors)[0]);
      return;
    }
    setItemErrors({});

    const material = materiais.find((m) => m.id === materialId);
    const qn = toNumber(qtdNf) as number;
    const qu = toNumber(qtdUn) as number;

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
        origemXml: false,
        needsFator: false,
        pedidoItemId: null,
      },
    ]);
    resetItemForm();
  }

  function handleRemoveItem(key: number) {
    setItens((prev) => {
      const item = prev.find((i) => i._key === key);
      if (item?.origemXml) {
        toast.error("Item veio da nota fiscal importada — não pode ser removido, só trocar o material associado.");
        return prev;
      }
      return prev.filter((i) => i._key !== key);
    });
  }

  async function handleAssignMaterial(key: number, newMaterialId: number | null) {
    const material = materiais.find((m) => m.id === newMaterialId);

    let fatorConhecido: number | null = null;
    if (newMaterialId && fornecedorId) {
      try {
        const vinculo = await fetchVinculo(newMaterialId, Number(fornecedorId));
        fatorConhecido = vinculo?.m2PorUnidade ?? null;
      } catch (err) {
        // mesmo caso de handleMaterialChange: null não lança, então chegar
        // aqui é falha real, não "sem vínculo" — precisa aparecer.
        toast.error(getErrorMessage(err, "Erro ao consultar vínculo deste material com o fornecedor."));
      }
    }

    setItens((prev) =>
      prev.map((i) => {
        if (i._key !== key) return i;
        const { qtdUn, precoUn, needsFator, fator: fatorResolvido } = resolverConversao(
          newMaterialId,
          i.unidadeCompra,
          i.qtdNf,
          i.precoNf,
          fatorConhecido,
        );
        return {
          ...i,
          materialId: newMaterialId,
          codigoInterno: material?.codigoInterno ?? "",
          descricao: material?.descricao ?? "",
          qtdUn,
          precoUn,
          needsFator,
          fator: fatorResolvido,
          // material escolhido na mão pra um item que veio do XML sem
          // vínculo — próxima nota do mesmo fornecedor já vem casada
          // (só quando já resolveu completamente, senão espera o fator).
          salvarVinculo: newMaterialId != null && !needsFator,
          // pedido vinculado era pro material antigo — material trocou,
          // então a vinculação de pedido não vale mais.
          pedidoItemId: null,
        };
      }),
    );
  }

  function handlePedidoItemChange(key: number, pedidoItemIdStr: string) {
    const pedidoItemId = pedidoItemIdStr ? Number(pedidoItemIdStr) : null;
    setItens((prev) => prev.map((i) => (i._key === key ? { ...i, pedidoItemId } : i)));
  }

  // Usuário corrigiu a unidade de compra de um item de chapa que veio com
  // uma unidade não reconhecida (ex.: "CH" de um fornecedor que ainda não
  // tínhamos visto) — recalcula a conversão com a unidade corrigida e já
  // marca pra salvar vínculo, pra essa abreviação não travar de novo numa
  // próxima nota do mesmo fornecedor.
  function handleCorrigirUnidadeCompra(key: number, novaUnidade: string) {
    setItens((prev) =>
      prev.map((i) => {
        if (i._key !== key) return i;
        const { qtdUn, precoUn, needsFator, fator } = resolverConversao(
          i.materialId,
          novaUnidade,
          i.qtdNf,
          i.precoNf,
          i.fator,
        );
        return { ...i, unidadeCompra: novaUnidade, qtdUn, precoUn, needsFator, fator, salvarVinculo: !needsFator };
      }),
    );
  }

  // Usuário informou o fator (metros por rolo) pra um item que precisava —
  // recalcula qtdUn/precoUn de estoque e libera o item pra lançar.
  function handleResolverFator(key: number, fatorStr: string) {
    const fatorNum = toNumber(fatorStr);
    setItens((prev) =>
      prev.map((i) => {
        if (i._key !== key) return i;
        if (fatorNum == null || fatorNum <= 0) {
          return { ...i, fator: null, needsFator: true, qtdUn: 0, precoUn: null };
        }
        const { qtdUn, precoUn } = resolverConversao(i.materialId, i.unidadeCompra, i.qtdNf, i.precoNf, fatorNum);
        return { ...i, fator: fatorNum, needsFator: false, qtdUn, precoUn, salvarVinculo: true };
      }),
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

      // A prévia sempre mostra os dados, mesmo se a nota já tiver sido
      // lançada — é a única forma de consultar uma nota já lançada. Só o
      // botão de lançar fica bloqueado nesse caso (ver duplicata abaixo).
      setDuplicata(preview.duplicata);
      setChave(preview.chave);
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

      const novosItens: ItemRascunho[] = preview.itens.map((item) => {
        const unidadeCompra = (item.unidadeCompra ?? "UN").toUpperCase();
        const qtdNf = item.qtdNf ?? 0;
        const { qtdUn, precoUn, needsFator, fator } = resolverConversao(
          item.materialId,
          unidadeCompra,
          qtdNf,
          item.precoNf,
          item.fator,
        );
        return {
          _key: nextKey++,
          materialId: item.materialId,
          codigoInterno: item.codigoInterno ?? "",
          descricao: item.materialDescricao ?? item.descricao ?? "",
          codigoNf: item.codigoNf,
          descricaoNf: item.descricao,
          unidadeCompra,
          qtdNf,
          qtdUn,
          precoNf: item.precoNf,
          precoUn,
          salvarVinculo: false,
          fator,
          origemXml: true,
          needsFator,
          pedidoItemId: null,
        };
      });
      setItens((prev) => [...prev, ...novosItens]);

      if (preview.duplicata) {
        toast.error(`Esta nota já foi lançada (NF ${preview.duplicata.numeroNota}, em ${preview.duplicata.dataEntrada}) — mostrando só pra consulta, o lançamento fica bloqueado.`);
      } else {
        const semMaterial = novosItens.filter((i) => i.materialId == null).length;
        const semFator = novosItens.filter((i) => i.materialId != null && i.needsFator).length;
        if (semMaterial > 0 || semFator > 0) {
          const partes = [];
          if (semMaterial > 0) partes.push(`${semMaterial} sem material associado`);
          if (semFator > 0) partes.push(`${semFator} sem conversão pra estoque resolvida`);
          toast.error(`XML importado: ${novosItens.length} ite${novosItens.length === 1 ? "m" : "ns"}, ${partes.join(" e ")} — resolva abaixo antes de lançar.`);
        } else {
          toast.success(`XML importado: ${novosItens.length} ite${novosItens.length === 1 ? "m" : "ns"}, todos já casados com o cadastro.`);
        }
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao importar XML."));
    } finally {
      setImportandoXml(false);
    }
  }

  const valorTotalRascunho = itens.reduce((acc, i) => acc + (i.precoNf != null ? i.precoNf * i.qtdNf : 0), 0);

  async function handleSubmit() {
    if (duplicata) {
      toast.error(`Esta nota já foi lançada (NF ${duplicata.numeroNota}, em ${duplicata.dataEntrada}).`);
      return;
    }
    if (!recebimento) {
      toast.error("Nenhuma localização de recebimento configurada — marque uma em Cadastros > Localizações.");
      return;
    }

    const resultado = validateNotaFiscal({
      fornecedorId,
      numeroNota,
      dataEntrada,
      itens: itens.map((i) => ({ materialId: i.materialId, needsFator: i.needsFator })),
    });
    if (!resultado.valid) {
      setErrors(resultado.errors);
      toast.error(resultado.errors.itens ?? "Verifique os campos destacados.");
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      await criarNotaFiscal({
        fornecedorId: Number(fornecedorId),
        numeroNota: numeroNota.trim(),
        dataEmissao: dataEmissao || null,
        dataEntrada,
        observacoes: observacoes.trim() || null,
        chave,
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
          pedidoItemId: i.pedidoItemId,
        })),
      });
      toast.success("Nota fiscal lançada com sucesso.");
      setNumeroNota("");
      setDataEmissao("");
      setObservacoes("");
      setChave(null);
      setDuplicata(null);
      setItens([]);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) setErrors(fieldErrors);
      toast.error(getErrorMessage(err, "Erro ao lançar nota fiscal."));
    } finally {
      setSaving(false);
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

          {duplicata && (
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--accent2, #be1e1e)" }}>
              Esta nota já foi lançada (NF {duplicata.numeroNota}, em {duplicata.dataEntrada}) — os dados abaixo são
              só pra consulta, lançar de novo fica bloqueado.
            </p>
          )}

          <div className="nf-divider" />

          <div className="frow frow--2">
            <Select
              label="Fornecedor *"
              options={fornecedoresOptions}
              value={fornecedorId}
              onChange={(e) => {
                setFornecedorId(e.target.value);
                setDuplicata(null);
                if (errors.fornecedorId) setErrors((prev) => ({ ...prev, fornecedorId: "" }));
              }}
              placeholder="Selecione..."
              error={errors.fornecedorId}
            />
            <Input
              label="Número da nota *"
              value={numeroNota}
              onChange={(e) => {
                setNumeroNota(e.target.value);
                setDuplicata(null);
                if (errors.numeroNota) setErrors((prev) => ({ ...prev, numeroNota: "" }));
              }}
              placeholder="Ex: 12345"
              error={errors.numeroNota}
            />
          </div>

          <div className="frow frow--2">
            <Input label="Emissão" type="date" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} />
            <Input
              label="Entrada *"
              type="date"
              value={dataEntrada}
              onChange={(e) => {
                setDataEntrada(e.target.value);
                if (errors.dataEntrada) setErrors((prev) => ({ ...prev, dataEntrada: "" }));
              }}
              error={errors.dataEntrada}
            />
          </div>

          <Input
            label="Observações"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Opcional..."
          />

          <p style={{ margin: 0, fontSize: 12.5 }}>
            {recebimento ? (
              <span style={{ color: "var(--text-muted)" }}>
                Entrada em: <strong style={{ color: "var(--text-h)" }}>{recebimento.codigo}</strong>
                {recebimento.descricao ? ` — ${recebimento.descricao}` : ""} — depois é só transferir pra
                localização definitiva.
              </span>
            ) : (
              <span style={{ color: "var(--accent2, #be1e1e)" }}>
                Nenhuma localização de recebimento configurada — marque uma em Cadastros &gt; Localizações antes de
                lançar.
              </span>
            )}
          </p>

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
            {itemErrors.materialId && (
              <span style={{ color: "var(--accent2, #be1e1e)", fontSize: 11.5 }}>{itemErrors.materialId}</span>
            )}
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
              error={itemErrors.unidadeCompra}
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
              error={itemErrors.qtdNf}
            />
            <Input
              label="Fator (metros/rolo)"
              type="text"
              inputMode="decimal"
              value={fator}
              onChange={(e) => handleFatorChange(e.target.value)}
              placeholder="Ex: 20"
              title="Só pra fita — quantos metros tem em 1 rolo comprado."
              error={itemErrors.fator}
            />
            <Input
              label="Qtd (UN) *"
              type="text"
              inputMode="decimal"
              value={qtdUn}
              onChange={(e) => setQtdUn(e.target.value)}
              placeholder="0"
              error={itemErrors.qtdUn}
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

          <Button
            variant="primary"
            loading={saving}
            disabled={!!duplicata}
            onClick={handleSubmit}
            style={{ width: "100%", marginTop: 8 }}
            title={duplicata ? "Esta nota já foi lançada — não pode ser lançada de novo." : undefined}
          >
            <FileText size={14} />
            Lançar Nota Fiscal
          </Button>
        </aside>

        <section className="nf-hist-panel">
          <h2 className="nf-panel-title">Itens da Nota</h2>
          {itens.length === 0 ? (
            <p style={{ padding: "12px 0", opacity: 0.5, fontSize: 13 }}>
              Nenhum item adicionado ainda — importe um XML ou use "Adicionar item".
            </p>
          ) : (
            <div className="nf-itens-rascunho">
              {itens.map((i) => {
                const materialDoItem = materiais.find((m) => m.id === i.materialId);
                const ehChapa = materialDoItem?.unidadeBase === "M2";
                const unidadeChapaDesconhecida =
                  ehChapa && !["M2", "UN"].includes(normalizarUnidadeCompra(i.unidadeCompra));
                return i.materialId == null ? (
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
                    {i.origemXml ? (
                      <span className="nf-item-row__remove" title="Veio da nota fiscal — não pode ser removido, só trocar o material.">
                        <Lock size={13} />
                      </span>
                    ) : (
                      <button type="button" className="nf-item-row__remove" onClick={() => handleRemoveItem(i._key)}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ) : i.needsFator ? (
                  <div key={i._key} className="nf-item-row nf-item-row--evidencia">
                    <div className="nf-item-row__info" style={{ flex: 1 }}>
                      <strong>{i.codigoInterno}</strong> — {i.descricao}
                      {unidadeChapaDesconhecida ? (
                        <>
                          <span className="nf-item-row__qtd">
                            {fmtQtd(i.qtdNf)} {i.unidadeCompra}
                            {i.precoNf != null ? ` · ${fmtMoeda(i.precoNf)}/${i.unidadeCompra}` : ""} — unidade de
                            compra não reconhecida pra chapa (esperado UN ou M2)
                          </span>
                          <span className="nf-item-row__hint">
                            Corrija a unidade de compra deste item (ou troque o material, se foi casado errado).
                          </span>
                          <Input
                            type="text"
                            uppercase
                            maxLength={10}
                            defaultValue={i.unidadeCompra}
                            placeholder="Ex: UN ou M2"
                            onBlur={(e) => handleCorrigirUnidadeCompra(i._key, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                            }}
                          />
                        </>
                      ) : ehChapa ? (
                        <>
                          <span className="nf-item-row__qtd">
                            {fmtQtd(i.qtdNf)} {i.unidadeCompra}
                            {i.precoNf != null ? ` · ${fmtMoeda(i.precoNf)}/${i.unidadeCompra}` : ""} — material sem
                            m²/chapa cadastrado, não dá pra converter pra UN
                          </span>
                          <span className="nf-item-row__hint">
                            Cadastre o m² por chapa desse material antes de lançar esta nota.
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="nf-item-row__qtd">
                            {fmtQtd(i.qtdNf)} {i.unidadeCompra}
                            {i.precoNf != null ? ` · ${fmtMoeda(i.precoNf)}/${i.unidadeCompra}` : ""} — controlado em
                            metros, falta o fator de conversão
                          </span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Metros por rolo (ex: 20)"
                            defaultValue={i.fator != null ? String(i.fator) : ""}
                            onBlur={(e) => handleResolverFator(i._key, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                            }}
                          />
                        </>
                      )}
                    </div>
                    {i.origemXml ? (
                      <span className="nf-item-row__remove" title="Veio da nota fiscal — não pode ser removido, só trocar o material.">
                        <Lock size={13} />
                      </span>
                    ) : (
                      <button type="button" className="nf-item-row__remove" onClick={() => handleRemoveItem(i._key)}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div key={i._key} className="nf-item-row">
                    <div className="nf-item-row__info">
                      <strong>{i.codigoInterno}</strong> — {i.descricao}
                      <span className="nf-item-row__qtd">
                        {fmtQtd(i.qtdNf)} {i.unidadeCompra} → {fmtQtd(i.qtdUn)} {UNIDADE_LABEL[materialDoItem?.unidadeBase ?? "UN"] ?? materialDoItem?.unidadeBase}
                        {i.precoUn != null ? ` · ${fmtMoeda(i.precoUn)}/${UNIDADE_LABEL[materialDoItem?.unidadeBase ?? "UN"] ?? materialDoItem?.unidadeBase}` : ""}
                      </span>
                      {(() => {
                        const candidatos = pedidosAbertos.filter((p) => p.material_id === i.materialId);
                        if (candidatos.length === 0) return null;
                        return (
                          <select
                            className="nf-item-row__pedido"
                            value={i.pedidoItemId ?? ""}
                            onChange={(e) => handlePedidoItemChange(i._key, e.target.value)}
                          >
                            <option value="">Não veio de um pedido</option>
                            {candidatos.map((p) => (
                              <option key={p.id} value={p.id}>
                                Pedido #{p.solicitacao_id} — {fmtQtd(p.quantidade)} {UNIDADE_LABEL[materialDoItem?.unidadeBase ?? "UN"] ?? materialDoItem?.unidadeBase} (
                                {new Date(p.data_pedido).toLocaleDateString("pt-BR")})
                              </option>
                            ))}
                          </select>
                        );
                      })()}
                    </div>
                    {i.origemXml ? (
                      <span className="nf-item-row__remove" title="Veio da nota fiscal — não pode ser removido, só trocar o material.">
                        <Lock size={13} />
                      </span>
                    ) : (
                      <button type="button" className="nf-item-row__remove" onClick={() => handleRemoveItem(i._key)}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
              <div className="nf-total-rascunho">Total: {fmtMoeda(valorTotalRascunho || null)}</div>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
