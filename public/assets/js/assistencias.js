import { onclickHighlightRow } from "./utils.js";

import { Dom, q, Table, Style } from "./UI/interface.js";
import { DateTime } from "./utils/time.js";
import { enableTableFilterSort } from "./filtertable.js";
import { API } from "./service/api.js";
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
  const contrato_value = Dom.getValue(EL.CONTRATO);
  if (!contrato_value) return;
  const res = await API.fetchQuery(`/getContrato?p_contrato=${contrato_value}`);
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
    const color = Style.colorStatus(item.p_status);
    const urgent = isUrgent(item.p_urgente);

    tr.append(Dom.createElement(td, num));
    tr.append(Dom.createElement(td, item.p_solicitacao));
    tr.append(Dom.createElement(td, item.p_corte, center));
    tr.append(Dom.createElement(td, item.p_contrato, center));
    tr.append(Dom.createElement(td, item.p_cliente));
    tr.append(Dom.createElement(td, item.p_ambiente));
    tr.append(
      Dom.createElement(td, DateTime.forBr(item.p_datasolicitacao), center)
    );
    tr.append(Dom.createElement(td, item.p_prazo, center));
    tr.append(Dom.createElement(td, item.p_status, `${center}; ${color}`));
    tr.append(Dom.createElement(td, DateTime.forBr(item.p_iniciado), center));
    tr.append(Dom.createElement(td, DateTime.forBr(item.p_previsao), center));
    tr.append(Dom.createElement(td, DateTime.forBr(item.p_pronto), center));
    tr.append(
      Dom.createElement(td, DateTime.forBr(item.p_dataentrega), center)
    );
    tr.append(Dom.createElement(td, item.p_urgente, `${center}; ${urgent}`));
    num += 1;
    tbody.appendChild(tr);
  });
}

function setLocalStorageItem(value) {
  return localStorage.setItem("assistencia", value);
}

function printPage() {
  setLocalStorageItem(Dom.getValue(EL.CONTRATO));
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
