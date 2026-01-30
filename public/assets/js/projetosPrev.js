import Swal from "./sweetalert2.esm.all.min.js";
import {
  ajustarTamanhoModal,
  loadPage,
  checkPrevisao,
  getName,
} from "./utils.js";

import { Modal } from "./utils/modal.js";
import { DateTime } from "./utils/time.js";
import { enableTableFilterSort } from "./filtertable.js";
import { Dom, Table, Style, q, ce, qa } from "./UI/interface.js";
import { API } from "./service/api.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  projeto: {
    numOc: "#txt_numoc",
    cliente: "#txt_cliente",
    contrato: "#txt_contrato",
    codCc: "#txt_codcc",
    ambiente: "#txt_ambiente",
    numProj: "#txt_numproj",
    lote: "#txt_lote",
    chegouFabrica: "#txt_chegoufabrica",
    dataEntrega: "#txt_dataentrega",
    observacoes: "#txt_observacoes",
  },

  etapas: {
    corte: {
      inicio: "#txt_corteinicio",
      fim: "#txt_cortefim",
      pausa: "#chk_corte",
      respId: "#txt_corteid",
      respNome: "#txt_corteresp",
    },
    customizacao: {
      inicio: "#txt_customizacaoinicio",
      fim: "#txt_customizacaofim",
      pausa: "#chk_customizacao",
      respId: "#txt_customizacaoid",
      respNome: "#txt_customizacaoresp",
    },
    coladeira: {
      inicio: "#txt_coladeirainicio",
      fim: "#txt_coladeirafim",
      pausa: "#chk_coladeira",
      respId: "#txt_coladeiraid",
      respNome: "#txt_coladeiraresp",
    },
    usinagem: {
      inicio: "#txt_usinageminicio",
      fim: "#txt_usinagemfim",
      pausa: "#chk_usinagem",
      respId: "#txt_usinagemid",
      respNome: "#txt_usinagemresp",
    },
    montagem: {
      inicio: "#txt_montageminicio",
      fim: "#txt_montagemfim",
      pausa: "#chk_montagem",
      respId: "#txt_montagemid",
      respNome: "#txt_montagemresp",
    },
    paineis: {
      inicio: "#txt_paineisinicio",
      fim: "#txt_paineisfim",
      pausa: "#chk_paineis",
      respId: "#txt_paineisid",
      respNome: "#txt_paineisresp",
    },
    acabamentos: {
      inicio: "#txt_acabamentoinicio",
      fim: "#txt_acabamentofim",
      pausa: "#chk_acabamento",
      respId: "#txt_acabamentoid",
      respNome: "#txt_acabamentoresp",
    },
    embalagem: {
      inicio: "#txt_embalageminicio",
      fim: "#txt_embalagemfim",
      pausa: "#chk_embalagem",
      respId: "#txt_embalagemid",
      respNome: "#txt_embalagemresp",
    },
  },

  ui: {
    table: "#table",
  },

  modalAcessorios: {
    tbody: () => qa("table tbody")[1],
  },
};

/* =========================================================
   API LAYER
========================================================= */
const PrevisaoAPI = {
  fetchProjects() {
    return API.fetchQuery("/fillTablePrevisao");
  },

  fetchProjectByOc(orderNumber) {
    const url = `/getPrevisao?p_ordemdecompra=${orderNumber}`;
    return API.fetchQuery(url);
  },

  fetchAccessories(orderNumber) {
    const url = `/fillTableAcessorios?p_ordemdecompra=${orderNumber}`;
    return API.fetchQuery(url);
  },
};

/* =========================================================
   FIELD ACCESS
========================================================= */
const Fields = {
  set(sel, value) {
    Dom.setValue(sel, value);
  },
  setChecked(sel, value) {
    Dom.setChecked(sel, value);
  },
};

/* =========================================================
   UI MESSAGES
========================================================= */
function showError(message) {
  return Modal.showInfo("error", "ERRO", message);
}

/* =========================================================
   FORMATTERS / STYLES
========================================================= */
function statusTextColor(statusText) {
  if (statusText === "FINALIZADO") return "color: rgb(70, 136, 0);";
  if (statusText === "INICIADO") return "color:rgb(194, 184, 6)";
  return "";
}

function td(value, style = "") {
  return Dom.createElement("td", value, style);
}

