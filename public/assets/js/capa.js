import { Dom, qa, ce } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";
import { DateTime } from "./utils/time.js";

/*================== 
HELPERS ELEMENTS ID
==================*/

const SELECTORS = {
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
    const div = Dom.getElement(SELECTORS.DIV_URGENTE);
    const label = Dom.getElement(SELECTORS.URGENTE);
    div.style.background = "red";
    label.style.color = "white";
  }
}

function populateElements(ordemdecompra) {
  if (ordemdecompra) {
    const res = JSON.parse(localStorage.getItem("project"));
    const data = res[0];
    const numoc = `${ordemdecompra.slice(0, 8)}-${ordemdecompra.slice(-2)}`;
    Dom.setInnerHtml(SELECTORS.CONTRATO, data.p_contrato);
    Dom.setInnerHtml(SELECTORS.Q_PROJ, Number(data.p_numproj.slice(-2)));
    Dom.setInnerHtml(SELECTORS.NUM_PROJ, data.p_numproj);
    Dom.setInnerHtml(SELECTORS.CLIENTE, data.p_cliente);
    Dom.setInnerHtml(SELECTORS.AMBIENTE, data.p_ambiente);
    Dom.setInnerHtml(SELECTORS.VENDEDOR, data.p_vendedor);
    Dom.setInnerHtml(
      SELECTORS.DATA_ENTREGA,
      DateTime.forBr(data.p_dataentrega)
    );
    Dom.setInnerHtml(SELECTORS.LIBERADOR, data.p_liberador);
    Dom.setInnerHtml(SELECTORS.NUM_OC, numoc);
    Dom.setInnerHtml(SELECTORS.RESPONSAVEL, getLsItem("resp"));
    Dom.setInnerHtml(SELECTORS.DATA, DateTime.forBr(getLsItem("data")));
    Dom.setInnerHtml(SELECTORS.TIPO, getLsItem("tipo"));
    Dom.setInnerHtml(SELECTORS.URGENTE, getLsItem("urgente"));
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
      `Não foi possível carregar os dados. ${err.message}`
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
