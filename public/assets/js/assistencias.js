import {
  Dom,
  onmouseover,
  convertDataBr,
  checkValue,
  colorStatus,
  onclickHighlightRow,
  createModal,
  messageInformation,
  messageQuestion,
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";

function isUrgent(value) {
  if (value == "SIM") {
    return "color: red";
  }
  return "color: none";
}

async function handleRowClickedTable(event) {
  const row = event.target.closest("tr");
  const firstColumn = row.cells[1].textContent.trim();
  const result = await loadData(firstColumn);
  const data = await result.json();
  populateElements(data[0]);
  createModal("modal-1");
}

async function loadData(value) {
  const response = fetch(`/getAssistencia?p_solicitacao=${value}`);
  return await response;
}

async function getContrato() {
  const contrato_value = Dom.getValue("txt_contrato");
  if (!contrato_value) {
    return;
  }

  const response = await fetch(`/getContrato?p_contrato=${contrato_value}`);
  console.log(response.json());
}

function populateElements(data) {
  Dom.setValue("txt_solicitacao", data.p_idsolicitacao);
  Dom.setValue("txt_contrato", data.p_contrato);
  Dom.setValue("txt_solicitante", data.p_solicitante);
  Dom.setValue("txt_datasolicitacao", convertDataBr(data.p_datasolicitacao));
  Dom.setValue("txt_cliente", data.p_cliente);
  Dom.setValue("txt_pedido", data.p_pedido);
  Dom.setValue("txt_corte", data.p_corte);
  Dom.setValue("txt_ambiente", data.p_ambiente);
  Dom.setValue("txt_situacao", data.p_situacao);
  Dom.setValue("txt_urgente", data.p_urgente);
  Dom.setValue("txt_obs_fabrica", data.p_observacao);
  Dom.setValue("txt_obs_logistica", data.p_observacao2);
  Dom.setValue("txt_iniciado", data.p_iniciado);
  Dom.setValue("txt_pronto", data.p_pronto);
  Dom.setValue("txt_conferente", data.p_conferente);
  Dom.setValue("txt_liberador", data.p_liberacao);
  Dom.setValue("txt_motorista", data.p_responsavel);
  Dom.setValue("txt_entregue", data.p_dataentrega);
  Dom.setValue("txt_responsavel", data.p_montador);
  Dom.setChecked("chk_escritorio", data.p_escritorio);
  Dom.setChecked("chk_producao", data.p_producao);
  Dom.setChecked("chk_sem_material", data.p_sem_material);
}

async function confirmSave() {
  const question = await messageQuestion(
    "Salvar",
    "Deseja salvar dados",
    "confirmar",
    "cancelar"
  );
  if (question.isConfirmed) {
    setData();
  }
}

async function setData() {
  const data = {
    p_solicitacao: Dom.getValue("txt_solicitacao"),
    p_pedido: Dom.getValue("txt_pedido"),
    p_corte: Dom.getValue("txt_corte"),
    p_observacao: Dom.getValue("txt_obs_fabrica"),
    p_iniciado: Dom.getValue("txt_iniciado"),
    p_pronto: Dom.getValue("txt_pronto"),
    p_conferente: Dom.getValue("txt_conferente"),
    p_responsavel: Dom.getValue("txt_motorista"),
    p_liberacao: Dom.getValue("txt_liberador"),
    p_dataentrega: Dom.getValue("txt_entregue"),
    p_escritorio: Dom.getChecked("chk_escritorio"),
    p_producao: Dom.getChecked("chk_producao"),
    p_sem_material: Dom.getChecked("chk_sem_material"),
  };

  const response = await fetch("/setAssistencia", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    messageInformation("error", "ERRO", "não foi possivel salvar dados");
    return;
  }

  messageInformation("success", "SUCESSO", "alterações salvas com sucesso !!!");
}

async function populateTable() {
  const response = await fetch("/getAssistencias");
  const data = await response.json();
  const center = "text-align: center";
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";
  tbody.style = "font-size: 10px;";
  tbody.classList.add("text-nowrap");
  let num = 1;
  data.forEach((item) => {
    const tr = document.createElement("tr");
    const color = colorStatus(item.p_status);
    const urgent = isUrgent(item.p_urgente);
    tr.innerHTML = `
    <td>${num}</td>
    <td>${item.p_solicitacao}</td>
    <td style="${center}">${checkValue(item.p_corte)}</td>
    <td style="${center}">${checkValue(item.p_contrato)}</td>
    <td>${item.p_cliente}</td>
    <td>${item.p_ambiente}</td>
    <td style="${center}">${convertDataBr(item.p_datasolicitacao)}</td>
    <td style="${center}">${checkValue(item.p_prazo)}</td>
    <td style="${color}; ${center}">${item.p_status}</td>
    <td style="${center}">${convertDataBr(checkValue(item.p_iniciado))}</td>
    <td style="${center}">${convertDataBr(checkValue(item.p_previsao))}</td>
    <td style="${center}">${convertDataBr(checkValue(item.p_pronto))}</td>
    <td style="${center}">${convertDataBr(checkValue(item.p_dataentrega))}</td>
    <td style="${center}; ${urgent}">${item.p_urgente}</td>
    `;
    num += 1;
    tbody.appendChild(tr);
  });
}

function setLocalStorageItem(value) {
  return localStorage.setItem("assistencia", value);
}

function printPage() {
  setLocalStorageItem(Dom.getValue("txt_solicitacao"));
  const iframe = document.querySelector("#iframeImpressao");
  iframe.contentWindow.location.reload();
  setTimeout(function () {
    iframe.contentWindow.print();
  }, 1000);
}

document.addEventListener("DOMContentLoaded", (event) => {
  populateTable();
  onmouseover("table");
  enableTableFilterSort("table");
  onclickHighlightRow("table");
  Dom.addEventBySelector("#table tbody", "dblclick", (e) =>
    handleRowClickedTable(e)
  );
  Dom.addEventBySelector("#bt_salvar", "click", confirmSave);
  Dom.addEventBySelector("#bt_imprimir", "click", printPage);
});
