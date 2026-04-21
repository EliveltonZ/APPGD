import { API } from "./service/api.js";
import { Dom, q, qa } from "./UI/interface.js";
import { DateTime } from "./utils/time.js";
import { getCookie } from "./utils.js";

const DB = {
  getDataOrder: async function (orderBy) {
    const url = `/getCapaAssistencia?p_solicitacao=${orderBy}`;
    const response = await API.fetchQuery(url);
    return response;
  },

  getPart: async function (orderBy) {
    const url = `/getPecasQualidade?p_id_assistencia=${orderBy}`;
    const response = API.fetchQuery(url);
    return response;
  },
};

const EL = {
  CONTRATO: ".lb_contrato",
  SOLICITACAO: ".lb_solicitacao",
  DATA_SOLICITACAO: ".lb_datasolicitacao",
  URGENTE: ".lb_urgente",
  CLIENTE: ".lb_cliente",
  AMBIENTE: ".lb_ambiente",
  MONTADOR: ".lb_montagem",
  SOLICITANTE: ".lb_solicitante",
  SUPERVISOR: ".lb_supervisor",
  RESPONSAVEL: ".lb_responsavel",
  DIV_URGENTE: ".div-urgente",
  LB_URGENTE: ".lb_urgente",
  DIV_PARTS: ".div-parts",
};

function getLocalStorageItem() {
  return localStorage.getItem("assistencia");
}

function colorUrgente(value) {
  if (value === "SIM") {
    const div = Dom.getElement(EL.DIV_URGENTE);
    div.style.background = "red";
    const label = Dom.getElement(EL.LB_URGENTE);
    label.style.color = "white";
  }
}

function setBackgroudDivUrgent() {
  try {
    const div = Dom.getElement(EL.DIV_URGENTE);
    const label = Dom.getElement(EL.LB_URGENTE);

    if (label.textContent.trim() == "sim".toUpperCase()) {
      label.style.color = "white";
      div.style.background = "red";
    }
  } catch (err) {
    console.log(err);
    return;
  }
}

async function fetchAndPopulateOrder() {
  buildRowParts();
  const data = await getOrder();
  populateElements(data.data[0]);
  setBackgroudDivUrgent();
}

async function getOrder() {
  const orderBy = getLocalStorageItem();
  if (!orderBy) return;
  const res = await DB.getDataOrder(orderBy);
  return res;
}

function extractResp() {
  return localStorage.getItem("resp");
}

function populateElements(data) {
  Dom.setInnerHtml(EL.CONTRATO, data.p_contrato);
  Dom.setInnerHtml(EL.SOLICITACAO, data.p_solicitacao1);
  Dom.setInnerHtml(EL.DATA_SOLICITACAO, DateTime.forBr(data.p_datasolicitacao));
  Dom.setInnerHtml(EL.URGENTE, data.p_urgente);
  Dom.setInnerHtml(EL.CLIENTE, data.p_cliente);
  Dom.setInnerHtml(EL.AMBIENTE, data.p_ambiente);
  Dom.setInnerHtml(EL.MONTADOR, data.p_montador);
  Dom.setInnerHtml(EL.SOLICITANTE, data.p_solicitante);
  Dom.setInnerHtml(EL.SUPERVISOR, data.p_supervisor);
  Dom.setInnerHtml(EL.RESPONSAVEL, extractResp());
}

async function buildRowParts() {
  const divPartsList = document.querySelectorAll(EL.DIV_PARTS);

  if (divPartsList.length === 0) {
    console.warn(`${EL.DIV_PARTS} não encontrado`);
    return;
  }

  const data = await DB.getPart(getLocalStorageItem());

  divPartsList.forEach((divParts) => {
    divParts.innerHTML = "";
    buildLoopParts(data, divParts);
  });
}

function buildLoopParts(data, div) {
  data.data.forEach((item) => {
    const divLine = createPartsElement(item);
    div.append(divLine);
  });
}

function isEmpty(value) {
  if (value == "null") return "-";
  return value;
}

function createPartsElement(data) {
  const container = document.createElement("div");
  container.className = "item-peca border-0 border-bottom";
  container.style.marginTop = "15px";

  container.innerHTML = `
    <div class="d-flex div-border-right div-border-left div-border-top div-border-bottom gap-2" style="width: 100%">
      
      <div class="div-border-right div-border-top div-border-left div-border-bottom">
        <label class="form-label fw-bold text-danger d-block margin-0">Qtd:</label>
        <label class="form-label text-center d-block margin-0 js-qtd">${isEmpty(data.p_qtd)}</label>
      </div>

      <div class="div-border-right div-border-top div-border-left div-border-bottom" style="width: 230px">
        <label class="form-label fw-bold text-danger d-block margin-0">Peça:</label>
        <label class="form-label d-block margin-0 js-peca">${isEmpty(data.p_peca)}</label>
      </div>

      <div class="div-border-right div-border-top div-border-left div-border-bottom" style="width: 114.6px">
        <label class="form-label fw-bold text-danger d-block margin-0">Dimensões:</label>
        <label class="form-label d-block margin-0 js-dimensoes">${isEmpty(data.p_dimensoes)}</label>
      </div>

      <div class="div-border-right div-border-top div-border-left div-border-bottom" style="width: 155px">
        <label class="form-label fw-bold text-danger d-block margin-0">Cor:</label>
        <label class="form-label d-block margin-0 js-cor">${isEmpty(data.p_cor)}</label>
      </div>

    </div>

    <div class="d-flex div-border-right div-border-left div-border-top div-border-bottom gap-2" style="width: 100%">
      
      <div class="d-flex div-border-right div-border-top div-border-left div-border-bottom gap-1" style="width: 245px">
        <label class="form-label fw-bold text-danger margin-0">Motivo:</label>
        <label class="form-label margin-0 js-motivo">${isEmpty(data.p_falha)}</label>
      </div>

      <div class="d-flex div-border-right div-border-top div-border-left div-border-bottom gap-1" style="width: 120px">
        <label class="form-label fw-bold text-danger margin-0">Tipo:</label>
        <label class="form-label margin-0 js-tipo">${isEmpty(data.p_ocorrencia)}</label>
      </div>

      <div class="d-flex div-border-right div-border-top div-border-left div-border-bottom gap-1" style="width: 190px">
        <label class="form-label fw-bold text-danger margin-0">Orientação:</label>
        <label class="form-label margin-0 js-orientacao">${isEmpty(data.p_lado)}</label>
      </div>

      <div class="d-flex div-border-right div-border-top div-border-left div-border-bottom gap-1" style="width: 105px">
        <label class="form-label fw-bold text-danger margin-0">Ordem:</label>
        <label class="form-label margin-0 js-ordem">${isEmpty(data.p_codigo)}</label>
      </div>

    </div>

    <div class="d-flex div-border-right div-border-left div-border-top div-border-bottom gap-2" style="width: 100%; margin-top: 5px;">
      <div class="d-flex div-border-right div-border-top div-border-left div-border-bottom gap-1">
      <label class="form-label fw-bold text-danger margin-0">Observações:</label>
      <label class="form-label margin-0">${isEmpty(data.p_observacoes)}</label></div>
    </div>
  `;

  return container;
}

document.addEventListener("DOMContentLoaded", (event) => {
  fetchAndPopulateOrder();
});
