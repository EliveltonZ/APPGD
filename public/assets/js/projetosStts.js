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
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";

window.fillTable = async function () {
  const date_condition = getText("txt_datafilter");

  if (date_condition) {
    const response = await fetch(
      `/fillTableStts?data_condition=${date_condition}`
    );

    if (!response.ok) {
      const errText = response.statusText;
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possivel carregar os dados" + errText,
      });
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
};

window.fillTableAcessorios = async function (ordemdecompra) {
  const response = await fetch(
    `/fillTableAcessorios?p_ordemdecompra=${ordemdecompra}`
  );

  if (!response.ok) {
    Swal.fire({
      icon: "error",
      text: `não foi possivel carregar dados de acessorios !!! ${error.message}`,
    });
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
};

function getFirstColumnValue(td) {
  const row = td.parentNode;
  return row.cells[2].innerText;
}

window.clicked = function () {
  document
    .getElementById("table")
    .addEventListener("dblclick", async function (event) {
      const td = event.target;
      const tr = td.closest(".open-modal-row");

      if (!tr || td.tagName !== "TD") return;

      const firstColumnValue = getFirstColumnValue(td);
      await getStatus(firstColumnValue);
      await fillTableAcessorios(firstColumnValue);
      createModal("modal");
    });
};

function setTextInner(element, value) {
  document.getElementById(element).innerText = value;
  if (value == "FINALIZADO") {
    document.getElementById(element).style.color = "green";
  } else if (value == "INICIADO") {
    document.getElementById(element).style.color = "yellow";
  } else {
    document.getElementById(element).style.color = "gray";
  }
}

async function getStatus(ordemdecompra) {
  const response = await fetch(
    `/getProjetosStts?p_ordemdecompra=${ordemdecompra}`
  );

  if (!response.ok) {
    Swal.fire({
      icon: "error",
      text: `não foi possivel carregar dados ${error.message}`,
    });
  } else {
    const data = await response.json();
    data.forEach((item) => {
      setText("txt_numoc", item.ordemdecompra);
      setText("txt_cliente", item.cliente);
      setText("txt_contrato", item.contrato);
      setText("txt_codcc", item.codcc);
      setText("txt_ambiente", item.ambiente);
      setText("txt_numproj", item.numproj);
      setText("txt_lote", item.lote);
      setText(
        "txt_chegoufabrica",
        convertDataBr(checkValue(item.chegoufabrica))
      );
      setText("txt_dataentrega", convertDataBr(checkValue(item.dataentrega)));
      setTextInner("lb_corte", item.scorte);
      setTextInner("lb_customizacao", item.scustom);
      setTextInner("lb_coladeira", item.scoladeira);
      setTextInner("lb_usinagem", item.susinagem);
      setTextInner("lb_montagem", item.smontagem);
      setTextInner("lb_paineis", item.spaineis);
      setTextInner("lb_embalagem", item.sembalagem);
      setTextInner("lb_previsao", convertDataBr(checkValue(item.previsao)));
      setTextInner("lb_pronto", convertDataBr(checkValue(item.pronto)));
      setTextInner("lb_entrega", convertDataBr(checkValue(item.entrega)));
      setTextInner("lb_tamanho", item.tamanho);
      setTextInner("lb_total_volumes", item.totalvolumes);
      setText("txt_observacoes", item.observacoes);
    });
  }
}

document.addEventListener("resize", ajustarTamanhoModal);

document.addEventListener("DOMContentLoaded", (event) => {
  fillTable();
  clicked();
  onmouseover("table");
  ajustarTamanhoModal();
  onclickHighlightRow("table");
  enableTableFilterSort("table");
  window.addEventListener("resize", ajustarTamanhoModal);
});
