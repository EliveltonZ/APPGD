import { ajustarTamanhoModal, getConfig, setConfig } from "./utils.js";
import { Dom, Table, Style, q, ce, qa } from "./UI/interface.js";
import { API } from "./service/api.js";
import { DateTime } from "./utils/time.js";
import { enableTableFilterSort } from "./filtertable.js";
import { Modal } from "./utils/modal.js";

/*===========================
  ELEMENT SELECTORS
===========================*/

const EL = {
  DATA_FILTER: "#txt_datafilter",
  TABLE_MAIN: "#table",
  TABLE_ACCESSORIES: "#table-1",

  NUM_OC: "#txt_numoc",
  CLIENTE: "#txt_cliente",
  CONTRATO: "#txt_contrato",
  CODCC: "#txt_codcc",
  AMBIENTE: "#txt_ambiente",
  NUM_PROJ: "#txt_numproj",
  LOTE: "#txt_lote",
  OBS: "#txt_observacoes",
  CHEGOU_FABRICA: "#txt_chegoufabrica",
  DATA_ENTREGA: "#txt_dataentrega",
};

/*===========================
  API LAYER
===========================*/

const DB = {
  getStatusTable: async function (dateCondition) {
    const url = `/fillTableStts?data_condition=${dateCondition}`;
    return await API.fetchQuery(url);
  },

  getAccessoriesByOrder: async function (orderNumber) {
    const url = `/fillTableAcessorios?p_ordemdecompra=${orderNumber}`;
    return await API.fetchQuery(url);
  },

  getStatusByOrder: async function (orderNumber) {
    const url = `/getStatus?p_ordemdecompra=${orderNumber}`;
    return await API.fetchQuery(url);
  },
};

/*===========================
  STATUS TABLE (PRINCIPAL)
===========================*/

function getFilterDate() {
  return Dom.getValue(EL.DATA_FILTER);
}

function getMainTableBody() {
  const table = q(EL.TABLE_MAIN);
  return table ? table.querySelector("tbody") : null;
}

function clearMainTable() {
  const tbody = getMainTableBody();
  if (tbody) tbody.innerHTML = "";
}

function buildTableCell(value, style) {
  return Dom.createElement("td", value, style);
}

function createStatusRow(item, index) {
  const tr = ce("tr");
  const textCenter = "text-align: center;";
  tr.classList.add("open-modal-row", "fw-bold");

  const statusColor = Style.colorStatus(item.status);
  const accessoriesColor = Style.setColorBool(item.total);

  tr.append(buildTableCell(index, textCenter));
  tr.append(buildTableCell(item.a, textCenter + accessoriesColor));
  tr.append(buildTableCell(item.ordemdecompra, textCenter));
  tr.append(buildTableCell(item.pedido, textCenter));
  tr.append(buildTableCell(item.etapa, textCenter));
  tr.append(buildTableCell(item.codcc, textCenter));
  tr.append(buildTableCell(item.cliente));
  tr.append(buildTableCell(item.contrato, textCenter));
  tr.append(buildTableCell(item.numproj, textCenter));
  tr.append(buildTableCell(item.ambiente));
  tr.append(buildTableCell(item.tipo, textCenter));
  tr.append(buildTableCell(DateTime.forBr(item.chegoufabrica), textCenter));
  tr.append(buildTableCell(DateTime.forBr(item.dataentrega), textCenter));
  tr.append(buildTableCell(item.prazo, textCenter));
  tr.append(buildTableCell(item.status, textCenter + statusColor));
  tr.append(buildTableCell(DateTime.forBr(item.iniciado), textCenter));
  tr.append(buildTableCell(DateTime.forBr(item.previsao), textCenter));
  tr.append(buildTableCell(DateTime.forBr(item.pronto), textCenter));
  tr.append(buildTableCell(DateTime.forBr(item.entrega), textCenter));
  return tr;
}

async function fetchStatusTableData(dateCondition) {
  const response = await DB.getStatusTable(dateCondition);
  if (response.status !== 200) {
    const errText = response.data;
    throw new Error("Não foi possível carregar os dados: " + errText);
  }
  return response.data;
}

async function fillStatusTable() {
  const dateCondition = getFilterDate();
  if (!dateCondition) return;

  try {
    const data = await fetchStatusTableData(dateCondition);
    const tbody = getMainTableBody();
    if (!tbody) return;

    clearMainTable();

    let index = 1;
    data.forEach((item) => {
      const tr = createStatusRow(item, index);
      tbody.appendChild(tr);
      index++;
    });
  } catch (error) {
    Modal.showInfo("error", "ERRO", error.message);
  }
}

/*===========================
  ACCESSORIES TABLE
===========================*/

function getAccessoriesTableBody() {
  const table = qa("table")[1];
  return table ? table.querySelector("tbody") : null;
}

function clearAccessoriesTable() {
  const tbody = getAccessoriesTableBody();
  if (tbody) tbody.innerHTML = "";
}

function createAccessoryRow(item) {
  const tr = ce("tr");
  tr.append(buildTableCell(item.id));
  tr.append(buildTableCell(item.descricao));
  tr.append(buildTableCell(item.medida));
  tr.append(buildTableCell(item.qtd));
  tr.append(buildTableCell(item.datacompra));
  tr.append(buildTableCell(item.previsao));
  tr.append(buildTableCell(item.recebido));
  return tr;
}

