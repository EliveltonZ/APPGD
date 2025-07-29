import Swal from "./sweetalert2.esm.all.min.js";
import {
  checkValue,
  setText,
  getText,
  convertDataBr,
  ajustarTamanhoModal,
  onmouseover,
  colorStatus,
  colorAcessorios,
  onclickHighlightRow,
  createModal,
  messageInformation,
  addEventBySelector,
  getConfig,
  setConfig,
  setInnerHtml,
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";

async function fillTable() {
  const date_condition = getText("txt_datafilter");

  if (date_condition) {
    const response = await fetch(
      `/fillTableStts?data_condition=${date_condition}`
    );

    if (!response.ok) {
      const errText = response.statusText;
      messageInformation(
        "error",
        "ERRO",
        "Não foi possivel carregar os dados" + errText
      );
    } else {
      const tbody = document.querySelector("tbody");
      tbody.innerHTML = "";

      let num = 1;
      const data = await response.json();

      data.forEach((item) => {
        const tr = document.createElement("tr");

        tr.classList.add("open-modal-row");

        const cor_status = colorStatus(item.status);
        const cor_a = colorAcessorios(item.total);

        tr.innerHTML = `
            <td style="text-align: center;">${num}</td>
            <td style="text-align: center; ${cor_a}">${item.a}</td>
            <td style="text-align: center;">${item.ordemdecompra}</td>
            <td style="text-align: center;">${checkValue(item.pedido)}</td>
            <td style="text-align: center;">${checkValue(item.etapa)}</td>
            <td style="text-align: center;">${checkValue(item.codcc)}</td>
            <td>${item.cliente}</td>
            <td style="text-align: center;">${checkValue(item.contrato)}</td>
            <td style="text-align: center;">${checkValue(item.numproj)}</td>
            <td>${item.ambiente}</td>
            <td style="text-align: center;">${checkValue(item.tipo)}</td>
            <td style="text-align: center;">${convertDataBr(
              checkValue(item.chegoufabrica)
            )}</td>
            <td style="text-align: center;">${convertDataBr(
              checkValue(item.dataentrega)
            )}</td>
            <td style="text-align: center;">${checkValue(item.prazo)}</td>
            <td style="text-align: center; ${cor_status}">${item.status}</td>
            <td style="text-align: center;">${convertDataBr(
              checkValue(item.iniciado)
            )}</td>
            <td style="text-align: center;">${convertDataBr(
              checkValue(item.previsao)
            )}</td>
            <td style="text-align: center;">${convertDataBr(
              checkValue(item.pronto)
            )}</td>
            <td style="text-align: center;">${convertDataBr(
              checkValue(item.entrega)
            )}</td>
        `;
        tbody.appendChild(tr);
        num = num + 1;
      });
    }
  }
}

async function fillTableAcessorios(ordemdecompra) {
  const response = await fetch(
    `/fillTableAcessorios?p_ordemdecompra=${ordemdecompra}`
  );

  if (!response.ok) {
    messageInformation(
      "error",
      "ERRO",
      `não foi possivel carregar dados de acessorios !!!`
    );
  } else {
    const tbody = document.querySelectorAll("table tbody")[1];
    tbody.innerHTML = "";
    const data = await response.json();
    data.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td style="font-size: 9px; display: none">${item.id}</td>
        <td style="font-size: 9px;">${item.descricao}</td>
        <td style="font-size: 9px; text-align: center;">${checkValue(
          item.medida
        )}</td>
        <td style="font-size: 9px; text-align: center;">${checkValue(
          item.qtd
        )}</td>
        <td style="font-size: 9px; text-align: center;">${convertDataBr(
          checkValue(item.previsao)
        )}</td>
        <td style="font-size: 9px; text-align: center;">${convertDataBr(
          checkValue(item.datacompra)
        )}</td>
        <td style="font-size: 9px; text-align: center;">${convertDataBr(
          checkValue(item.recebido)
        )}</td>
        `;
      tbody.appendChild(tr);
    });
  }
}

function getFirstColumnValue(td) {
  const row = td.parentNode;
  return row.cells[2].innerText;
}

async function handleClikedTable(event) {
  const td = event.target;
  const tr = td.closest(".open-modal-row");

  if (!tr || td.tagName !== "TD") return;

  const firstColumnValue = getFirstColumnValue(td);
  await getStatus(firstColumnValue);
  await fillTableAcessorios(firstColumnValue);
  createModal("modal");
}

// Aplica cor baseada no status
function applyStatusColor(elementId, status) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const color =
    {
      FINALIZADO: "green",
      INICIADO: "yellow",
    }[status] || "gray";

  el.style.color = color;
}

// Define o innerHTML e aplica cor de status
function setTextInner(elementId, value) {
  setInnerHtml(elementId, value);
  applyStatusColor(elementId, value);
}

// Converte, verifica e aplica datas formatadas
function setFormattedText(id, value) {
  const formatted = convertDataBr(checkValue(value));
  setText(id, formatted);
}

// Aplica valores simples em campos
function applyBasicFields(item) {
  setText("txt_numoc", item.ordemdecompra);
  setText("txt_cliente", item.cliente);
  setText("txt_contrato", item.contrato);
  setText("txt_codcc", item.codcc);
  setText("txt_ambiente", item.ambiente);
  setText("txt_numproj", item.numproj);
  setText("txt_lote", item.lote);
  setText("txt_observacoes", item.observacoes);
}

// Aplica campos de data
function applyDateFields(item) {
  setFormattedText("txt_chegoufabrica", item.chegoufabrica);
  setFormattedText("txt_dataentrega", item.dataentrega);
}

// Aplica campos de status ou datas com cores
function applyStatusFields(item) {
  const statusFields = {
    lb_corte: item.scorte,
    lb_customizacao: item.scustom,
    lb_coladeira: item.scoladeira,
    lb_usinagem: item.susinagem,
    lb_montagem: item.smontagem,
    lb_paineis: item.spaineis,
    lb_acabamento: item.sacabamento,
    lb_embalagem: item.sembalagem,
    lb_previsao: convertDataBr(checkValue(item.previsao)),
    lb_pronto: convertDataBr(checkValue(item.pronto)),
    lb_entrega: convertDataBr(checkValue(item.entrega)),
    lb_tamanho: item.tamanho,
    lb_total_volumes: item.totalvolumes,
  };

  for (const [id, value] of Object.entries(statusFields)) {
    setTextInner(id, value);
  }
}

// Mostra alerta em caso de erro
function showError(message) {
  Swal.fire({
    icon: "error",
    text: `Não foi possível carregar os dados: ${message}`,
  });
}

// Função principal
async function getStatus(ordemDeCompra) {
  try {
    const response = await fetch(`/getStatus?p_ordemdecompra=${ordemDeCompra}`);

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const data = await response.json();

    data.forEach((item) => {
      applyBasicFields(item);
      applyDateFields(item);
      applyStatusFields(item);
    });
  } catch (error) {
    showError(error.message);
  }
}

async function getDataFilterStts() {
  const data = await getConfig(2);
  setText("txt_datafilter", data[0].p_data);
  fillTable();
}

async function setDataFilterStts() {
  const data = {
    p_id: 2,
    p_date: getText("txt_datafilter"),
  };
  await setConfig(data);
}

document.addEventListener("resize", ajustarTamanhoModal);

document.addEventListener("DOMContentLoaded", (event) => {
  fillTable();
  getDataFilterStts();
  onmouseover("table");
  ajustarTamanhoModal();
  onclickHighlightRow("table");
  enableTableFilterSort("table");
  window.addEventListener("resize", ajustarTamanhoModal);
});

addEventBySelector("#table", "dblclick", handleClikedTable);
addEventBySelector("#txt_datafilter", "blur", fillTable);
addEventBySelector("#txt_datafilter", "blur", setDataFilterStts);
