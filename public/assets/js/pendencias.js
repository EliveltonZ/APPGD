import { loadPage, getGroupedData } from "./utils.js";
import { Modal } from "./utils/modal.js";
import { Dom, Table, q, qa, ce } from "./UI/interface.js";
import { DateTime } from "./utils/time.js";
import { API } from "./service/api.js";

/*===========================
  ELEMENT SELECTORS
===========================*/

const EL = {
  NUM_OC: "#txt_numoc",
  CLIENTE: "#txt_cliente",
  CATEGORIA: "#txt_categoria",
  DESCRICAO: "#txt_descricao",
  AMBIENTE: "#txt_ambiente",
  MEDIDA: "#txt_medida",
  QTD: "#txt_qtd",
  FORNECEDOR: "#txt_fornecedor",
  COMPRA: "#txt_compra",
  PREVISAO: "#txt_previsao",
  RECEBIDO: "#txt_recebido",
  ENTREGA: "#txt_entrega",
  CONTRATO: "#txt_contrato",
  BTN_ADICIONAR: "#bt_adicionar",
  TABLE_CONTRATOS: "#table",
  TABLE_ACESSORIOS: "#table-1",
};

/*===========================
  API LAYER
===========================*/

const DB = {
  getContractPendencies: async function (contractNumber) {
    const url = `/getContratoPendencias?p_contrato=${contractNumber}`;
    return await API.fetchQuery(url);
  },

  getAccessoriesByOrder: async function (orderNumber) {
    const url = `/fillTableAPendencia?p_ordemdecompra=${orderNumber}`;
    return await API.fetchQuery(url);
  },

  deleteAccessoryById: async function (data) {
    return await API.fetchBody("/delAcessorios", "DELETE", data);
  },

  insertAccessory: async function (data) {
    return await API.fetchBody("/insertAcessorios", "POST", data);
  },
};

/*===========================
  VALIDATION HELPERS
===========================*/

function isValidContractValue(value) {
  return !!value && !isNaN(Number(value));
}

async function showInvalidContractModal() {
  await Modal.showInfo("error", "ERRO", "Contrato inválido");
  Dom.setFocus(EL.CONTRATO);
  Dom.setValue(EL.CONTRATO, "");
}

function isValidResponse(res) {
  return res && res.status === 200;
}

/*===========================
  TABLE HELPERS (CONTRATOS)
===========================*/

function getContractsTableBody() {
  return q(`${EL.TABLE_CONTRATOS} tbody`);
}

function clearContractsTable() {
  const tbody = getContractsTableBody();
  if (tbody) tbody.innerHTML = "";
}

function createContractRow(item) {
  const tr = ce("tr");
  tr.classList.add("open-modal-row");
  tr.append(Dom.createElement("td", item.p_ordemdecompra));
  tr.append(Dom.createElement("td", item.p_cliente));
  tr.append(Dom.createElement("td", item.p_ambiente));
  return tr;
}

function renderContractsTable(data) {
  const tbody = getContractsTableBody();
  if (!tbody) return;

  clearContractsTable();

  data.forEach((item) => {
    const tr = createContractRow(item);
    tbody.appendChild(tr);
  });
}

/*===========================
  TABLE HELPERS (ACESSÓRIOS)
===========================*/

function getAccessoriesTableBody() {
  return q(`${EL.TABLE_ACESSORIOS} tbody`);
}

function clearAccessoriesTable() {
  const tbody = getAccessoriesTableBody();
  if (tbody) tbody.innerHTML = "";
}

function createTableCell(content, style = "") {
  return Dom.createElement("td", content, style);
}

function insertButtonCellTable() {
  return `
    <td style="text-align: center;">
      <button class="btn btn-danger btn-delete" type="button" style="padding: 0px;margin-left: 10px;">
        <svg class="d-flex d-xxl-flex justify-content-center justify-content-xxl-center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" fill="none" style="color:rgb(255, 255, 255);text-align: center;height: 100%;width: 100%;">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" fill="currentColor"></path>
        </svg>
      </button>
    </td>
  `;
}