async function fetchAccessoriesData(orderNumber) {
  const response = await DB.getAccessoriesByOrder(orderNumber);

  if (response.status !== 200) {
    throw new Error("Não foi possível carregar dados de acessórios");
  }

  return await response.data;
}

async function fillAccessoriesTable(ordemDeCompra) {
  try {
    const data = await fetchAccessoriesData(ordemDeCompra);
    const tbody = getAccessoriesTableBody();
    if (!tbody) return;

    clearAccessoriesTable();

    data.forEach((item) => {
      const tr = createAccessoryRow(item);
      tbody.appendChild(tr);
    });
  } catch (error) {
    Modal.showInfo("error", "ERRO", error.message);
  }
}

/*===========================
  STATUS DETAIL (SIDEBAR / MODAL)
===========================*/

function applyStatusColor(elementId, status) {
  const el = q(elementId);
  if (!el) return;

  const colorMap = {
    FINALIZADO: "green",
    INICIADO: "yellow",
  };

  const color = colorMap[status] || "gray";
  el.style.color = color;
}

function setTextInner(elementId, value) {
  Dom.setInnerHtml(elementId, value);
  applyStatusColor(elementId, value);
}

function setFormattedText(id, value) {
  const formatted = DateTime.forBr(value);
  Dom.setValue(`#${id}`, formatted);
}

function applyBasicFields(item) {
  Dom.setValue(EL.NUM_OC, item.ordemdecompra);
  Dom.setValue(EL.CLIENTE, item.cliente);
  Dom.setValue(EL.CONTRATO, item.contrato);
  Dom.setValue(EL.CODCC, item.codcc);
  Dom.setValue(EL.AMBIENTE, item.ambiente);
  Dom.setValue(EL.NUM_PROJ, item.numproj);
  Dom.setValue(EL.LOTE, item.lote);
  Dom.setValue(EL.OBS, item.observacoes);
}

function applyDateFields(item) {
  setFormattedText("txt_chegoufabrica", item.chegoufabrica);
  setFormattedText("txt_dataentrega", item.dataentrega);
}

function applyStatusFields(item) {
  const statusFields = {
    lb_corte: item.scorte,
    lb_customizacao: item.scustom,
    lb_coladeira: item.scoladeira,
    lb_usinagem: item.susinagem,
    lb_montagem: item.smontagem,
    lb_paineis: item.spaineis,
    lb_acabamento: item.sacabamento,
    lb_embalagem: item.sembalagem,
    lb_previsao: DateTime.forBr(item.previsao),
    lb_pronto: DateTime.forBr(item.pronto),
    lb_entrega: DateTime.forBr(item.entrega),
    lb_tamanho: item.tamanho,
    lb_total_volumes: item.totalvolumes,
  };

  for (const [id, value] of Object.entries(statusFields)) {
    setTextInner("#" + id, value);
  }
}

async function fetchStatusDetail(orderNumber) {
  const response = await DB.getStatusByOrder(orderNumber);

  if (response.status !== 200) {
    throw new Error(`HTTP status ${response.data}`);
  }

  return await response.data;
}

async function loadStatusDetail(orderNumber) {
  try {
    const data = await fetchStatusDetail(orderNumber);

    data.forEach((item) => {
      applyBasicFields(item);
      applyDateFields(item);
      applyStatusFields(item);
    });
  } catch (error) {
    Modal.showInfo(
      "error",
      `Não foi possível carregar os dados: ${error.message}`
    );
  }
}

/*===========================
  FILTER CONFIG (get/set)
===========================*/

async function loadFilterConfigAndTable() {
  try {
    const data = await getConfig(2);
    if (data && data[0] && data[0].p_data) {
      Dom.setValue(EL.DATA_FILTER, data[0].p_data);
    }
    await fillStatusTable();
  } catch {
    // se der erro no getConfig, ainda assim tentamos preencher tabela sem filtro salvo
    await fillStatusTable();
  }
}

async function saveFilterConfig() {
  const payload = {
    p_id: 2,
    p_date: Dom.getValue(EL.DATA_FILTER),
  };
  await setConfig(payload);
}

/*===========================
  EVENT HANDLERS
===========================*/

function getOrderNumberFromRowCell(td) {
  const row = td.parentNode;
  return row.cells[2].innerText;
}

async function handleMainTableDoubleClick(event) {
  const td = event.target;
  const tr = td.closest(".open-modal-row");

  if (!tr || td.tagName !== "TD") return;

  const ordemDeCompra = getOrderNumberFromRowCell(td);

  await loadStatusDetail(ordemDeCompra);
  await fillAccessoriesTable(ordemDeCompra);
  Modal.show("modal");
}

async function handleFilterBlur() {
  await fillStatusTable();
  await saveFilterConfig();
}

/*===========================
  INIT
===========================*/

function initStatusPage() {
  loadFilterConfigAndTable();
  ajustarTamanhoModal();
  Table.onmouseover("table");
  Table.onclickHighlightRow("table");
  Dom.addEventBySelector(EL.TABLE_MAIN, "dblclick", handleMainTableDoubleClick);
  Dom.addEventBySelector(EL.DATA_FILTER, "blur", handleFilterBlur);
  enableTableFilterSort("table");
  window.addEventListener("resize", ajustarTamanhoModal);
}

document.addEventListener("DOMContentLoaded", () => {
  initStatusPage();
});
