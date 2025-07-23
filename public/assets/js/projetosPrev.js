import Swal from "./sweetalert2.esm.all.min.js";
import {
  checkValue,
  setText,
  setChecked,
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
  getText,
  addEventBySelector,
  getUsuario,
  checkPrevisao,
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";

function checkText(item) {
  if (item === "FINALIZADO") {
    return "color: green;";
  } else if (item === "INICIADO") {
    return "color: yellow";
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
      setText("txt_numoc", item.ordemdecompra);
      setText("txt_cliente", item.cliente);
      setText("txt_contrato", item.contrato);
      setText("txt_codcc", item.codcc);
      setText("txt_ambiente", item.ambiente);
      setText("txt_numproj", item.numproj);
      setText("txt_lote", item.lote);
      setText("txt_chegoufabrica", convertDataBr(item.chegoufabrica));
      setText("txt_dataentrega", convertDataBr(item.dataentrega));

      setText("txt_corteinicio", item.corteinicio);
      setText("txt_cortefim", item.cortefim);
      setChecked("chk_corte", item.cortepausa);
      setText("txt_corteid", item.corteresp);
      getUsuario(getText("txt_corteid"), "txt_corteresp");

      setText("txt_customizacaoinicio", item.customizacaoinicio);
      setText("txt_customizacaofim", item.customizacaofim);
      setChecked("chk_customizacao", item.customizacaopausa);
      setText("txt_customizacaoid", item.customizacaoresp);
      getUsuario(getText("txt_customizacaoid"), "txt_customizacaoresp");

      setText("txt_coladeirainicio", item.coladeirainicio);
      setText("txt_coladeirafim", item.coladeirafim);
      setChecked("chk_coladeira", item.coladeirapausa);
      setText("txt_coladeiraid", item.coladeiraresp);
      getUsuario(getText("txt_coladeiraid"), "txt_coladeiraresp");

      setText("txt_usinageminicio", item.usinageminicio);
      setText("txt_usinagemfim", item.usinagemfim);
      setChecked("chk_usinagem", item.usinagempausa);
      setText("txt_usinagemid", item.usinagemresp);
      getUsuario(getText("txt_usinagemid"), "txt_usinagemresp");

      setText("txt_montageminicio", item.montageminicio);
      setText("txt_montagemfim", item.montagemfim);
      setText("txt_montagemfim", item.montagemfim);
      setChecked("chk_montagem", item.montagempausa);
      setText("txt_montagemid", item.montagemresp);
      getUsuario(getText("txt_montagemid"), "txt_montagemresp");

      setText("txt_paineisinicio", item.paineisinicio);
      setText("txt_paineisfim", item.paineisfim);
      setText("txt_paineisfim", item.paineisfim);
      setChecked("chk_paineis", item.paineispausa);
      setText("txt_paineisid", item.paineisresp);
      getUsuario(getText("txt_paineisid"), "txt_paineisresp");

      setText("txt_acabamentoinicio", item.acabamentoinicio);
      setText("txt_acabamentofim", item.acabamentofim);
      setText("txt_acabamentofim", item.acabamentofim);
      setChecked("chk_acabamento", item.acabamentopausa);
      setText("txt_acabamentoid", item.acabamentoresp);
      getUsuario(getText("txt_acabamentoid"), "txt_acabamentoresp");

      setText("txt_embalageminicio", item.embalageminicio);
      setText("txt_embalagemfim", item.embalagemfim);
      setText("txt_embalagemfim", item.embalagemfim);
      setChecked("chk_embalagem", item.embalagempausa);
      setText("txt_embalagemid", item.embalagemresp);
      getUsuario(getText("txt_embalagemid"), "txt_embalagemresp");

      setText("txt_observacoes", item.observacoes);
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
  loadPage("previsao", "projetos_prev.html");
  fillTable();
  onmouseover("table");
  enableTableFilterSort("table");
  onclickHighlightRow("table");
  window.addEventListener("resize", ajustarTamanhoModal);
});

addEventBySelector("#table", "dblclick", handleTableClicked);
