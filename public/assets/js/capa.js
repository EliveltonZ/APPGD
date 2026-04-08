import { Dom, qa, ce } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";
import { DateTime } from "./utils/time.js";

/*================== 
HELPERS ELEMENTS ID
==================*/
const EL = {
  CONTRATO: "#lb_contrato",
  Q_PROJ: "#lb_qproj",
  NUM_PROJ: "#lb_qproj",
  CLIENTE: "#lb_cliente",
  AMBIENTE: "#lb_ambiente",
  VENDEDOR: "#lb_vendedor",
  DATA_ENTREGA: "#lb_dataentrega",
  LIBERADOR: "#lb_liberador",
  NUM_OC: "#lb_numoc",
  RESPONSAVEL: "#lb_responsavel",
  DATA: "#lb_data",
  TIPO: "#lb_tipo",
  URGENTE: "#lb_urgente",
  DIV_URGENTE: "#div_urgente",
};

function getLsItem(item) {
  return localStorage.getItem(item);
}

function colorUrgente(value) {
  if (value === "SIM") {
    const div = Dom.getElement(EL.DIV_URGENTE);
    const label = Dom.getElement(EL.URGENTE);
    div.style.background = "red";
    label.style.color = "white";
  }
}

function buildOrderBy(ordemdecompra) {
  const numStr = String(ordemdecompra);
  if (numStr.length < 10) return numStr;
  return `${numStr.slice(0, 8)}-${numStr.slice(-2)}`;
}

function populateElements(ordemdecompra) {
  if (ordemdecompra) {
    const res = JSON.parse(localStorage.getItem("project"));
    const data = res[0];
    Dom.setInnerHtml(EL.CONTRATO, data.p_contrato);
    Dom.setInnerHtml(EL.Q_PROJ, Number(data.p_numproj.slice(-2)));
    Dom.setInnerHtml(EL.NUM_PROJ, data.p_numproj);
    Dom.setInnerHtml(EL.CLIENTE, data.p_cliente);
    Dom.setInnerHtml(EL.AMBIENTE, data.p_ambiente);
    Dom.setInnerHtml(EL.VENDEDOR, data.p_vendedor);
    Dom.setInnerHtml(EL.DATA_ENTREGA, DateTime.forBr(data.p_dataentrega));
    Dom.setInnerHtml(EL.LIBERADOR, data.p_liberador);
    Dom.setInnerHtml(EL.NUM_OC, buildOrderBy(ordemdecompra));
    Dom.setInnerHtml(EL.RESPONSAVEL, getLsItem("resp"));
    Dom.setInnerHtml(EL.DATA, DateTime.forBr(getLsItem("data")));
    Dom.setInnerHtml(EL.TIPO, getLsItem("tipo"));
    Dom.setInnerHtml(EL.URGENTE, getLsItem("urgente"));
    colorUrgente(getLsItem("urgente"));
  }
}

function fillTableAcessorios(ordemdecompra) {
  try {
    const td = "td";
    const data = JSON.parse(getLsItem("acessorios"));
    const tbody = qa("table tbody")[0];
    tbody.innerHTML = "";
    const font = "font-size: 9px;";
    const center = "text-align: center";

    data.forEach((item) => {
      const tr = ce("tr");
      tr.appendChild(Dom.createElement(td, item.categoria, font));
      tr.appendChild(Dom.createElement(td, item.descricao, font));
      tr.appendChild(Dom.createElement(td, item.medida, font + center));
      tr.appendChild(Dom.createElement(td, item.qtd, font + center));
      tbody.appendChild(tr);
    });
  } catch (err) {
    Modal.showInfo(
      "error",
      "Erro",
      `Não foi possível carregar os dados. ${err.message}`,
    );
  }
}

function loadData() {
  const ordemdecompra = localStorage.getItem("numoc");
  populateElements(ordemdecompra);
  fillTableAcessorios(ordemdecompra);
}

document.addEventListener("DOMContentLoaded", (event) => {
  loadData();
});
