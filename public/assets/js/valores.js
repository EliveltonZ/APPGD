import sweetalert2 from "https://cdn.jsdelivr.net/npm/sweetalert2@11.15.10/+esm";
import {
  formatCurrency,
  convertDecimal,
  onmouseover,
  loadPage,
  onclickHighlightRow,
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";

loadPage("valores", "valores.html");

window.fillTable = async function name() {
  const response = await fetch("/fillTableValores");

  if (!response.ok) {
    sweetalert2.fire({
      icon: "error",
      text: "Não foi possivel carregar dados",
    });
  } else {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    const config = `style="text-align:center"`;
    const data = await response.json();
    data.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td ${config}>${item.p_ordemdecompra}</td>
                <td ${config}>${item.p_contrato}</td>
                <td>${item.p_cliente}</td>
                <td ${config}>${item.p_numproj}</td>
                <td>${item.p_ambiente}</td>
                <td ${config}>${formatCurrency(item.p_valorbruto)}</td>
                <td ${config}>${formatCurrency(item.p_valornegociado)}</td>
                <td ${config}>${formatCurrency(item.p_customaterial)}</td>
                <td ${config}>${convertDecimal(item.p_desconto)}</td>
                <td ${config}>${formatCurrency(item.p_lucrobruto)}</td>
                <td ${config}>${convertDecimal(item.p_margem)}</td>
            `;
      tbody.appendChild(tr);
    });
  }
};

document.addEventListener("DOMContentLoaded", (event) => {
  fillTable();
  onmouseover("table");
  onclickHighlightRow("table");
  enableTableFilterSort("table");
});
