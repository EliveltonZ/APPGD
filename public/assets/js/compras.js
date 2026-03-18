import { loadPage, getConfig, setConfig } from "./utils.js";
import { enableTableFilterSort } from "./filtertable.js";
import { Dom, Style, Table, q, ce } from "./UI/interface.js";
import { DateTime } from "./utils/time.js";
import { API } from "./service/api.js";
import { Modal } from "./utils/modal.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  form: {
    id: "#txt_id",
    descricao: "#txt_descricao",
    medida: "#txt_medida",
    parcelamento: "#txt_parcelamento",
    cartao: "#txt_cartao",
    qtd: "#txt_quantidade",
    fornecedor: "#txt_fornecedor",
    compra: "#txt_compra",
    previsao: "#txt_previsao",
    recebido: "#txt_recebido",
    contrato: "#txt_contrato",
    cliente: "#txt_cliente",
    ambiente: "#txt_ambiente",
    filtro: "#txt_datafilter",
  },
  table: {
    root: "#table",
    tbody: "tbody",
  },
  buttons: {
    update: "#bt_update",
  },
  modal: {
    id: "modal",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const PurchasesAPI = {
  fetchAccessoriesPurchases(dateFilter) {
    const url = `/getAcessoriosCompras?p_dataentrega=${dateFilter}`;
    return API.fetchQuery(url);
  },
  updateAccessory(payload) {
    return API.fetchBody("/setAcessorios", "PUT", payload);
  },
};

/* =========================================================
   FIELD ACCESS
========================================================= */
const Fields = {
  get(selector) {
    return Dom.getValue(selector);
  },
  set(selector, value) {
    Dom.setValue(selector, value);
  },
};

/* =========================================================
   UI MESSAGES
========================================================= */
function showHttpError(title, status) {
  return Modal.showInfo("error", "ERRO", `${title} (HTTP ${status})`);
}

function showError(message) {
  return Modal.showInfo("error", "ERRO", message);
}

function showSuccess(message) {
  return Modal.showInfo("success", "Sucesso", message);
}

/* =========================================================
   NORMALIZERS / FORMATTERS
========================================================= */
function toNumberOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function td(value, style) {
  return Dom.createElement("td", value, style);
}

function formatDateBr(value) {
  return DateTime.forBr(value);
}

function formatDateIso(value) {
  return DateTime.forISO(value);
}

/* =========================================================
   TABLE RENDERING
========================================================= */
function clearTableBody() {
  const tbody = q(SELECTORS.table.tbody);
  if (tbody) tbody.innerHTML = "";
  return tbody;
}

function buildRowFromItem(item) {
  const tr = ce("tr");
  const left = "text-align:left;";
  const statusStyle = Style.colorStatus(item.status);

  tr.classList.add("open-modal-row");
  tr.append(td(item.contrato));
  tr.append(td(item.cliente, left));
  tr.append(td(item.ambiente, left));
  tr.append(td(item.descricao, left));
  tr.append(td(item.medida));
  tr.append(td(item.parcelamento));
  tr.append(td(item.numcard));
  tr.append(td(item.qtd));
  tr.append(td(item.fornecedor));
  tr.append(td(formatDateBr(item.dataentrega)));
  tr.append(td(formatDateBr(item.datacompra)));
  tr.append(td(formatDateBr(item.previsao)));
  tr.append(td(formatDateBr(item.recebido)));
  tr.append(td(item.status, statusStyle));
  tr.append(td(item.categoria));
  tr.append(td(item.id, "display: none;"));
  return tr;
}

function renderAccessoriesPurchases(rows) {
  const tbody = clearTableBody();
  if (!tbody) return;
  rows.forEach((item) => tbody.appendChild(buildRowFromItem(item)));
}

/* =========================================================
   FORM POPULATION (TABLE -> FORM)
========================================================= */
const COLUMN_TO_FIELD = {
  15: { selector: SELECTORS.form.id },
  0: { selector: SELECTORS.form.contrato },
  1: { selector: SELECTORS.form.cliente },
  2: { selector: SELECTORS.form.ambiente },
  3: { selector: SELECTORS.form.descricao },
  4: { selector: SELECTORS.form.medida },
  5: { selector: SELECTORS.form.parcelamento },
  6: { selector: SELECTORS.form.cartao },
  7: { selector: SELECTORS.form.qtd },
  8: { selector: SELECTORS.form.fornecedor },
  10: { selector: SELECTORS.form.compra, isDate: true },
  11: { selector: SELECTORS.form.previsao, isDate: true },
  12: { selector: SELECTORS.form.recebido, isDate: true },
};

function fillFormFromRowCell(cell) {
  Object.entries(COLUMN_TO_FIELD).forEach(([index, cfg]) => {
    const value = Table.getIndexColumnValue(cell, index);
    Fields.set(cfg.selector, cfg.isDate ? formatDateIso(value) : value);
  });
}

/* =========================================================
   PAYLOAD (FORM -> API)
========================================================= */
function buildAccessoryPayloadFromForm() {
  return {
    p_id: Fields.get(SELECTORS.form.id),
    p_descricao: Fields.get(SELECTORS.form.descricao),
    p_medida: Fields.get(SELECTORS.form.medida),
    p_parcelamento: toNumberOrZero(Fields.get(SELECTORS.form.parcelamento)),
    p_numcard: toNumberOrZero(Fields.get(SELECTORS.form.cartao)),
    p_qtd: toNumberOrZero(Fields.get(SELECTORS.form.qtd)),
    p_fornecedor: Fields.get(SELECTORS.form.fornecedor),
    p_datacompra: Fields.get(SELECTORS.form.compra),
    p_previsao: Fields.get(SELECTORS.form.previsao),
    p_recebido: Fields.get(SELECTORS.form.recebido),
  };
}

/* =========================================================
   USE CASES / HANDLERS
========================================================= */
function getCurrentFilterDate() {
  return Fields.get(SELECTORS.form.filtro);
}

async function loadAccessoriesPurchases() {
  const filter = getCurrentFilterDate();

  try {
    const res = await PurchasesAPI.fetchAccessoriesPurchases(filter);

    if (res.status !== 200) {
      await showHttpError("Erro ao buscar itens", res.status);
      return;
    }

    renderAccessoriesPurchases(res.data);
  } catch (err) {
    await showError(`Erro ao buscar itens: ${err?.message || err}`);
  }
}

async function handleTableDblClick(event) {
  const target = event.target;
  if (target?.tagName !== "TD") return;

  fillFormFromRowCell(target);
  Modal.show(SELECTORS.modal.id);
}

async function handleUpdateClick() {
  try {
    const payload = buildAccessoryPayloadFromForm();
    const res = await PurchasesAPI.updateAccessory(payload);

    if (res.status !== 200) {
      await showHttpError("Erro ao salvar alterações", res.status);
      return;
    }

    await showSuccess("Alterações salvas com Sucesso !!!");
  } catch (err) {
    await showError(`Erro ao salvar alterações: ${err?.message || err}`);
  }
}

/* =========================================================
   FILTER CONFIG (PERSIST)
========================================================= */
const FILTER_CONFIG_ID = 3;

async function loadFilterFromConfig() {
  const data = await getConfig(FILTER_CONFIG_ID);
  const saved = data?.[0]?.p_data;
  if (saved) Fields.set(SELECTORS.form.filtro, saved);
}

async function saveFilterToConfig() {
  const payload = {
    p_id: FILTER_CONFIG_ID,
    p_date: getCurrentFilterDate(),
  };
  await setConfig(payload);
}

async function handleFilterBlur() {
  await loadAccessoriesPurchases();
  await saveFilterToConfig();
}

/* =========================================================
   PAGE SETUP (INIT)
========================================================= */
function setupTableUi() {
  Table.onmouseover("table");
  Table.onclickHighlightRow("table");
  enableTableFilterSort("table");
}

function bindEvents() {
  Dom.addEventBySelector(SELECTORS.table.root, "dblclick", handleTableDblClick);
  Dom.addEventBySelector(SELECTORS.form.filtro, "blur", handleFilterBlur);
  Dom.addEventBySelector(SELECTORS.buttons.update, "click", handleUpdateClick);
}

async function initPurchasesPage() {
  loadPage("compras", "compras.html");

  Dom.allUpperCase();
  setupTableUi();
  bindEvents();

  await loadFilterFromConfig();
  await loadAccessoriesPurchases();
}

document.addEventListener("DOMContentLoaded", initPurchasesPage);
