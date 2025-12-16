import { loadPage } from "./utils.js";
import { enableTableFilterSort } from "./filtertable.js";
import { Dom, Table, Style, q, ce, qa } from "./UI/interface.js";
import { Numbers } from "./utils/number.js";
import { DateTime } from "./utils/time.js";
import { API } from "./service/api.js";
import { Modal } from "./utils/modal.js";

const DB = {
  getValues: async function () {
    const res = await API.fetchQuery("/fillTableValores");
    return res;
  },
};

function buildTableCell(value, style) {
  return Dom.createElement("td", value, style);
}

function setPercentColorDiscount(value) {
  if (!value) return;
  if (value > 10) return "color: red";
}

function setColorMarg(value) {
  if (!value) return;
  if (value >= 60) return "color: green";
  if (value > 40) return "color: yellow";
  return "color: red";
}

function createTableRow(item) {
  const config = "text-align:left";
  const colorDiscount = setPercentColorDiscount(item.p_desconto);
  const colorMarg = setColorMarg(item.p_margem);
  const tr = document.createElement("tr");
  tr.append(buildTableCell(item.p_ordemdecompra));
  tr.append(buildTableCell(item.p_contrato));
  tr.append(buildTableCell(item.p_cliente, config));
  tr.append(buildTableCell(item.p_numproj));
  tr.append(buildTableCell(item.p_ambiente, config));
  tr.append(buildTableCell(DateTime.forBr(item.p_chegoufabrica)));
  tr.append(buildTableCell(DateTime.forBr(item.p_dataentrega)));
  tr.append(buildTableCell(Numbers.currency(item.p_valorbruto)));
  tr.append(buildTableCell(Numbers.currency(item.p_valornegociado)));
  tr.append(buildTableCell(Numbers.currency(item.p_customaterial)));
  tr.append(buildTableCell(Numbers.percent(item.p_desconto), colorDiscount));
  tr.append(buildTableCell(Numbers.currency(item.p_lucrobruto)));
  tr.append(buildTableCell(Numbers.percent(item.p_margem), colorMarg));
  return tr;
}

async function fillTable() {
  const res = await DB.getValues();
  if (res.status !== 200) {
    Modal.showInfo("error", "ERRO", "não foi possivel carregar dados !!!");
  } else {
    const tbody = q("tbody");
    tbody.innerHTML = "";
    res.data.forEach((item) => {
      const tr = createTableRow(item);
      tbody.appendChild(tr);
    });
  }
}

function init() {
  loadPage("valores", "valores.html");
  fillTable();
  Table.onmouseover("table");
  Table.onclickHighlightRow("table");
  enableTableFilterSort("table");
}

document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
