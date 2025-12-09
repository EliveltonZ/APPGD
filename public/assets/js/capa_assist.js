import { API } from "./service/api.js";
import { Dom } from "./UI/interface.js";
import { Date } from "./utils/time.js";

const DB = {
  getDataOrder: async function (orderBy) {
    const url = `getCapaAssistencia?p_solicitacao=${orderBy}`;
    const response = await API.fetchQuery(url);
    return response;
  },
};

const SELECTORS = {
  CONTRATO: "#lb_contrato",
  SOLICITACAO: "#lb_solicitacao",
  SOLICITACAO1: "#lb_solicitacao1",
  DATA_SOLICITACAO: "#lb_datasolicitacao",
  URGENTE: "#lb_urgente",
  CLIENTE: "#lb_cliente",
  CLIENTE1: "#lb_cliente1",
  AMBIENTE: "#lb_ambiente",
  MONTADOR: "#lb_montagem",
  SOLICITANTE: "#lb_solicitante",
  SUPERVISOR: "#lb_supervisor",
  DIV_URGENTE: "#div-urgente",
  LB_URGENTE: "#lb_urgente",
};

function getLocalStorageItem() {
  return localStorage.getItem("assistencia");
}

function colorUrgente(value) {
  if (value === "SIM") {
    const div = Dom.getElement(SELECTORS.DIV_URGENTE);
    div.style.background = "red";
    const label = Dom.getElement(SELECTORS.LB_URGENTE);
    label.style.color = "white";
  }
}

function setBackgroudDivUrgent() {
  const div = Dom.getElement(SELECTORS.DIV_URGENTE);
  const label = Dom.getElement(SELECTORS.LB_URGENTE);

  if (label.textContent.trim() == "sim".toUpperCase()) {
    label.style.color = "white";
    div.style.background = "red";
  }
}

async function fetchAndPopulateOrder() {
  const data = await getOrder();
  populateElements(data[0]);
  setBackgroudDivUrgent();
}

async function getOrder() {
  const orderBy = getLocalStorageItem();
  if (!orderBy) return;
  const res = await DB.getDataOrder(orderBy);
}

function populateElements(data) {
  Dom.setInnerHtml(SELECTORS.CONTRATO, data.p_contrato);
  Dom.setInnerHtml(SELECTORS.SOLICITACAO, data.p_solicitacao1);
  Dom.setInnerHtml(SELECTORS.SOLICITACAO1, data.p_solicitacao1);
  Dom.setInnerHtml(
    SELECTORS.DATA_SOLICITACAO,
    Date.forBr(data.p_datasolicitacao)
  );
  Dom.setInnerHtml(SELECTORS.URGENTE, data.p_urgente);
  Dom.setInnerHtml(SELECTORS.CLIENTE, data.p_cliente);
  Dom.setInnerHtml(SELECTORS.CLIENTE1, data.p_cliente);
  Dom.setInnerHtml(SELECTORS.AMBIENTE, data.p_ambiente);
  Dom.setInnerHtml(SELECTORS.MONTADOR, data.p_montador);
  Dom.setInnerHtml(SELECTORS.SOLICITANTE, data.p_solicitante);
  Dom.setInnerHtml(SELECTORS.SUPERVISOR, data.p_supervisor);
}

document.addEventListener("DOMContentLoaded", (event) => {
  fetchAndPopulateOrder();
});
