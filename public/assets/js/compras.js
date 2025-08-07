import {
  Dom,
  checkValue,
  convertDataBr,
  convertDataISO,
  getColumnValue,
  onmouseover,
  onclickHighlightRow,
  loadPage,
  colorStatus,
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
  Dom.setValue("txt_id", id);
  Dom.setValue("txt_contrato", contrato);
  Dom.setValue("txt_cliente", cliente);
  Dom.setValue("txt_ambiente", ambiente);
  Dom.setValue("txt_descricao", descricao);
  Dom.setValue("txt_medida", medida);
  Dom.setValue("txt_parcelamento", parcelamento);
  Dom.setValue("txt_cartao", cartao);
  Dom.setValue("txt_quantidade", quantidade);
  Dom.setValue("txt_fornecedor", fornecedor);
  Dom.setValue("txt_compra", compra);
  Dom.setValue("txt_previsao", previsao);
  Dom.setValue("txt_recebido", recebido);
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
    p_id: Dom.getValue("txt_id"),
    p_descricao: Dom.getValue("txt_descricao"),
    p_medida: Dom.getValue("txt_medida"),
    p_parcelamento: Dom.getValue("txt_parcelamento"),
    p_numcard: Dom.getValue("txt_cartao"),
    p_qtd: Dom.getValue("txt_quantidade"),
    p_fornecedor: Dom.getValue("txt_fornecedor"),
    p_datacompra: Dom.getValue("txt_compra"),
    p_previsao: Dom.getValue("txt_previsao"),
    p_recebido: Dom.getValue("txt_recebido"),
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
  Dom.allUpperCase();
});

Dom.addEventBySelector("#bt_update", "click", setAcessorios);
