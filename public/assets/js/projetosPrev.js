import Swal from "./sweetalert2.esm.all.min.js";
import {
  Dom,
  checkValue,
  convertDataBr,
  ajustarTamanhoModal,
  onmouseover,
  loadPage,
  colorStatus,
  colorAcessorios,
  onclickHighlightRow,
  createModal,
  messageInformation,
  messageQuestion,
  getUsuario,
  checkPrevisao,
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";

function checkText(item) {
  if (item === "FINALIZADO") {
    return "color: rgb(70, 136, 0);";
  } else if (item === "INICIADO") {
    return "color:rgb(194, 184, 6)";
  }
}

async function fillTable() {
  const response = await fetch("/fillTablePrevisao");
  const data = await response.json();

  if (!response.ok) {
    messageInformation("error", "ERRO", "Não foi possivel carregar os dados");
  } else {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    let num = 1;

    data.forEach((item) => {
      const tr = document.createElement("tr");

      tr.classList.add("open-modal-row");
      tr.classList.add("fw-bold");

      var cor_corte = checkText(item.scorte);
      var cor_custom = checkText(item.scustom);
      var cor_coladeira = checkText(item.scoladeira);
      var cor_usinagem = checkText(item.susinagem);
      var cor_paineis = checkText(item.spaineis);
      var cor_montagem = checkText(item.smontagem);
      var cor_embalagem = checkText(item.sembalagem);
      var cor_separacao = checkText(item.sseparacao);

      const cor_status = colorStatus(item.status);
      const cor_a = colorAcessorios(item.total);
      const corPrev = checkPrevisao(item.previsao, item.dataentrega);

      tr.innerHTML = `
            
            <td style="text-align: center;">${num}</td>
            <td style="text-align: center; ${cor_a}">${item.a}</td>
            <td style="text-align: center;">${item.pedido}</td>
            <td style="text-align: center;">${item.etapa}</td>
            <td style="text-align: center;">${item.codcc}</td>
            <td style="text-align: center;">${item.lote}</td>
            <td style="text-align: left;">${item.cliente}</td>
            <td style="text-align: center;">${item.contrato}</td>
            <td style="text-align: left;">${item.ambiente}</td>
            <td style="text-align: center; ${cor_status}">${item.status}</td>
            <td style="text-align: center;">${item.dias_restantes}</td>
            <td style="text-align: center;">${item.material}</td>
            <td style="text-align: center; ${cor_corte}">${item.scorte}</td>
            <td style="text-align: center; ${cor_custom}">${item.scustom}</td>
            <td style="text-align: center; ${cor_coladeira}">${
        item.scoladeira
      }</td>
            <td style="text-align: center; ${cor_usinagem}">${
        item.susinagem
      }</td>
            <td style="text-align: center; ${cor_paineis}">${item.spaineis}</td>
            <td style="text-align: center; ${cor_montagem}">${
        item.smontagem
      }</td>
            <td style="text-align: center; ${cor_embalagem}">${
        item.sembalagem
      }</td>
            <td style="text-align: center; ${cor_separacao}">${
        item.sseparacao
      }</td>
            <td style="text-align: center; white-space: nowrap">${convertDataBr(
              checkValue(item.dataentrega)
            )}</td>
            <td style="text-align: center; white-space: nowrap; ${corPrev}">${convertDataBr(
        checkValue(item.previsao)
      )}</td>
            <td style="text-align: center; display:none">${
              item.ordemdecompra
            }</td>
        `;
      tbody.appendChild(tr);

      num = num + 1;
    });
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
      `não foi possivel carregar dados de acessorios !!! ${error.message}`
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
  return row.cells[22].innerText;
}

async function handleTableClicked(event) {
  const td = event.target;
  const tr = td.closest(".open-modal-row");
  if (!tr || td.tagName !== "TD") return;
  const firstColumnValue = getFirstColumnValue(td);
  await getPrevisao(firstColumnValue);
  await fillTableAcessorios(firstColumnValue);
  createModal("modal");
}

async function getPrevisao(ordemdecompra) {
  const response = await fetch(`/getPrevisao?p_ordemdecompra=${ordemdecompra}`);
  if (!response.ok) {
    messageInformation("error", "ERRO", `Ocorreu um erro ${error.message}`);
  } else {
    const data = await response.json();
    data.forEach((item) => {
      Dom.setValue("txt_numoc", item.ordemdecompra);
      Dom.setValue("txt_cliente", item.cliente);
      Dom.setValue("txt_contrato", item.contrato);
      Dom.setValue("txt_codcc", item.codcc);
      Dom.setValue("txt_ambiente", item.ambiente);
      Dom.setValue("txt_numproj", item.numproj);
      Dom.setValue("txt_lote", item.lote);
      Dom.setValue("txt_chegoufabrica", convertDataBr(item.chegoufabrica));
      Dom.setValue("txt_dataentrega", convertDataBr(item.dataentrega));

      Dom.setValue("txt_corteinicio", item.corteinicio);
      Dom.setValue("txt_cortefim", item.cortefim);
      Dom.setChecked("chk_corte", item.cortepausa);
      Dom.setValue("txt_corteid", item.corteresp);
      getUsuario(Dom.getValue("txt_corteid"), "txt_corteresp");

      Dom.setValue("txt_customizacaoinicio", item.customizacaoinicio);
      Dom.setValue("txt_customizacaofim", item.customizacaofim);
      Dom.setChecked("chk_customizacao", item.customizacaopausa);
      Dom.setValue("txt_customizacaoid", item.customizacaoresp);
      getUsuario(Dom.getValue("txt_customizacaoid"), "txt_customizacaoresp");

      Dom.setValue("txt_coladeirainicio", item.coladeirainicio);
      Dom.setValue("txt_coladeirafim", item.coladeirafim);
      Dom.setChecked("chk_coladeira", item.coladeirapausa);
      Dom.setValue("txt_coladeiraid", item.coladeiraresp);
      getUsuario(Dom.getValue("txt_coladeiraid"), "txt_coladeiraresp");

      Dom.setValue("txt_usinageminicio", item.usinageminicio);
      Dom.setValue("txt_usinagemfim", item.usinagemfim);
      Dom.setChecked("chk_usinagem", item.usinagempausa);
      Dom.setValue("txt_usinagemid", item.usinagemresp);
      getUsuario(Dom.getValue("txt_usinagemid"), "txt_usinagemresp");

      Dom.setValue("txt_montageminicio", item.montageminicio);
      Dom.setValue("txt_montagemfim", item.montagemfim);
      Dom.setValue("txt_montagemfim", item.montagemfim);
      Dom.setChecked("chk_montagem", item.montagempausa);
      Dom.setValue("txt_montagemid", item.montagemresp);
      getUsuario(Dom.getValue("txt_montagemid"), "txt_montagemresp");

      Dom.setValue("txt_paineisinicio", item.paineisinicio);
      Dom.setValue("txt_paineisfim", item.paineisfim);
      Dom.setValue("txt_paineisfim", item.paineisfim);
      Dom.setChecked("chk_paineis", item.paineispausa);
      Dom.setValue("txt_paineisid", item.paineisresp);
      getUsuario(Dom.getValue("txt_paineisid"), "txt_paineisresp");

      Dom.setValue("txt_acabamentoinicio", item.acabamentoinicio);
      Dom.setValue("txt_acabamentofim", item.acabamentofim);
      Dom.setValue("txt_acabamentofim", item.acabamentofim);
      Dom.setChecked("chk_acabamento", item.acabamentopausa);
      Dom.setValue("txt_acabamentoid", item.acabamentoresp);
      getUsuario(Dom.getValue("txt_acabamentoid"), "txt_acabamentoresp");

      Dom.setValue("txt_embalageminicio", item.embalageminicio);
      Dom.setValue("txt_embalagemfim", item.embalagemfim);
      Dom.setValue("txt_embalagemfim", item.embalagemfim);
      Dom.setChecked("chk_embalagem", item.embalagempausa);
      Dom.setValue("txt_embalagemid", item.embalagemresp);
      getUsuario(Dom.getValue("txt_embalagemid"), "txt_embalagemresp");

      Dom.setValue("txt_observacoes", item.observacoes);
    });
  }
}

async function filltableUsuarios() {
  const data = await getOperadores();
  const tbody = document.querySelector("#modal-1 tbody");
  tbody.innerHTML = "";
  data.forEach((element) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${element.p_id}</td>
      <td>${element.p_nome}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener("resize", ajustarTamanhoModal);

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("previsao", "previsoes.html");
  fillTable();
  onmouseover("table");
  enableTableFilterSort("table");
  onclickHighlightRow("table");
  window.addEventListener("resize", ajustarTamanhoModal);
});

Dom.addEventBySelector("#table", "dblclick", handleTableClicked);
