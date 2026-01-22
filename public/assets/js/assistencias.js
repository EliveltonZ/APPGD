import { Dom, q, Table, Style } from "./UI/interface.js";
import { DateTime } from "./utils/time.js";
import { enableTableFilterSort } from "./filtertable.js";
import { API, Service } from "./service/api.js";
import { Modal } from "./utils/modal.js";

const EL = {
  SOLICITACAO: "#txt_solicitacao",
  CONTRATO: "#txt_contrato",
  SOLICITANTE: "#txt_solicitante",
  DATA_SOLICITACAO: "#txt_datasolicitacao",
  CLIENTE: "#txt_cliente",
  PEDIDO: "#txt_pedido",
  CORTE: "#txt_corte",
  AMBIENTE: "#txt_ambiente",
  SITUACAO: "#txt_situacao",
  URGENTE: "#txt_urgente",
  OBS_FABRICA: "#txt_obs_fabrica",
  OBS_LOGISTICA: "#txt_obs_logistica",
  INICIADO: "#txt_iniciado",
  PRONTO: "#txt_pronto",
  CONFERENTE: "#txt_conferente",
  LIBERADOR: "#txt_liberador",
  MOTORISTA: "#txt_motorista",
  ENTREGUE: "#txt_entregue",
  RESPONSAVEL: "#txt_responsavel",
  ESCRITORIO: "#chk_escritorio",
  PRODUCAO: "#chk_producao",
  SEM_MATERIAL: "#chk_sem_material",
  DATA_ENTREGA: "#txt_dataentrega",
  DATA_FILTER: "#txt_datafilter",
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
  getChecked(sel) {
    return Dom.getChecked(sel);
  },
  setChecked(sel, val) {
    Dom.setChecked(sel, val);
  },
};

/*================================================
HELPER API
================================================*/
const assistAPI = {
  async getAssist(value) {
    const res = await API.fetchQuery(`/getAssistencia?p_solicitacao=${value}`);
    return res.data;
  },

  async getAssists(dateFilter) {
    const res = await API.fetchQuery(`/getAssistencias?p_data=${dateFilter}`);
    return res.data;
  },

  async getContract(contrato_value) {
    const res = await API.fetchQuery(
      `/getContrato?p_contrato=${contrato_value}`,
    );
    return res.data;
  },

  async setAssist(payload) {
    const res = await API.fetchBody("/setAssistencia", "PUT", payload);
    return res;
  },

  async fetchConfig(id) {
    return await Service.getConfig(id);
  },

  async saveConfig(payload) {
    return await Service.setConfig(payload);
  },
};

/*================================================
HELPER EVENTS
================================================*/
function isUrgent(value) {
  if (value == "SIM") return "color: red" || "color: none";
}

async function handleRowClickedTable(event) {
  const row = event.target.closest("tr");
  const firstColumn = row.cells[1].textContent.trim();
  const result = await loadData(firstColumn);
  populateElements(result[0]);
  Modal.show("modal-1");
}

async function loadData(value) {
  const res = await assistAPI.getAssist(value);
  return res;
}

async function getContrato() {
  const contrato_value = Dom.getValue(EL.CONTRATO);
  if (!contrato_value) return;
  const res = await assistAPI.getContract(contrato_value);
  return res.data;
}

function populateElements(data) {
  Dom.setValue(EL.SOLICITACAO, data.p_idsolicitacao);
  Dom.setValue(EL.CONTRATO, data.p_contrato);
  Dom.setValue(EL.SOLICITANTE, data.p_solicitante);
  Dom.setValue(EL.DATA_SOLICITACAO, DateTime.forBr(data.p_datasolicitacao));
  Dom.setValue(EL.CLIENTE, data.p_cliente);
  Dom.setValue(EL.PEDIDO, data.p_pedido);
  Dom.setValue(EL.CORTE, data.p_corte);
  Dom.setValue(EL.AMBIENTE, data.p_ambiente);
  Dom.setValue(EL.SITUACAO, data.p_situacao);
  Dom.setValue(EL.URGENTE, data.p_urgente);
  Dom.setValue(EL.OBS_FABRICA, data.p_observacao);
  Dom.setValue(EL.OBS_LOGISTICA, data.p_observacao2);
  Dom.setValue(EL.INICIADO, data.p_iniciado);
  Dom.setValue(EL.PRONTO, data.p_pronto);
  Dom.setValue(EL.CONFERENTE, data.p_conferente);
  Dom.setValue(EL.LIBERADOR, data.p_liberacao);
  Dom.setValue(EL.MOTORISTA, data.p_responsavel);
  Dom.setValue(EL.ENTREGUE, data.p_dataentrega);
  Dom.setValue(EL.RESPONSAVEL, data.p_montador);
  Dom.setChecked(EL.ESCRITORIO, data.p_escritorio);
  Dom.setChecked(EL.PRODUCAO, data.p_producao);
  Dom.setChecked(EL.SEM_MATERIAL, data.p_sem_material);
}

