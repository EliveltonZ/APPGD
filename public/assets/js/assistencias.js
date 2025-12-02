import {
  onmouseover,
  convertDataBr,
  colorStatus,
  onclickHighlightRow,
} from "./utils.js";

import { Dom, Modal, q } from "./UI/interface.js";
import { Date } from "./utils/time.js";
import { enableTableFilterSort } from "./filtertable.js";
import { API } from "./service/api.js";

const SELECTORS = {
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
};

function isUrgent(value) {
  if (value == "SIM") return "color: red" || "color: none";
}

async function handleRowClickedTable(event) {
  const row = event.target.closest("tr");
  const firstColumn = row.cells[1].textContent.trim();
  const result = await loadData(firstColumn);
  populateElements(result[0]);
  Modal.create("modal-1");
}

async function loadData(value) {
  const res = await API.fetchQuery(`/getAssistencia?p_solicitacao=${value}`);
  return res.data;
}

async function getContrato() {
  const contrato_value = Dom.getValue(SELECTORS.CONTRATO);
  if (!contrato_value) return;
  const res = await API.fetchQuery(`/getContrato?p_contrato=${contrato_value}`);
  return res.data;
}

function populateElements(data) {
  Dom.setValue(SELECTORS.SOLICITACAO, data.p_idsolicitacao);
  Dom.setValue(SELECTORS.CONTRATO, data.p_contrato);
  Dom.setValue(SELECTORS.SOLICITANTE, data.p_solicitante);
  Dom.setValue(SELECTORS.DATA_SOLICITACAO, Date.forBr(data.p_datasolicitacao));
  Dom.setValue(SELECTORS.CLIENTE, data.p_cliente);
  Dom.setValue(SELECTORS.PEDIDO, data.p_pedido);
  Dom.setValue(SELECTORS.CORTE, data.p_corte);
  Dom.setValue(SELECTORS.AMBIENTE, data.p_ambiente);
  Dom.setValue(SELECTORS.SITUACAO, data.p_situacao);
  Dom.setValue(SELECTORS.URGENTE, data.p_urgente);
  Dom.setValue(SELECTORS.OBS_FABRICA, data.p_observacao);
  Dom.setValue(SELECTORS.OBS_LOGISTICA, data.p_observacao2);
  Dom.setValue(SELECTORS.INICIADO, data.p_iniciado);
  Dom.setValue(SELECTORS.PRONTO, data.p_pronto);
  Dom.setValue(SELECTORS.CONFERENTE, data.p_conferente);
  Dom.setValue(SELECTORS.LIBERADOR, data.p_liberacao);
  Dom.setValue(SELECTORS.MOTORISTA, data.p_responsavel);
  Dom.setValue(SELECTORS.ENTREGUE, data.p_dataentrega);
  Dom.setValue(SELECTORS.RESPONSAVEL, data.p_montador);
  Dom.setChecked(SELECTORS.ESCRITORIO, data.p_escritorio);
  Dom.setChecked(SELECTORS.PRODUCAO, data.p_producao);
  Dom.setChecked(SELECTORS.SEM_MATERIAL, data.p_sem_material);
}

async function confirmSave() {
  const question = await Modal.ShowQuestion(
    "Salvar",
    "Deseja salvar dados",
    "confirmar",
    "cancelar"
  );
  if (question.isConfirmed) {
    setData();
  }
}

function getElementsVAlues() {
  const data = {
    p_solicitacao: Dom.getValue(SELECTORS.SOLICITACAO),
    p_pedido: Dom.getValue(SELECTORS.PEDIDO),
    p_corte: Dom.getValue(SELECTORS.CORTE),
    p_observacao: Dom.getValue(SELECTORS.OBS_FABRICA),
    p_iniciado: Dom.getValue(SELECTORS.INICIADO),
    p_pronto: Dom.getValue(SELECTORS.PRONTO),
    p_conferente: Dom.getValue(SELECTORS.CONFERENTE),
    p_responsavel: Dom.getValue(SELECTORS.RESPONSAVEL),
    p_liberacao: Dom.getValue(SELECTORS.LIBERADOR),
    p_dataentrega: Dom.getValue(SELECTORS.ENTREGUE),
    p_escritorio: Dom.getChecked(SELECTORS.ESCRITORIO),
    p_producao: Dom.getChecked(SELECTORS.PRODUCAO),
    p_sem_material: Dom.getChecked(SELECTORS.SEM_MATERIAL),
  };
  return data;
}

async function setData() {
  const data = getElementsVAlues();
  const response = await API.fetchBody("/setAssistencia", "PUT", data);
  if (response.status !== 200) {
    Modal.showInfo("error", "ERRO", "não foi possivel salvar dados");
    return;
  }
  Modal.showInfo("success", "SUCESSO", "alterações salvas com sucesso !!!");
}

async function populateTable() {
  const response = await API.fetchQuery("/getAssistencias");
  const td = "td";
  const center = "text-align: center ";
  const tbody = q("tbody");
  tbody.innerHTML = "";
  tbody.style = "font-size: 10px;";
  tbody.classList.add("text-nowrap");
  let num = 1;
  response.data.forEach((item) => {
    const tr = document.createElement("tr");
    const color = colorStatus(item.p_status);
    const urgent = isUrgent(item.p_urgente);

    tr.append(Dom.createElement(td, num));
    tr.append(Dom.createElement(td, item.p_solicitacao));
    tr.append(Dom.createElement(td, item.p_corte, center));
    tr.append(Dom.createElement(td, item.p_contrato, center));
    tr.append(Dom.createElement(td, item.p_cliente));
    tr.append(Dom.createElement(td, item.p_ambiente));
    tr.append(
      Dom.createElement(td, Date.forBr(item.p_datasolicitacao), center)
    );
    tr.append(Dom.createElement(td, item.p_prazo, center));
    tr.append(Dom.createElement(td, item.p_status, `${center}; ${color}`));
    tr.append(Dom.createElement(td, Date.forBr(item.p_iniciado), center));
    tr.append(Dom.createElement(td, Date.forBr(item.p_previsao), center));
    tr.append(Dom.createElement(td, Date.forBr(item.p_pronto), center));
    tr.append(Dom.createElement(td, Date.forBr(item.p_dataentrega), center));
    tr.append(Dom.createElement(td, item.p_urgente, `${center}; ${urgent}`));
    num += 1;
    tbody.appendChild(tr);
  });
}

function setLocalStorageItem(value) {
  return localStorage.setItem("assistencia", value);
}

function printPage() {
  setLocalStorageItem(Dom.getValue(SELECTORS.CONTRATO));
  const iframe = q("#iframeImpressao");
  iframe.contentWindow.location.reload();
  setTimeout(function () {
    iframe.contentWindow.print();
  }, 1000);
}

function init() {
  populateTable();
  onmouseover("table");
  enableTableFilterSort("table");
  onclickHighlightRow("table");
  Dom.addEventBySelector("#table tbody", "dblclick", (e) =>
    handleRowClickedTable(e)
  );
  Dom.addEventBySelector("#bt_salvar", "click", confirmSave);
  Dom.addEventBySelector("#bt_imprimir", "click", printPage);
}

document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