function createAccessoryRow(item) {
  const tr = document.createElement("tr");

  tr.append(createTableCell(item.p_id));
  tr.append(createTableCell(item.p_categoria));
  tr.append(createTableCell(item.p_descricao));
  tr.append(createTableCell(item.p_medida, "text-align: center;"));
  tr.append(createTableCell(item.p_qtd, "text-align: center;"));
  tr.append(createTableCell(item.p_fornecedor, "text-align: center;"));
  tr.append(
    createTableCell(DateTime.forBr(item.p_datacompra), "text-align: center;")
  );
  tr.append(
    createTableCell(DateTime.forBr(item.p_previsao), "text-align: center;")
  );
  tr.append(
    createTableCell(DateTime.forBr(item.p_recebido), "text-align: center;")
  );

  tr.innerHTML += insertButtonCellTable();
  return tr;
}

function renderAccessoriesTable(data) {
  const tbody = getAccessoriesTableBody();
  if (!tbody) return;

  clearAccessoriesTable();

  data.forEach((item) => {
    const tr = createAccessoryRow(item);
    tbody.appendChild(tr);
  });

  clearAccessoriesFormFields();
}

/*===========================
  FORM HELPERS
===========================*/

function clearAccessoriesFormFields() {
  const elements = [
    EL.CATEGORIA,
    EL.DESCRICAO,
    EL.MEDIDA,
    EL.QTD,
    EL.FORNECEDOR,
    EL.COMPRA,
    EL.PREVISAO,
    EL.RECEBIDO,
  ];
  elements.forEach((selector) => Dom.setValue(selector, ""));
}

function fillAccessoriesFormFromRow(row) {
  const cells = row.querySelectorAll("td");
  if (cells.length < 9) return;

  Dom.setValue(EL.CATEGORIA, cells[1].textContent);
  Dom.setValue(EL.DESCRICAO, cells[2].textContent);
  Dom.setValue(EL.MEDIDA, cells[3].textContent);
  Dom.setValue(EL.QTD, cells[4].textContent);
  Dom.setValue(EL.FORNECEDOR, cells[5].textContent);
  Dom.setValue(EL.COMPRA, DateTime.forISO(cells[6].textContent));
  Dom.setValue(EL.PREVISAO, DateTime.forISO(cells[7].textContent));
  Dom.setValue(EL.RECEBIDO, DateTime.forISO(cells[8].textContent));
}

/*===========================
  ACCESSORY DELETE HELPERS
===========================*/

function getRowFromButton(button) {
  return button.closest("tr");
}

function getFirstCell(row) {
  return row.querySelector("td");
}

function isCellNotEmpty(cell) {
  return !!cell && !!cell.textContent.trim();
}

async function showDeleteConfirmation() {
  const result = await Modal.showConfirmation(
    "REMOVER ITEM",
    "Deseja remover o item selecionado ?"
  );
  return result.isConfirmed;
}

function extractItemId(cell) {
  return cell.textContent.trim();
}

async function removeAccessory(itemId, row) {
  const data = { p_id: itemId };
  await DB.deleteAccessoryById(data);
  row.remove();
}

/*===========================
  DOMAIN: CONTRATO
===========================*/

async function fetchAndRenderContractPendencies() {
  const contractValue = Dom.getValue(EL.CONTRATO);

  if (!isValidContractValue(contractValue)) {
    await showInvalidContractModal();
    return;
  }

  const res = await DB.getContractPendencies(contractValue);

  if (!isValidResponse(res) || !Array.isArray(res.data) || !res.data.length) {
    await Modal.showInfo("error", "ERRO", "Contrato não localizado");
    return;
  }

  const first = res.data[0];
  if (first && first.p_dataentrega) {
    Dom.setValue(EL.ENTREGA, DateTime.forBr(first.p_dataentrega));
  }

  renderContractsTable(res.data);
}

/*===========================
  DOMAIN: ACESSÓRIOS
===========================*/

async function loadAccessoriesTable(orderNumberParam) {
  const orderNumber = orderNumberParam || Dom.getValue(EL.NUM_OC);
  if (!orderNumber) return;

  const res = await DB.getAccessoriesByOrder(orderNumber);

  if (!isValidResponse(res)) {
    await Modal.showInfo(
      "error",
      "ERRO",
      "Não foi possível buscar dados na base"
    );
    return;
  }

  renderAccessoriesTable(res.data || []);
}