async function confirmSave() {
  const question = await Modal.showConfirmation(
    "Salvar",
    "Deseja salvar dados",
    "confirmar",
    "cancelar",
  );
  if (question.isConfirmed) {
    setData();
  }
}

function getElementsVAlues() {
  const data = {
    p_solicitacao: Dom.getValue(EL.SOLICITACAO),
    p_pedido: Dom.getValue(EL.PEDIDO),
    p_corte: Dom.getValue(EL.CORTE),
    p_observacao: Dom.getValue(EL.OBS_FABRICA),
    p_iniciado: Dom.getValue(EL.INICIADO),
    p_pronto: Dom.getValue(EL.PRONTO),
    p_conferente: Dom.getValue(EL.CONFERENTE),
    p_responsavel: Dom.getValue(EL.RESPONSAVEL),
    p_liberacao: Dom.getValue(EL.LIBERADOR),
    p_dataentrega: Dom.getValue(EL.ENTREGUE),
    p_escritorio: Dom.getChecked(EL.ESCRITORIO),
    p_producao: Dom.getChecked(EL.PRODUCAO),
    p_sem_material: Dom.getChecked(EL.SEM_MATERIAL),
  };
  return data;
}

async function setData() {
  const payload = getElementsVAlues();
  const response = await assistAPI.setAssist(payload);
  if (response.status !== 200) {
    Modal.showInfo("error", "ERRO", "não foi possivel salvar dados");
    return;
  }
  Modal.showInfo("success", "SUCESSO", "alterações salvas com sucesso !!!");
}

function buildRow(tr, value, style) {
  tr.append(Dom.createElement("td", value, style));
}

async function getDateFilter() {
  const dataFilter = await assistAPI.fetchConfig(5);
  Fields.set(EL.DATA_FILTER, dataFilter[0].p_data);
}

async function setDataFilter(params) {
  const dataFilter = Fields.get(EL.DATA_FILTER);
  assistAPI.saveConfig({ p_id: 5, p_data: dataFilter });
}

function configTable(tbody) {
  tbody.innerHTML = "";
  tbody.style = "font-size: 10px;";
  tbody.classList.add("text-nowrap");
}

function contructTable(res, tbody) {
  const center = "text-align: center ";
  let num = 1;
  res.forEach((item) => {
    const tr = document.createElement("tr");
    const color = Style.colorStatus(item.p_status);
    const urgent = isUrgent(item.p_urgente);
    buildRow(tr, num);
    buildRow(tr, item.p_solicitacao);
    buildRow(tr, item.p_corte, center);
    buildRow(tr, item.p_contrato, center);
    buildRow(tr, item.p_cliente);
    buildRow(tr, item.p_ambiente);
    buildRow(tr, DateTime.forBr(item.p_datasolicitacao), center);
    buildRow(tr, item.p_prazo, center);
    buildRow(tr, item.p_status, `${center}; ${color}`);
    buildRow(tr, DateTime.forBr(item.p_iniciado), center);
    buildRow(tr, DateTime.forBr(item.p_previsao), center);
    buildRow(tr, DateTime.forBr(item.p_pronto), center);
    buildRow(tr, DateTime.forBr(item.p_dataentrega), center);
    buildRow(tr, item.p_urgente, `${center}; ${urgent}`);
    num += 1;
    tbody.appendChild(tr);
  });
}

async function populateTable() {
  await getDateFilter();
  const res = await assistAPI.getAssists(Fields.get(EL.DATA_FILTER));
  const tbody = q("tbody");
  configTable(tbody);
  contructTable(res, tbody);
}

function setLocalStorageItem(value) {
  return localStorage.setItem("assistencia", value);
}

function printPage() {
  setLocalStorageItem(Fields.get(EL.SOLICITACAO));
  const iframe = q("#iframeImpressao");
  iframe.contentWindow.location.reload();
  setTimeout(function () {
    iframe.contentWindow.print();
  }, 1000);
}

function init() {
  populateTable();
  Table.onmouseover("table");
  enableTableFilterSort("table");
  Table.onclickHighlightRow("table");
  Dom.addEventBySelector("#table tbody", "dblclick", (e) =>
    handleRowClickedTable(e),
  );
  Dom.addEventBySelector("#bt_salvar", "click", confirmSave);
  Dom.addEventBySelector("#bt_imprimir", "click", printPage);
}

document.addEventListener("DOMContentLoaded", async (event) => {
  await init();
});
