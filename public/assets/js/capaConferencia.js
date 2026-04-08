import { Dom, q, qa, ce } from "./UI/interface.js";
import { DateTime } from "./utils/time.js";
import { Modal } from "./utils/modal.js";

const EL = {
  CONTRATO: "#lb_contrato",
  CONTRATO1: "#lb_contrato-1",
  Q_PROJ: "#lb_qproj",
  NUM_PROJ: "#lb_numproj",
  CLIENTE: "#lb_cliente",
  CLIENTE1: "#lb_cliente-1",
  AMBIENTE: "#lb_ambiente",
  AMBIENTE1: "#lb_ambiente-1",
  VENDEDOR: "#lb_vendedor",
  DATA_ENTREGA: "#lb_dataentrega",
  LIBERADOR: "#lb_liberador",
  NUM_OC: "#lb_numoc",
  CORTE: "#lb_corte",
  LOTE: "#lb_lote",
  PEDIDO: "#lb_pedido",
};

function fillElements(ordemdecompra) {
  if (ordemdecompra) {
    const data = parseJson();
    Dom.setInnerHtml(EL.CONTRATO, data.p_contrato);
    Dom.setInnerHtml(EL.CONTRATO1, data.p_contrato);
    Dom.setInnerHtml(EL.Q_PROJ, Number(data.p_numproj.slice(-2)));
    Dom.setInnerHtml(EL.NUM_PROJ, data.p_numproj);
    Dom.setInnerHtml(EL.CLIENTE, data.p_cliente);
    Dom.setInnerHtml(EL.AMBIENTE, data.p_ambiente);
    Dom.setInnerHtml(EL.CLIENTE1, data.p_cliente);
    Dom.setInnerHtml(EL.AMBIENTE1, data.p_ambiente);
    Dom.setInnerHtml(EL.VENDEDOR, data.p_vendedor);
    Dom.setInnerHtml(EL.DATA_ENTREGA, DateTime.forBr(data.p_dataentrega));
    Dom.setInnerHtml(EL.LIBERADOR, data.p_liberador);
    Dom.setInnerHtml(EL.NUM_OC, buildOrderBy(ordemdecompra));
    Dom.setInnerHtml(EL.CORTE, data.p_codcc);
    Dom.setInnerHtml(EL.LOTE, data.p_lote);
    Dom.setInnerHtml(EL.PEDIDO, data.p_pedido);
    buildGridVols(data.p_totalvolumes);
  }
}

function parseJson() {
  const res = JSON.parse(localStorage.getItem("project"));
  return res[0];
}

function buildOrderBy(ordemdecompra) {
  const numStr = String(ordemdecompra);
  if (numStr.length < 10) return numStr;
  return `${numStr.slice(0, 8)}-${numStr.slice(-2)}`;
}

function buildGridVols(values) {
  const container = q("#checkboxes");

  for (let i = 1; i <= values; i++) {
    const item = ce("div");
    item.className = "item";
    item.style = "margin-left: 30px";
    item.innerHTML = `<input type="checkbox"> <span>${i}</span>`;
    container.appendChild(item);
  }
}

function loadData() {
  const ordemdecompra = localStorage.getItem("numoc");
  fillElements(ordemdecompra);
}

document.addEventListener("DOMContentLoaded", (event) => {
  loadData();
});