function buildAccessoryPayload() {
  return {
    p_ordemdecompra: Dom.getValue(EL.NUM_OC),
    p_categoria: Dom.getValue(EL.CATEGORIA),
    p_descricao: Dom.getValue(EL.DESCRICAO),
    p_medida: Dom.getValue(EL.MEDIDA),
    p_quantidade: Dom.getValue(EL.QTD),
    p_fornecedor: Dom.getValue(EL.FORNECEDOR),
    p_compra: Dom.getValue(EL.COMPRA),
    p_previsao: Dom.getValue(EL.PREVISAO),
    p_recebido: Dom.getValue(EL.RECEBIDO),
  };
}

async function insertAccessory() {
  const result = await Modal.showConfirmation(
    null,
    "Deseja inserir novo acessório ?"
  );

  if (!result.isConfirmed) return;

  try {
    const payload = buildAccessoryPayload();
    await DB.insertAccessory(payload);
    await loadAccessoriesTable(Dom.getValue(EL.NUM_OC));
  } catch {
    Modal.showInfo("error", "ERRO", "Não foi possível inserir acessório");
  }
}

/*===========================
  DOMAIN: CATEGORY / DATES
===========================*/

function computeExpectedDateByCategory(category, purchaseDate) {
  const categoria = (category || "").toLowerCase();
  const compra = new Date(purchaseDate);

  if (isNaN(compra.getTime())) return null;

  const previsao = new Date(compra);

  if (categoria === "porta de aluminio") {
    previsao.setDate(compra.getDate() + 15);
  } else if (categoria === "serralheria") {
    previsao.setDate(compra.getDate() + 30);
  } else {
    return null;
  }

  return previsao.toISOString().split("T")[0];
}

function updateExpectedDateByCategory() {
  const categoria = Dom.getValue(EL.CATEGORIA);
  const compra = Dom.getValue(EL.COMPRA);

  const expected = computeExpectedDateByCategory(categoria, compra);
  if (expected) {
    Dom.setValue(EL.PREVISAO, expected);
  }
}

/*===========================
  EVENT HANDLERS
===========================*/

function handleContractsTableClick(event) {
  if (event.target.tagName !== "TD") return;

  const firstColumnValue = Table.getIndexColumnValue(event.target, 0);
  const secondColumnValue = Table.getIndexColumnValue(event.target, 1);
  const thirdColumnValue = Table.getIndexColumnValue(event.target, 2);

  Dom.setValue(EL.NUM_OC, firstColumnValue);
  Dom.setValue(EL.CLIENTE, secondColumnValue);
  Dom.setValue(EL.AMBIENTE, thirdColumnValue);

  loadAccessoriesTable(firstColumnValue);
  Modal.show("modal");
}

function handleAccessoriesTableDoubleClick(event) {
  if (event.target.tagName !== "TD") return;

  const row = event.target.closest("tr");
  if (!row) return;

  fillAccessoriesFormFromRow(row);
}

async function handleDeleteButtonClick(event) {
  const button = event.target.closest("button");

  if (!button || !button.classList.contains("btn-delete")) return;

  try {
    const row = getRowFromButton(button);
    const firstCell = getFirstCell(row);

    if (!isCellNotEmpty(firstCell)) return;

    const confirmed = await showDeleteConfirmation();
    if (!confirmed) return;

    const itemId = extractItemId(firstCell);
    await removeAccessory(itemId, row);
  } catch {
    Modal.showInfo("error", "ERRO", "Não foi possível remover item...");
  }
}

/*===========================
  INIT
===========================*/

function initPendenciasPage() {
  Dom.setFocus(EL.CONTRATO);
  loadPage("compras", "pendencias.html");
  Dom.enableEnterAsTab();
  Table.onmouseover("table");
  getGroupedData("getGroupedAcessorios", EL.CATEGORIA, "p_categoria");

  Dom.addEventBySelector(EL.CONTRATO, "blur", fetchAndRenderContractPendencies);
  Dom.addEventBySelector(EL.BTN_ADICIONAR, "click", insertAccessory);
  Dom.addEventBySelector(
    EL.TABLE_CONTRATOS,
    "click",
    handleContractsTableClick
  );
  Dom.addEventBySelector(
    EL.TABLE_ACESSORIOS,
    "dblclick",
    handleAccessoriesTableDoubleClick
  );
  Dom.addEventBySelector(EL.TABLE_ACESSORIOS, "click", handleDeleteButtonClick);
  Dom.addEventBySelector(EL.COMPRA, "blur", updateExpectedDateByCategory);
}

document.addEventListener("DOMContentLoaded", () => {
  initPendenciasPage();
});
