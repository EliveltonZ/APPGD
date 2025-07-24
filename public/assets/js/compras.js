import {
  checkValue,
  setText,
  getText,
  convertDataBr,
  convertDataISO,
  getColumnValue,
  allUpperCase,
  onmouseover,
  onclickHighlightRow,
  loadPage,
  colorStatus,
  addEventBySelector,
  createModal,
  messageInformation,
  messageQuestion,
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";

async function getAcessoriosCompras() {
  const response = await fetch("/getAcessoriosCompras");

  if (!response.ok) {
    messageInformation(
      "error",
      `Não foi possível carregar dados ${error.message}`
    );
    return;
  } else {
    const data = await response.json();

    const sorted = data.sort((a, b) => {
      const dateA = new Date(a.dataentrega);
      const dateB = new Date(b.dataentrega);
      if (dateA - dateB !== 0) return dateA - dateB;

      const clienteComp = a.cliente.localeCompare(b.cliente);
      if (clienteComp !== 0) return clienteComp;

      const ambienteComp = a.ambiente.localeCompare(b.ambiente);
      if (ambienteComp !== 0) return ambienteComp;

      const categoriaComp = a.categoria.localeCompare(b.categoria);
      if (categoriaComp !== 0) return categoriaComp;

      return a.descricao.localeCompare(b.descricao);
    });

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    sorted.forEach((item) => {
      const tr = document.createElement("tr");

      tr.classList.add("open-modal-row");

      const cor_status = colorStatus(item.status);

      tr.innerHTML = `
          <td style="text-align: center;">${checkValue(item.contrato)}</td>
          <td>${checkValue(item.cliente)}</td>
          <td>${checkValue(item.ambiente)}</td>
          <td>${checkValue(item.descricao)}</td>
          <td style="text-align: center;">${checkValue(item.medida)}</td>
          <td style="text-align: center;">${checkValue(item.parcelamento)}</td>
          <td style="text-align: center;">${checkValue(item.numcard)}</td>
          <td style="text-align: center;">${checkValue(item.qtd)}</td>
          <td>${checkValue(item.fornecedor)}</td>
          <td style="text-align: center;">${convertDataBr(
            checkValue(item.dataentrega)
          )}</td>
          <td style="text-align: center;">${convertDataBr(
            checkValue(item.datacompra)
          )}</td>
          <td style="text-align: center;">${convertDataBr(
            checkValue(item.previsao)
          )}</td>
          <td style="text-align: center;">${convertDataBr(
            checkValue(item.recebido)
          )}</td>      
          <td style="text-align: center; ${cor_status};">${checkValue(
        item.status
      )}</td>  
          <td>${checkValue(item.categoria)}</td>
          <td style="text-align: center; display: none">${checkValue(
            item.id
          )}</td>
        `;

      tbody.appendChild(tr);
    });
  }
}

function fillElement(element) {
  const id = getColumnValue(element, 15);
  const contrato = getColumnValue(element, 0);
  const cliente = getColumnValue(element, 1);
  const ambiente = getColumnValue(element, 2);
  const descricao = getColumnValue(element, 3);
  const medida = getColumnValue(element, 4);
  const parcelamento = getColumnValue(element, 5);
  const cartao = getColumnValue(element, 6);
  const quantidade = getColumnValue(element, 7);
  const fornecedor = getColumnValue(element, 8);
  const compra = convertDataISO(getColumnValue(element, 10));
  const previsao = convertDataISO(getColumnValue(element, 11));
  const recebido = convertDataISO(getColumnValue(element, 12));
  setText("txt_id", id);
  setText("txt_contrato", contrato);
  setText("txt_cliente", cliente);
  setText("txt_ambiente", ambiente);
  setText("txt_descricao", descricao);
  setText("txt_medida", medida);
  setText("txt_parcelamento", parcelamento);
  setText("txt_cartao", cartao);
  setText("txt_quantidade", quantidade);
  setText("txt_fornecedor", fornecedor);
  setText("txt_compra", compra);
  setText("txt_previsao", previsao);
  setText("txt_recebido", recebido);
}

document
  .getElementById("table")
  .addEventListener("dblclick", async function (event) {
    const td = event.target;
    const tr = td.closest(".open-modal-row");

    if (!tr || td.tagName !== "TD") return;
    fillElement(td);
    createModal("modal");
  });

async function setAcessorios() {
  const data = {
    p_id: getText("txt_id"),
    p_descricao: getText("txt_descricao"),
    p_medida: getText("txt_medida"),
    p_parcelamento: getText("txt_parcelamento"),
    p_numcard: getText("txt_cartao"),
    p_qtd: getText("txt_quantidade"),
    p_fornecedor: getText("txt_fornecedor"),
    p_datacompra: getText("txt_compra"),
    p_previsao: getText("txt_previsao"),
    p_recebido: getText("txt_recebido"),
  };

  const response = await fetch("/setAcessorios", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errText = await response.text();
    messageInformation("error", "ERRO", `erro ao salvar alterações ${errText}`);
  } else {
    await getAcessoriosCompras();
    messageInformation(
      "success",
      "Sucesso",
      "alterações salvas com Sucesso !!!"
    );
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("compras", "compras.html");
  getAcessoriosCompras();
  onmouseover("table");
  onclickHighlightRow("table");
  enableTableFilterSort("table");
  allUpperCase();
});

addEventBySelector("#bt_update", "click", setAcessorios);
