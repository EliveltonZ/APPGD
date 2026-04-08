import { enableTableFilterSort } from "./filtertable.js";
import { Dom, Style, Table, q, ce, qa } from "./UI/interface.js";
import { API, Service } from "./service/api.js";
import { DateTime } from "./utils/time.js";
import { Modal } from "./utils/modal.js";
import { Email } from "./utils/email.js";
import { Numbers } from "./utils/number.js";
import { loadPage } from "./utils.js";

/* =========================================================
   Elements: Dom
========================================================= */
const EL = {
  input: {
    cliente: "#txt_cliente",
    ambiente: "#txt_ambiente",
    id: "#txt_id",
    qtd: "#txt_qtd",
    peca: "#txt_peca",
    dimensoes: "#txt_dimensoes",
    cor: "#txt_cor",
    orientacao: "#txt_orientacao",
    ocorrencia: "#txt_ocorrencia",
    falha: "#txt_falha",
    causa: "#txt_causa",
    causa_raiz: "#txt_causa_raiz",
    observacoes: "#txt_observacoes",
    supervisor: "#txt_supervisor",
  },

  element: {
    bt_salvar: "#bt_salvar",
    table: "#table",
  },
};

/* =========================================================
   fetch: API
========================================================= */
const api = {
  fetchAllParts() {
    return API.fetchQuery("/getPecasQualidade");
  },

  fetchOcorrencias() {
    return API.fetchQuery("/getOcorrencia");
  },

  fetchFalhas() {
    return API.fetchQuery("/getFalhas");
  },

  fetchCausa(payload) {
    return API.fetchQuery(`/getCausa?p_id_falha=${payload}`);
  },

  updateCausa(payload) {
    return API.fetchBody("/updateCausaRaiz", "PUT", payload);
  },
};

/* =========================================================
   extract: data
========================================================= */
async function extractAllParts() {
  return await api.fetchAllParts();
}

function extractFallIndex() {
  return Dom.getValue(EL.input.falha);
}

function payloadFormAnalysis() {
  return {
    p_id: Dom.getValue(EL.input.id),
    p_falha: Dom.getValue(EL.input.falha),
    p_causa: Dom.getValue(EL.input.causa),
    p_analise: Dom.getValue(EL.input.causa_raiz),
  };
}

/* =========================================================
   build: elements
========================================================= */
function buildCell(value, style = null) {
  if (value === "null") return Dom.createElement("td", "", style);
  return Dom.createElement("td", value, style);
}

function buildRow(item) {
  const noDisplay = "display:none";
  const textCenter = "text-align: center";
  const tr = ce("tr");
  tr.classList.add("open-modal-row");
  tr.append(buildCell(item.p_id, textCenter));
  tr.append(buildCell(item.p_id_assistencia, textCenter));
  tr.append(buildCell(item.p_qtd, textCenter));
  tr.append(buildCell(item.p_cor));
  tr.append(buildCell(item.p_peca));
  tr.append(buildCell(item.p_dimensoes));
  tr.append(buildCell(item.p_orientacao));
  tr.append(buildCell(item.p_cliente));
  tr.append(buildCell(item.p_ambiente));
  tr.append(buildCell(item.p_ocorrencia, noDisplay));
  tr.append(buildCell(item.p_falha, noDisplay));
  tr.append(buildCell(item.p_observacoes, noDisplay));
  tr.append(buildCell(item.p_supervisor, noDisplay));
  tr.append(buildCell(item.p_analise, noDisplay));
  return tr;
}

/* =========================================================
   Helpers: DOM 
========================================================= */
function loopDataParts(data, tbody) {
  data.data.forEach((element) => tbody.appendChild(buildRow(element)));
}

function fillElements(el, tr, index) {
  Dom.setValue(el, tr.cells[index].textContent);
}

/* =========================================================
   alerts: Modal
========================================================= */
async function UpdateConfirm() {
  return await Modal.showConfirmation("Atualizar", "Confirmar atualização ?");
}

async function successMessage() {
  return await Modal.showInfo("success", "Sucesso", "Alteração Concluida");
}

async function errorMessage(err) {
  return await Modal.showInfo("error", "ERRO", err);
}

/* =========================================================
   populates: 
========================================================= */
async function processTableParts() {
  const data = await extractAllParts();
  const tbody = q("#table tbody");
  loopDataParts(data, tbody);
}

function populateOcorrencyList(element, select) {
  const option = ce("option");
  option.value = element.p_cod;
  option.innerHTML = element.p_descricao;
  select.appendChild(option);
}

function populateFaillsList(element, select) {
  const option = ce("option");
  option.value = element.p_codigo;
  option.innerHTML = `${element.p_codigo} - ${element.p_descricao}`;
  select.appendChild(option);
}

function populateCauseList(element, select) {
  const option = ce("option");
  option.value = element.p_id;
  option.innerHTML = element.p_descricao;
  select.appendChild(option);
}

async function populateOcorrency() {
  const res = await api.fetchOcorrencias();
  const select = q(EL.input.ocorrencia);
  select.innerHTML = '<option value="">-</option>';
  res.data.forEach((element) => populateOcorrencyList(element, select));
}

async function populateFaills() {
  const response = await api.fetchFalhas();
  const select = q(EL.input.falha);
  select.innerHTML = "";
  response.data.forEach((element) => populateFaillsList(element, select));
}

async function populateCause() {
  const id = extractFallIndex();
  const res = await api.fetchCausa(id);
  const select = q(EL.input.causa);
  select.innerHTML = "";
  res.data.forEach((element) => populateCauseList(element, select));
}

function getCellsValueRow(tr) {
  fillElements(EL.input.id, tr, 0);
  fillElements(EL.input.qtd, tr, 2);
  fillElements(EL.input.cor, tr, 3);
  fillElements(EL.input.peca, tr, 4);
  fillElements(EL.input.dimensoes, tr, 5);
  fillElements(EL.input.orientacao, tr, 6);
  fillElements(EL.input.cliente, tr, 7);
  fillElements(EL.input.ambiente, tr, 8);
  fillElements(EL.input.ocorrencia, tr, 9);
  fillElements(EL.input.falha, tr, 10);
  fillElements(EL.input.observacoes, tr, 11);
  fillElements(EL.input.supervisor, tr, 12);
  fillElements(EL.input.causa_raiz, tr, 13);
}

/* =========================================================
   handles: 
========================================================= */
function handleDblClickTableParts(evt) {
  const tdEl = evt.target;
  const tr = tdEl.closest(".open-modal-row");
  if (!tr || tdEl.tagName !== "TD") return;
  getCellsValueRow(tr);
  populateCause();
  Modal.show("modal");
}

async function handleConfirmed() {
  const result = await UpdateConfirm();
  if (!result.isConfirmed) return;
  await executeSave();
}

async function executeSave() {
  try {
    const payload = payloadFormAnalysis();
    const ex = await api.updateCausa(payload);
    successMessage();
    console.log(ex);
    console.log(payload);
  } catch (err) {
    errorMessage(err);
  }
}

/* =========================================================
   process: init 
========================================================= */
function init() {
  loadPage("qualidade", "qualidade.html");
  populateOcorrency();
  populateFaills();
  processTableParts();
  Table.onmouseover(EL.element.table);
  Table.onclickHighlightRow(EL.element.table);
  Dom.addEventBySelector(
    EL.element.table,
    "dblclick",
    handleDblClickTableParts,
  );
  Dom.addEventBySelector(EL.input.falha, "change", populateCause);
  Dom.addEventBySelector(EL.element.bt_salvar, "click", handleConfirmed);
}

document.addEventListener("DOMContentLoaded", init);
