import { convertDataBr, checkValue, messageInformation } from "./utils.js";

function setInnerText(element, value) {
  document.getElementById(element).innerText = value;
}

function getLocalStorageItem(item) {
  return localStorage.getItem(item);
}

function colorUrgente(value) {
  if (value === "SIM") {
    const element = document.getElementById("lb_urgente");
    element.style.color = "white";
    element.style.background = "red";
  }
}
function fillElements(ordemdecompra) {
  const data = JSON.parse(localStorage.getItem("project"));
  const numoc = `${ordemdecompra.slice(0, 8)}-${ordemdecompra.slice(-2)}`;
  setInnerText("lb_contrato", data.p_contrato);
  setInnerText("lb_qproj", data.p_numproj);
  setInnerText("lb_numproj", data.p_numproj.slice(-2));
  setInnerText("lb_cliente", data.p_cliente);
  setInnerText("lb_ambiente", data.p_ambiente);
  setInnerText("lb_vendedor", data.p_vendedor);
  setInnerText("lb_entrega", convertDataBr(data.p_dataentrega));
  setInnerText("lb_liberador", data.p_liberador);
  setInnerText("lb_numoc", numoc);
  setInnerText("lb_responsavel", getLocalStorageItem("resp"));
  setInnerText("lb_data", convertDataBr(getLocalStorageItem("data")));
  setInnerText("lb_tipo", getLocalStorageItem("tipo"));
  setInnerText("lb_urgente", getLocalStorageItem("urgente"));
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

window.addEventListener("DOMContentLoaded", () => {
  loadData();
});
