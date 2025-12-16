import { loadPage, getGroupedData } from "./utils.js";
import { Modal } from "./utils/modal.js";
import { Dom, Table, q, ce } from "./UI/interface.js";
import { DateTime } from "./utils/time.js";
import { API } from "./service/api.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  inputs: {
    numOc: "#txt_numoc",
    cliente: "#txt_cliente",
    categoria: "#txt_categoria",
    descricao: "#txt_descricao",
    ambiente: "#txt_ambiente",
    medida: "#txt_medida",
    qtd: "#txt_qtd",
    fornecedor: "#txt_fornecedor",
    compra: "#txt_compra",
    previsao: "#txt_previsao",
    recebido: "#txt_recebido",
    entrega: "#txt_entrega",
    contrato: "#txt_contrato",
  },
  buttons: {
    adicionar: "#bt_adicionar",
  },
  tables: {
    contratos: "#table",
    acessorios: "#table-1",
    contratosTbody: "#table tbody",
    acessoriosTbody: "#table-1 tbody",
  },
  modal: {
    contratos: "modal",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const PendenciasAPI = {
  fetchContractPendencies(contractNumber) {
    const url = `/getContratoPendencias?p_contrato=${contractNumber}`;
    return API.fetchQuery(url);
  },

  fetchAccessoriesByOrder(orderNumber) {
    const url = `/fillTableAPendencia?p_ordemdecompra=${orderNumber}`;
    return API.fetchQuery(url);
  },

  deleteAccessoryById(payload) {
    return API.fetchBody("/delAcessorios", "DELETE", payload);
  },

  insertAccessory(payload) {
    return API.fetchBody("/insertAcessorios", "POST", payload);
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
  focus(selector) {
    Dom.setFocus(selector);
  },
};

/* =========================================================
   UI MESSAGES
========================================================= */
function showError(message) {
  return Modal.showInfo("error", "ERRO", message);
}

function showWarning(message) {
  return Modal.showInfo("warning", "Atenção", message);
}

function confirm(message, title = null) {
  return Modal.showConfirmation(title, message);
}

/* =========================================================
   VALIDATORS
========================================================= */
function isValidResponse(res) {
  return res && res.status === 200;
}

function isValidContractValue(value) {
  return !!value && !Number.isNaN(Number(value));
}

async function rejectInvalidContract() {
  await showError("Contrato inválido");
  Fields.set(SELECTORS.inputs.contrato, "");
  Fields.focus(SELECTORS.inputs.contrato);
}

/* =========================================================
   TABLE: CONTRATOS
========================================================= */
function getContractsTbody() {
  return q(SELECTORS.tables.contratosTbody);
}

function clearContractsTable() {
  const tbody = getContractsTbody();
  if (tbody) tbody.innerHTML = "";
  return tbody;
}

function buildContractRow(item) {
  const tr = ce("tr");
  tr.classList.add("open-modal-row");
  tr.append(td(item.p_ordemdecompra));
  tr.append(td(item.p_cliente));
  tr.append(td(item.p_ambiente));
  return tr;
}

function renderContractsTable(rows) {
  const tbody = clearContractsTable();
  if (!tbody) return;
  rows.forEach((item) => tbody.appendChild(buildContractRow(item)));
}

/* =========================================================
   TABLE: ACESSÓRIOS
========================================================= */
function getAccessoriesTbody() {
  return q(SELECTORS.tables.acessoriosTbody);
}

function clearAccessoriesTable() {
  const tbody = getAccessoriesTbody();
  if (tbody) tbody.innerHTML = "";
  return tbody;
}

function td(content, style = "") {
  return Dom.createElement("td", content, style);
}

function buildDeleteButton() {
  const tdWrap = ce("td");
  tdWrap.setAttribute("style", "text-align: center;");

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-danger btn-delete";
  btn.style.cssText = "padding:0px;margin-left:10px;";
  btn.innerHTML = `
    <svg class="d-flex d-xxl-flex justify-content-center justify-content-xxl-center"
      xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"
      fill="none" style="color:rgb(255,255,255);text-align:center;height:100%;width:100%;">
      <path fill-rule="evenodd" clip-rule="evenodd"
        d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z"
        fill="currentColor"></path>
    </svg>
  `;
  tdWrap.appendChild(btn);
  return tdWrap;
}

function buildAccessoryRow(item) {
  const tr = ce("tr");
  tr.append(td(item.p_id));
  tr.append(td(item.p_categoria));
  tr.append(td(item.p_descricao));
  tr.append(td(item.p_medida, "text-align:center;"));
  tr.append(td(item.p_qtd, "text-align:center;"));
  tr.append(td(item.p_fornecedor, "text-align:center;"));
  tr.append(td(DateTime.forBr(item.p_datacompra), "text-align:center;"));
  tr.append(td(DateTime.forBr(item.p_previsao), "text-align:center;"));
  tr.append(td(DateTime.forBr(item.p_recebido), "text-align:center;"));
  tr.appendChild(buildDeleteButton());
  return tr;
}

function renderAccessoriesTable(rows) {
  const tbody = clearAccessoriesTable();
  if (!tbody) return;
  rows.forEach((item) => tbody.appendChild(buildAccessoryRow(item)));
  clearAccessoriesForm();
}

/* =========================================================
   FORM HELPERS
========================================================= */
function clearAccessoriesForm() {
  [
    SELECTORS.inputs.categoria,
    SELECTORS.inputs.descricao,
    SELECTORS.inputs.medida,
    SELECTORS.inputs.qtd,
    SELECTORS.inputs.fornecedor,
    SELECTORS.inputs.compra,
    SELECTORS.inputs.previsao,
    SELECTORS.inputs.recebido,
  ].forEach((sel) => Fields.set(sel, ""));
}

function fillAccessoriesFormFromRow(row) {
  const cells = row.querySelectorAll("td");
  if (cells.length < 9) return;

  Fields.set(SELECTORS.inputs.categoria, cells[1].textContent);
  Fields.set(SELECTORS.inputs.descricao, cells[2].textContent);
  Fields.set(SELECTORS.inputs.medida, cells[3].textContent);
  Fields.set(SELECTORS.inputs.qtd, cells[4].textContent);
  Fields.set(SELECTORS.inputs.fornecedor, cells[5].textContent);
  Fields.set(SELECTORS.inputs.compra, DateTime.forISO(cells[6].textContent));
  Fields.set(SELECTORS.inputs.previsao, DateTime.forISO(cells[7].textContent));
  Fields.set(SELECTORS.inputs.recebido, DateTime.forISO(cells[8].textContent));
}

function buildAccessoryPayloadFromForm() {
  return {
    p_ordemdecompra: Fields.get(SELECTORS.inputs.numOc),
    p_categoria: Fields.get(SELECTORS.inputs.categoria),
    p_descricao: Fields.get(SELECTORS.inputs.descricao),
    p_medida: Fields.get(SELECTORS.inputs.medida),
    p_quantidade: Fields.get(SELECTORS.inputs.qtd),
    p_fornecedor: Fields.get(SELECTORS.inputs.fornecedor),
    p_compra: Fields.get(SELECTORS.inputs.compra),
    p_previsao: Fields.get(SELECTORS.inputs.previsao),
    p_recebido: Fields.get(SELECTORS.inputs.recebido),
  };
}

/* =========================================================
   DOMAIN: CONTRATO
========================================================= */
async function loadContractPendencies() {
  const contract = Fields.get(SELECTORS.inputs.contrato);

  if (!isValidContractValue(contract)) {
    await rejectInvalidContract();
    return;
  }

  const res = await PendenciasAPI.fetchContractPendencies(contract);

  if (
    !isValidResponse(res) ||
    !Array.isArray(res.data) ||
    res.data.length === 0
  ) {
    await showError("Contrato não localizado");
    return;
  }

  const first = res.data[0];
  if (first?.p_dataentrega)
    Fields.set(SELECTORS.inputs.entrega, DateTime.forBr(first.p_dataentrega));

  renderContractsTable(res.data);
}

/* =========================================================
   DOMAIN: ACESSÓRIOS
========================================================= */
async function loadAccessoriesTable(
  orderNumber = Fields.get(SELECTORS.inputs.numOc)
) {
  if (!orderNumber) return;

  const res = await PendenciasAPI.fetchAccessoriesByOrder(orderNumber);

  if (!isValidResponse(res)) {
    await showError("Não foi possível buscar dados na base");
    return;
  }

  renderAccessoriesTable(res.data || []);
}

async function insertAccessoryFlow() {
  const result = await confirm("Deseja inserir novo acessório ?");
  if (!result.isConfirmed) return;

  try {
    const payload = buildAccessoryPayloadFromForm();
    const res = await PendenciasAPI.insertAccessory(payload);

    if (!isValidResponse(res)) {
      await showError("Não foi possível inserir acessório");
      return;
    }

    await loadAccessoriesTable(Fields.get(SELECTORS.inputs.numOc));
  } catch {
    await showError("Não foi possível inserir acessório");
  }
}

async function deleteAccessoryFlowFromButton(button) {
  const row = button.closest("tr");
  const firstCell = row?.querySelector("td");
  const id = firstCell?.textContent?.trim();

  if (!id) return;

  const result = await confirm(
    "Deseja remover o item selecionado ?",
    "REMOVER ITEM"
  );
  if (!result.isConfirmed) return;

  try {
    const res = await PendenciasAPI.deleteAccessoryById({ p_id: id });
    if (!isValidResponse(res)) {
      await showError("Não foi possível remover item...");
      return;
    }
    row.remove();
  } catch {
    await showError("Não foi possível remover item...");
  }
}

/* =========================================================
   DOMAIN: CATEGORY / DATES
========================================================= */
function computeExpectedDateByCategory(category, purchaseDate) {
  const categoria = (category || "").toLowerCase();
  const compra = new Date(purchaseDate);
  if (Number.isNaN(compra.getTime())) return null;

  const previsao = new Date(compra);

  if (categoria === "porta de aluminio")
    previsao.setDate(compra.getDate() + 15);
  else if (categoria === "serralheria") previsao.setDate(compra.getDate() + 30);
  else return null;

  return previsao.toISOString().split("T")[0];
}

function handlePurchaseDateBlur() {
  const categoria = Fields.get(SELECTORS.inputs.categoria);
  const compra = Fields.get(SELECTORS.inputs.compra);

  const expected = computeExpectedDateByCategory(categoria, compra);
  if (expected) Fields.set(SELECTORS.inputs.previsao, expected);
}

/* =========================================================
   EVENT HANDLERS
========================================================= */
function handleContractsTableClick(event) {
  if (event.target.tagName !== "TD") return;

  const oc = Table.getIndexColumnValue(event.target, 0);
  const cliente = Table.getIndexColumnValue(event.target, 1);
  const ambiente = Table.getIndexColumnValue(event.target, 2);

  Fields.set(SELECTORS.inputs.numOc, oc);
  Fields.set(SELECTORS.inputs.cliente, cliente);
  Fields.set(SELECTORS.inputs.ambiente, ambiente);

  loadAccessoriesTable(oc);
  Modal.show(SELECTORS.modal.contratos);
}

function handleAccessoriesTableDblClick(event) {
  if (event.target.tagName !== "TD") return;
  const row = event.target.closest("tr");
  if (row) fillAccessoriesFormFromRow(row);
}

function handleAccessoriesTableClick(event) {
  const btn = event.target.closest("button");
  if (!btn?.classList?.contains("btn-delete")) return;
  deleteAccessoryFlowFromButton(btn);
}

/* =========================================================
   INIT
========================================================= */
function loadGroupedData() {
  getGroupedData(
    "getGroupedAcessorios",
    SELECTORS.inputs.categoria,
    "p_categoria"
  );
}

function configureUiDefaults() {
  loadPage("compras", "pendencias.html");
  Fields.focus(SELECTORS.inputs.contrato);
  Dom.enableEnterAsTab();
  Table.onmouseover("table");
}

function bindEvents() {
  Dom.addEventBySelector(
    SELECTORS.inputs.contrato,
    "blur",
    loadContractPendencies
  );
  Dom.addEventBySelector(
    SELECTORS.buttons.adicionar,
    "click",
    insertAccessoryFlow
  );

  Dom.addEventBySelector(
    SELECTORS.tables.contratos,
    "click",
    handleContractsTableClick
  );
  Dom.addEventBySelector(
    SELECTORS.tables.acessorios,
    "dblclick",
    handleAccessoriesTableDblClick
  );
  Dom.addEventBySelector(
    SELECTORS.tables.acessorios,
    "click",
    handleAccessoriesTableClick
  );

  Dom.addEventBySelector(
    SELECTORS.inputs.compra,
    "blur",
    handlePurchaseDateBlur
  );
}

function initPendenciasPage() {
  configureUiDefaults();
  loadGroupedData();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", initPendenciasPage);