/* =========================================================
   MAIN TABLE (PROJECTS)
========================================================= */
function getProjectsTbody() {
  return q("tbody");
}

function clearProjectsTable() {
  const tbody = getProjectsTbody();
  if (tbody) tbody.innerHTML = "";
  return tbody;
}

function buildProjectRow(item, index) {
  const leftText = "text-align: left;";

  const corCorte = statusTextColor(item.scorte);
  const corCustom = statusTextColor(item.scustom);
  const corColadeira = statusTextColor(item.scoladeira);
  const corUsinagem = statusTextColor(item.susinagem);
  const corPaineis = statusTextColor(item.spaineis);
  const corMontagem = statusTextColor(item.smontagem);
  const corEmbalagem = statusTextColor(item.sembalagem);
  const corSeparacao = statusTextColor(item.sseparacao);
  const corStatus = Style.colorStatus(item.status);
  const corA = Style.setColorBool(item.total);

  // mantém o cálculo (mesmo que não seja usado diretamente)
  const corPrev = checkPrevisao(item.previsao, item.dataentrega);

  const tr = ce("tr");
  tr.classList.add("open-modal-row", "fw-bold");
  tr.append(td(index));
  tr.append(td(item.a, corA));
  tr.append(td(item.pedido));
  tr.append(td(item.etapa));
  tr.append(td(item.codcc));
  tr.append(td(item.lote));
  tr.append(td(item.cliente, leftText));
  tr.append(td(item.contrato));
  tr.append(td(item.ambiente, leftText));
  tr.append(td(item.status, corStatus));
  tr.append(td(item.dias_restantes));
  tr.append(td(item.material));
  tr.append(td(item.scorte, corCorte));
  tr.append(td(item.scustom, corCustom));
  tr.append(td(item.scoladeira, corColadeira));
  tr.append(td(item.susinagem, corUsinagem));
  tr.append(td(item.spaineis, corPaineis));
  tr.append(td(item.smontagem, corMontagem));
  tr.append(td(item.sembalagem, corEmbalagem));
  tr.append(td(item.sseparacao, corSeparacao));
  tr.append(td(DateTime.forBr(item.dataentrega)));
  tr.append(td(DateTime.forBr(item.previsao)));
  tr.append(td(item.ordemdecompra, "display: None;"));

  return tr;
}

async function loadAndRenderProjectsTable() {
  const res = await PrevisaoAPI.fetchProjects();

  if (res.status !== 200) {
    await showError(`${res.data}`);
    return;
  }

  const tbody = clearProjectsTable();
  if (!tbody) return;

  let num = 1;
  res.data.forEach((item) => tbody.appendChild(buildProjectRow(item, num++)));
}

/* =========================================================
   ACESSÓRIOS TABLE (MODAL)
========================================================= */
async function loadAndRenderAccessories(ordemdecompra) {
  const res = await PrevisaoAPI.fetchAccessories(ordemdecompra);

  if (res.status !== 200) {
    await showError(`Erro ao carregar acessorios !!! ${res.data}`);
    return;
  }

  const tbody = SELECTORS.modalAcessorios.tbody();
  if (!tbody) return;

  tbody.innerHTML = "";
  tbody.style.font = "9px";

  const dNone = "display: none;";
  const textLeft = "text-align: left;";

  res.data.forEach((item) => {
    const tr = ce("tr");
    tr.append(td(item.id, dNone));
    tr.append(td(item.descricao, textLeft));
    tr.append(td(item.medida));
    tr.append(td(item.qtd));
    tr.append(td(DateTime.forBr(item.datacompra)));
    tr.append(td(DateTime.forBr(item.previsao)));
    tr.append(td(DateTime.forBr(item.recebido)));
    tbody.appendChild(tr);
  });
}

/* =========================================================
   MODAL POPULATION (PROJECT DETAILS)
========================================================= */
async function fillProjectFields(item) {
  Fields.set(SELECTORS.projeto.numOc, item.ordemdecompra);
  Fields.set(SELECTORS.projeto.cliente, item.cliente);
  Fields.set(SELECTORS.projeto.contrato, item.contrato);
  Fields.set(SELECTORS.projeto.codCc, item.codcc);
  Fields.set(SELECTORS.projeto.ambiente, item.ambiente);
  Fields.set(SELECTORS.projeto.numProj, item.numproj);
  Fields.set(SELECTORS.projeto.lote, item.lote);
  Fields.set(
    SELECTORS.projeto.chegouFabrica,
    DateTime.forBr(item.chegoufabrica),
  );
  Fields.set(SELECTORS.projeto.dataEntrega, DateTime.forBr(item.dataentrega));
  Fields.set(SELECTORS.projeto.observacoes, item.observacoes);
}

