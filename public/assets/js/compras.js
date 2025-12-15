import { loadPage, getConfig, setConfig } from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";
import { Dom, Style, Table, q, ce, qa } from "./UI/interface.js";
import { DateTime } from "./utils/time.js";
import { API } from "./service/api.js";
import { Modal } from "./utils/modal.js";

const EL = {
  ID: "#txt_id",
  DESCRICAO: "#txt_descricao",
  MEDIDA: "#txt_medida",
  PARCELAMENTO: "#txt_parcelamento",
  CARTAO: "#txt_cartao",
  QTD: "#txt_quantidade",
  FORNECEDOR: "#txt_fornecedor",
  COMPRA: "#txt_compra",
  PREVISAO: "#txt_previsao",
  RECEBIDO: "#txt_recebido",
  FILTRO: "#txt_datafilter",
  CONTRATO: "#txt_contrato",
  CLIENTE: "#txt_cliente",
  AMBIENTE: "#txt_ambiente",
};

const DB = {
  getAcessoriosCompras: async function (dateFilter) {
    const url = `/getAcessoriosCompras?p_dataentrega=${dateFilter}`;
    const res = await API.fetchQuery(url);
    return res;
  },

  setAcessorios: async function (data) {
    const res = await API.fetchBody("/setAcessorios", "PUT", data);
    return res;
  },
};

function createRow(value, style) {
  return Dom.createElement("td", value, style);
}

async function getAcessoriosCompras() {
  const tbody = q("tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  const textLeft = "text-align:left;";
  const dataFilter = Dom.getValue(EL.FILTRO);
  const res = await DB.getAcessoriosCompras(dataFilter);

  if (res.status !== 200) {
    Modal.showInfo("error", "ERRO", "Erro ao buscar itens");
    return;
  }

  res.data.forEach((item) => {
    const tr = ce("tr");
    const statusColor = Style.colorStatus(item.status);
    tr.classList.add("open-modal-row");
    tr.append(createRow(item.contrato));
    tr.append(createRow(item.cliente, textLeft));
    tr.append(createRow(item.ambiente, textLeft));
    tr.append(createRow(item.descricao, textLeft));
    tr.append(createRow(item.medida));
    tr.append(createRow(item.parcelamento));
    tr.append(createRow(item.numcard));
    tr.append(createRow(item.qtd));
    tr.append(createRow(item.fornecedor));
    tr.append(createRow(DateTime.forBr(item.dataentrega)));
    tr.append(createRow(DateTime.forBr(item.datacompra)));
    tr.append(createRow(DateTime.forBr(item.previsao)));
    tr.append(createRow(DateTime.forBr(item.recebido)));
    tr.append(createRow(item.status, statusColor));
    tr.append(createRow(item.categoria));
    tr.append(createRow(item.id, "display: none;"));
    tbody.appendChild(tr);
  });
}

function populateElements(element) {
  const columnMap = {
    15: EL.ID,
    0: EL.CONTRATO,
    1: EL.CLIENTE,
    2: EL.AMBIENTE,
    3: EL.DESCRICAO,
    4: EL.MEDIDA,
    5: EL.PARCELAMENTO,
    6: EL.CARTAO,
    7: EL.QTD,
    8: EL.FORNECEDOR,
    10: EL.COMPRA,
    11: EL.PREVISAO,
    12: EL.RECEBIDO,
  };

  for (const index in columnMap) {
    const value = Table.getIndexColumnValue(element, index);
    if (index > 9 && index < 13) {
      Dom.setValue(columnMap[index], DateTime.forISO(value));
    } else {
      Dom.setValue(columnMap[index], value);
    }
  }
}

async function populateAndShowModal(event) {
  const td = event.target;
  if (td.tagName !== "TD") return;
  populateElements(td);
  Modal.show("modal");
}

function cNumber(value) {
  const result = Number(value);
  if (!result) return 0;
  return result;
}

function payloadAcess() {
  const data = {
    p_id: Dom.getValue(EL.ID),
    p_descricao: Dom.getValue(EL.DESCRICAO),
    p_medida: Dom.getValue(EL.MEDIDA),
    p_parcelamento: cNumber(Dom.getValue(EL.PARCELAMENTO)),
    p_numcard: cNumber(Dom.getValue(EL.CARTAO)),
    p_qtd: cNumber(Dom.getValue(EL.QTD)),
    p_fornecedor: Dom.getValue(EL.FORNECEDOR),
    p_datacompra: Dom.getValue(EL.COMPRA),
    p_previsao: Dom.getValue(EL.PREVISAO),
    p_recebido: Dom.getValue(EL.RECEBIDO),
  };
  return data;
}

async function setAcessorios() {
  const data = payloadAcess();
  const res = await DB.setAcessorios(data);
  if (res.status !== 200) {
    Modal.showInfo("error", "ERRO", `erro ao salvar alterações ${res.status}`);
  } else {
    Modal.showInfo("success", "Sucesso", "alterações salvas com Sucesso !!!");
  }
}

async function getDataFilterBuy() {
  const data = await getConfig(3);
  Dom.setValue(EL.FILTRO, data[0].p_data);
  getAcessoriosCompras();
}

async function setDataFilterExp() {
  const data = {
    p_id: 3,
    p_date: Dom.getValue(EL.FILTRO),
  };
  await setConfig(data);
}

function setarDataHora(checkbox, text) {
  setDateTime(checkbox, text);
}

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("compras", "compras.html");
  getDataFilterBuy();
  Table.onmouseover("table");
  Table.onclickHighlightRow("table");
  enableTableFilterSort("table");
  Dom.allUpperCase();
  Dom.addEventBySelector("#table", "dblclick", (e) => populateAndShowModal(e));
});

// atualiza lista e salva filtro ao sair do campo de data
Dom.addEventBySelector(EL.FILTRO, "blur", getAcessoriosCompras);
Dom.addEventBySelector(EL.FILTRO, "blur", setDataFilterExp);
Dom.addEventBySelector("#bt_update", "click", setAcessorios);
