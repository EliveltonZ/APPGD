import { convertDataBr, checkValue, messageInformation, Dom } from "./utils.js";

function getLocalStorageItem(item) {
  return localStorage.getItem(item);
}

function colorUrgente(value) {
  if (value === "SIM") {
    const div = document.getElementById("div_urgente");
    div.style.background = "red";
    const label = document.getElementById("lb_urgente");
    label.style.color = "white";
  }
}
function fillElements(ordemdecompra) {
  const data = JSON.parse(localStorage.getItem("project"));
  const numoc = `${ordemdecompra.slice(0, 8)}-${ordemdecompra.slice(-2)}`;
  Dom.setInnerHtml("lb_contrato", data.p_contrato);
  Dom.setInnerHtml("lb_qproj", Number(data.p_numproj.slice(-2)));
  Dom.setInnerHtml("lb_numproj", data.p_numproj);
  Dom.setInnerHtml("lb_cliente", data.p_cliente);
  Dom.setInnerHtml("lb_ambiente", data.p_ambiente);
  Dom.setInnerHtml("lb_vendedor", data.p_vendedor);
  Dom.setInnerHtml("lb_dataentrega", convertDataBr(data.p_dataentrega));
  Dom.setInnerHtml("lb_liberador", data.p_liberador);
  Dom.setInnerHtml("lb_numoc", numoc);
  Dom.setInnerHtml("lb_responsavel", getLocalStorageItem("resp"));
  Dom.setInnerHtml("lb_data", convertDataBr(getLocalStorageItem("data")));
  Dom.setInnerHtml("lb_tipo", getLocalStorageItem("tipo"));
  Dom.setInnerHtml("lb_urgente", getLocalStorageItem("urgente"));
  colorUrgente(getLocalStorageItem("urgente"));
}

function fillTableAcessorios(ordemdecompra) {
  try {
    const data = JSON.parse(localStorage.getItem("acessorios"));
    const tbody = document.querySelectorAll("table tbody")[0];
    tbody.innerHTML = "";

    data.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
            <td style="font-size: 9px; ">${item.categoria}</td>
            <td style="font-size: 9px;">${item.descricao}</td>
            <td style="font-size: 9px; text-align: center;">${checkValue(
              item.medida
            )}</td>
            <td style="font-size: 9px; text-align: center;">${checkValue(
              item.qtd
            )}</td>
            `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    messageInformation(
      "error",
      "Erro",
      `Não foi possível carregar os dados. ${err.message}`
    );
  }
}

function loadData() {
  const ordemdecompra = localStorage.getItem("numoc");
  fillElements(ordemdecompra);
  fillTableAcessorios(ordemdecompra);
}

document.addEventListener("DOMContentLoaded", (event) => {
  loadData();
});