async function fillStageFields(stage, item, keys) {
  Fields.set(stage.inicio, item[keys.inicio]);
  Fields.set(stage.fim, item[keys.fim]);
  Fields.setChecked(stage.pausa, item[keys.pausa]);
  Fields.set(stage.respId, item[keys.respId]);
  Fields.set(stage.respNome, item[keys.respNome]);
}

async function populateModalFromProject(orderBuy) {
  const res = await PrevisaoAPI.fetchProjectByOc(orderBuy);

  if (res.status !== 200) {
    await showError(`Ocorreu um erro ao carregar o projeto: ${res.data}`);
    return;
  }

  for (const item of res.data) {
    await fillProjectFields(item);

    await fillStageFields(SELECTORS.etapas.corte, item, {
      inicio: "corteinicio",
      fim: "cortefim",
      pausa: "cortepausa",
      respId: "corteresp",
      respNome: "cortename",
    });
    await fillStageFields(SELECTORS.etapas.customizacao, item, {
      inicio: "customizacaoinicio",
      fim: "customizacaofim",
      pausa: "customizacaopausa",
      respId: "customizacaoresp",
      respNome: "customizacaoname",
    });

    await fillStageFields(SELECTORS.etapas.coladeira, item, {
      inicio: "coladeirainicio",
      fim: "coladeirafim",
      pausa: "coladeirapausa",
      respId: "coladeiraresp",
      respNome: "coladeiraname",
    });

    await fillStageFields(SELECTORS.etapas.usinagem, item, {
      inicio: "usinageminicio",
      fim: "usinagemfim",
      pausa: "usinagempausa",
      respId: "usinagemresp",
      respNome: "usinagemname",
    });

    await fillStageFields(SELECTORS.etapas.montagem, item, {
      inicio: "montageminicio",
      fim: "montagemfim",
      pausa: "montagempausa",
      respId: "montagemresp",
      respNome: "montagemname",
    });

    await fillStageFields(SELECTORS.etapas.paineis, item, {
      inicio: "paineisinicio",
      fim: "paineisfim",
      pausa: "paineispausa",
      respId: "paineisresp",
      respNome: "paineisname",
    });

    await fillStageFields(SELECTORS.etapas.acabamentos, item, {
      inicio: "acabamentoinicio",
      fim: "acabamentofim",
      pausa: "acabamentopausa",
      respId: "acabamentoresp",
      respNome: "acabamentoname",
    });

    await fillStageFields(SELECTORS.etapas.embalagem, item, {
      inicio: "embalageminicio",
      fim: "embalagemfim",
      pausa: "embalagempausa",
      respId: "embalagemresp",
      respNome: "embalagemname",
    });
  }
}

/* =========================================================
   EVENT HANDLERS
========================================================= */
function getOcFromRowCell(tdEl) {
  return Table.getIndexColumnValue(tdEl, 22);
}

async function handleTableDoubleClick(event) {
  const tdEl = event.target;
  const tr = tdEl.closest(".open-modal-row");
  if (!tr || tdEl.tagName !== "TD") return;

  const oc = getOcFromRowCell(tdEl);

  await populateModalFromProject(oc);
  await loadAndRenderAccessories(oc);
  Modal.show("modal");
}

/* =========================================================
   INIT
========================================================= */
function configureUiDefaults() {
  loadPage("previsao", "previsoes.html");
  Table.onmouseover(SELECTORS.ui.table);
  Table.onclickHighlightRow(SELECTORS.ui.table);
  enableTableFilterSort(SELECTORS.ui.table.slice(1));
  window.addEventListener("resize", ajustarTamanhoModal);
}

function bindEvents() {
  Dom.addEventBySelector(
    SELECTORS.ui.table,
    "dblclick",
    handleTableDoubleClick,
  );
}

async function init() {
  configureUiDefaults();
  await loadAndRenderProjectsTable();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);
