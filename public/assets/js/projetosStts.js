import { ajustarTamanhoModal, getConfig, setConfig } from "./utils.js";
import { Dom, Table, Style, q, ce, qa } from "./UI/interface.js";
import { API } from "./service/api.js";
import { DateTime } from "./utils/time.js";
import { enableTableFilterSort } from "./filtertable.js";
import { Modal } from "./utils/modal.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  ui: {
    dataFiltro: "#txt_datafilter",
    tableMain: "#table",
    tableAcessorios: "#table-1",
  },

  projeto: {
    numOc: "#txt_numoc",
    cliente: "#txt_cliente",
    contrato: "#txt_contrato",
    codCc: "#txt_codcc",
    ambiente: "#txt_ambiente",
    numProj: "#txt_numproj",
    lote: "#txt_lote",
    observacoes: "#txt_observacoes",
    chegouFabrica: "#txt_chegoufabrica",
    dataEntrega: "#txt_dataentrega",
  },

  status: {
    corte: "#lb_corte",
    customizacao: "#lb_customizacao",
    coladeira: "#lb_coladeira",
    usinagem: "#lb_usinagem",
    montagem: "#lb_montagem",
    paineis: "#lb_paineis",
    acabamento: "#lb_acabamento",
    embalagem: "#lb_embalagem",
    previsao: "#lb_previsao",
    pronto: "#lb_pronto",
    entrega: "#lb_entrega",
    tamanho: "#lb_tamanho",
    totalVolumes: "#lb_total_volumes",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const StatusAPI = {
  fetchStatusTable(dateCondition) {
    const url = `/fillTableStts?data_condition=${dateCondition}`;
    return API.fetchQuery(url);
  },

  fetchAccessoriesByOc(orderNumber) {
    const url = `/fillTableAcessorios?p_ordemdecompra=${orderNumber}`;
    return API.fetchQuery(url);
  },

  fetchStatusByOc(orderNumber) {
    const url = `/getStatus?p_ordemdecompra=${orderNumber}`;
    return API.fetchQuery(url);
  },

  // config (via utils)
  fetchConfig(id) {
    return getConfig(id);
  },

  saveConfig(payload) {
    return setConfig(payload);
  },
};

/* =========================================================
   FIELD ACCESS
========================================================= */
const Fields = {
  get(sel) {
    return Dom.getValue(sel);
  },
  set(sel, value) {
    Dom.setValue(sel, value);
  },
  setHtml(sel, html) {
    Dom.setInnerHtml(sel, html);
  },
};

/* =========================================================
   UI MESSAGES
========================================================= */
function showError(message) {
  return Modal.showInfo("error", "ERRO", message);
}

/* =========================================================
   TABLE RENDERING (STATUS PRINCIPAL)
========================================================= */
function td(value, style) {
  return Dom.createElement("td", value, style);
}

function getMainTableBody() {
  const table = q(SELECTORS.ui.tableMain);
  return table ? table.querySelector("tbody") : null;
}

function clearMainTable() {
  const tbody = getMainTableBody();
  if (tbody) tbody.innerHTML = "";
  return tbody;
}

function buildStatusRow(item, index) {
  const tr = ce("tr");
  const tCenter = "text-align: center;";
  tr.classList.add("open-modal-row", "fw-bold");

  const statusColor = Style.colorStatus(item.status);
  const accessoriesColor = Style.setColorBool(item.total);

  tr.append(td(index, tCenter));
  tr.append(td(item.a, tCenter + accessoriesColor));
  tr.append(td(item.ordemdecompra, tCenter));
  tr.append(td(item.pedido, tCenter));
  tr.append(td(item.etapa, tCenter));
  tr.append(td(item.codcc, tCenter));
  tr.append(td(item.cliente));
  tr.append(td(item.contrato, tCenter));
  tr.append(td(item.numproj, tCenter));
  tr.append(td(item.ambiente));
  tr.append(td(item.tipo, tCenter));
  tr.append(td(DateTime.forBr(item.chegoufabrica), tCenter));
  tr.append(td(DateTime.forBr(item.dataentrega), tCenter));
  tr.append(td(item.prazo, tCenter));
  tr.append(td(item.status, tCenter + statusColor));
  tr.append(td(DateTime.forBr(item.iniciado), tCenter));
  tr.append(td(DateTime.forBr(item.previsao), tCenter));
  tr.append(td(DateTime.forBr(item.pronto), tCenter));
  tr.append(td(DateTime.forBr(item.entrega), tCenter));

  return tr;
}

async function renderStatusTable(dateCondition) {
  if (!dateCondition) return;

  const res = await StatusAPI.fetchStatusTable(dateCondition);
  if (res.status !== 200) {
    await showError("Não foi possível carregar os dados: " + res.data);
    return;
  }

  const tbody = clearMainTable();
  if (!tbody) return;

  let i = 1;
  res.data.forEach((item) => tbody.appendChild(buildStatusRow(item, i++)));
}

/* =========================================================
   ACESSÓRIOS TABLE
========================================================= */
function getAccessoriesTableBody() {
  // mantendo compatível com seu código atual (segunda tabela do DOM)
  const table = qa("table")[1];
  return table ? table.querySelector("tbody") : null;
}

function clearAccessoriesTable() {
  const tbody = getAccessoriesTableBody();
  if (tbody) tbody.innerHTML = "";
  return tbody;
}

function buildAccessoryRow(item) {
  const tr = ce("tr");
  tr.append(td(item.id));
  tr.append(td(item.descricao));
  tr.append(td(item.medida));
  tr.append(td(item.qtd));
  tr.append(td(item.datacompra));
  tr.append(td(item.previsao));
  tr.append(td(item.recebido));
  return tr;
}

async function loadAndRenderAccessories(ordemdecompra) {
  const res = await StatusAPI.fetchAccessoriesByOc(ordemdecompra);
  if (res.status !== 200) {
    await showError("Não foi possível carregar dados de acessórios");
    return;
  }

  const tbody = clearAccessoriesTable();
  if (!tbody) return;

  res.data.forEach((item) => tbody.appendChild(buildAccessoryRow(item)));
}

/* =========================================================
   FORM POPULATION (API -> UI)
========================================================= */
function applyStatusColor(selector, value) {
  const el = q(selector);
  if (!el) return;

  const map = {
    FINALIZADO: "green",
    INICIADO: "yellow",
  };

  el.style.color = map[value] || "gray";
}

function setStatusLabel(selector, value) {
  Fields.setHtml(selector, value);
  applyStatusColor(selector, value);
}

function setDateField(selector, value) {
  Fields.set(selector, DateTime.forBr(value));
}

function populateBasicFields(item) {
  Fields.set(SELECTORS.projeto.numOc, item.ordemdecompra);
  Fields.set(SELECTORS.projeto.cliente, item.cliente);
  Fields.set(SELECTORS.projeto.contrato, item.contrato);
  Fields.set(SELECTORS.projeto.codCc, item.codcc);
  Fields.set(SELECTORS.projeto.ambiente, item.ambiente);
  Fields.set(SELECTORS.projeto.numProj, item.numproj);
  Fields.set(SELECTORS.projeto.lote, item.lote);
  Fields.set(SELECTORS.projeto.observacoes, item.observacoes);
}

function populateDateFields(item) {
  setDateField(SELECTORS.projeto.chegouFabrica, item.chegoufabrica);
  setDateField(SELECTORS.projeto.dataEntrega, item.dataentrega);
}

function populateStatusFields(item) {
  setStatusLabel(SELECTORS.status.corte, item.scorte);
  setStatusLabel(SELECTORS.status.customizacao, item.scustom);
  setStatusLabel(SELECTORS.status.coladeira, item.scoladeira);
  setStatusLabel(SELECTORS.status.usinagem, item.susinagem);
  setStatusLabel(SELECTORS.status.montagem, item.smontagem);
  setStatusLabel(SELECTORS.status.paineis, item.spaineis);
  setStatusLabel(SELECTORS.status.acabamento, item.sacabamento);
  setStatusLabel(SELECTORS.status.embalagem, item.sembalagem);

  Fields.setHtml(SELECTORS.status.previsao, DateTime.forBr(item.previsao));
  Fields.setHtml(SELECTORS.status.pronto, DateTime.forBr(item.pronto));
  Fields.setHtml(SELECTORS.status.entrega, DateTime.forBr(item.entrega));

  Fields.setHtml(SELECTORS.status.tamanho, item.tamanho);
  Fields.setHtml(SELECTORS.status.totalVolumes, item.totalvolumes);
}

async function loadStatusDetail(ordemdecompra) {
  const res = await StatusAPI.fetchStatusByOc(ordemdecompra);
  if (res.status !== 200) {
    await showError(`Não foi possível carregar os dados: ${res.data}`);
    return;
  }

  res.data.forEach((item) => {
    populateBasicFields(item);
    populateDateFields(item);
    populateStatusFields(item);
  });
}

/* =========================================================
   CONFIG (FILTER)
========================================================= */
async function loadFilterFromConfig() {
  try {
    const data = await StatusAPI.fetchConfig(2);
    Fields.set(SELECTORS.ui.dataFiltro, data?.[0]?.p_data ?? "");
  } catch {}
}

async function saveFilterToConfig() {
  const payload = {
    p_id: 2,
    p_date: Fields.get(SELECTORS.ui.dataFiltro),
  };
  await StatusAPI.saveConfig(payload);
}

async function handleFilterBlur() {
  const filter = Fields.get(SELECTORS.ui.dataFiltro);
  await renderStatusTable(filter);
  await saveFilterToConfig();
}

/* =========================================================
   TABLE HANDLERS
========================================================= */
function getOrderNumberFromTd(tdEl) {
  const tr = tdEl?.closest("tr");
  if (!tr || !tr.cells || tr.cells.length < 3) return null;
  return tr.cells[2].innerText;
}

async function handleMainTableDoubleClick(event) {
  const tdEl = event.target;
  const tr = tdEl.closest(".open-modal-row");
  if (!tr || tdEl.tagName !== "TD") return;

  const oc = getOrderNumberFromTd(tdEl);
  if (!oc) return;

  await loadStatusDetail(oc);
  await loadAndRenderAccessories(oc);
  Modal.show("modal");
}

/* =========================================================
   INIT
========================================================= */
function configureUiDefaults() {
  ajustarTamanhoModal();
  Table.onmouseover("table");
  Table.onclickHighlightRow("table");
  Dom.enableEnterAsTab?.(); // se existir no seu helper, mantém padrão do outro arquivo
}

function bindEvents() {
  Dom.addEventBySelector(
    SELECTORS.ui.tableMain,
    "dblclick",
    handleMainTableDoubleClick
  );

  Dom.addEventBySelector(SELECTORS.ui.dataFiltro, "blur", handleFilterBlur);

  window.addEventListener("resize", ajustarTamanhoModal);
}

async function init() {
  configureUiDefaults();

  await loadFilterFromConfig();
  await renderStatusTable(Fields.get(SELECTORS.ui.dataFiltro));

  enableTableFilterSort("table");
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);
