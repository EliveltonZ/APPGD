import { convertDataBr, checkValue, messageInformation, Dom } from "./utils.js";

function getLocalStorageItem() {
  return localStorage.getItem("assistencia");
}

function colorUrgente(value) {
  if (value === "SIM") {
    const div = document.getElementById("div_urgente");
    div.style.background = "red";
    const label = document.getElementById("lb_urgente");
    label.style.color = "white";
  }
}

function setBackgroudDiv() {
  const div = document.querySelector("#div-urgente");
  const label = document.querySelector("#lb_urgente");

  if (label.textContent.trim() == "sim".toUpperCase()) {
    label.style.color = "white";
    div.style.background = "red";
  }
}

async function fetchAndPopulateOrder() {
  const data = await getOrder();
  populateElements(data[0]);
  setBackgroudDiv();
}

async function getOrder() {
  const orderBy = getLocalStorageItem();
  if (!orderBy) return;
  const response = await fetch(`getCapaAssistencia?p_solicitacao=${orderBy}`);
  return await response.json();
}

function populateElements(data) {
  Dom.setInnerHtml("lb_contrato", data.p_contrato);
  Dom.setInnerHtml("lb_solicitacao", data.p_solicitacao1);
  Dom.setInnerHtml("lb_solicitacao1", data.p_solicitacao1);
  Dom.setInnerHtml("lb_datasolicitacao", convertDataBr(data.p_datasolicitacao));
  Dom.setInnerHtml("lb_urgente", data.p_urgente);
  Dom.setInnerHtml("lb_cliente", data.p_cliente);
  Dom.setInnerHtml("lb_cliente1", data.p_cliente);
  Dom.setInnerHtml("lb_ambiente", data.p_ambiente);
  Dom.setInnerHtml("lb_montagem", data.p_montador);
  Dom.setInnerHtml("lb_solicitante", data.p_solicitante);
  Dom.setInnerHtml("lb_supervisor", data.p_supervisor);
}

document.addEventListener("DOMContentLoaded", (event) => {
  fetchAndPopulateOrder();
});
