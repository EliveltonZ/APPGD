import Swal from "./sweetalert2.esm.all.min.js";
import {
  ajustarTamanhoModal,
  loadPage,
  onclickHighlightRow,
  getUsuario,
  checkPrevisao,
  getName,
} from "./utils.js";

import { Modal } from "./utils/modal.js";
import { DateTime } from "./utils/time.js";
import { enableTableFilterSort } from "./filtertable.js";
import { Dom, Table, Style, q, ce, qa } from "./UI/interface.js";
import { API } from "./service/api.js";

const EL = {
  // PROJETO
  NUM_OC: "#txt_numoc",
  CLIENTE: "#txt_cliente",
  CONTRATO: "#txt_contrato",
  CORTE_CERTO: "#txt_codcc",
  AMBIENTE: "#txt_ambiente",
  NUM_PROJ: "#txt_numproj",
  LOTE: "#txt_lote",
  CHEGOU_FABRICA: "#txt_chegoufabrica",
  DATA_ENTREGA: "#txt_dataentrega",
  OBSERVACOES: "#txt_observacoes",

  // CORTE
  CORTE_INICIO: "#txt_corteinicio",
  CORTE_FIM: "#txt_cortefim",
  CORTE_PAUSA: "#chk_corte",
  CORTE_ID: "#txt_corteid",
  CORTE_RESP: "#txt_corteresp",

  // CUSTOMIZACAO
  CUSTOM_INICIO: "#txt_customizacaoinicio",
  CUSTOM_FIM: "#txt_customizacaofim",
  CUSTOM_PAUSA: "#chk_customizacao",
  CUSTOM_ID: "#txt_customizacaoid",
  CUSTOM_RESP: "#txt_customizacaoresp",

  // COLADEIRA
  COLADEIRA_INICIO: "#txt_coladeirainicio",
  COLADEIRA_FIM: "#txt_coladeirafim",
  COLADEIRA_PAUSA: "#chk_coladeira",
  COLADEIRA_ID: "#txt_coladeiraid",
  COLADEIRA_RESP: "#txt_coladeiraresp",

  // USINAGEM
  USINAGEM_INICIO: "#txt_usinageminicio",
  USINAGEM_FIM: "#txt_usinagemfim",
  USINAGEM_PAUSA: "#chk_usinagem",
  USINAGEM_ID: "#txt_usinagemid",
  USINAGEM_RESP: "#txt_usinagemresp",

  // MONTAGEM
  MONTAGEM_INICIO: "#txt_montageminicio",
  MONTAGEM_FIM: "#txt_montagemfim",
  MONTAGEM_PAUSA: "#chk_montagem",
  MONTAGEM_ID: "#txt_montagemid",
  MONTAGEM_RESP: "#txt_montagemresp",

  // PAINEIS
  PAINEIS_INICIO: "#txt_paineisinicio",
  PAINEIS_FIM: "#txt_paineisfim",
  PAINEIS_PAUSA: "#chk_paineis",
  PAINEIS_ID: "#txt_paineisid",
  PAINEIS_RESP: "#txt_paineisresp",

  // ACABAMENTOS
  ACABAMENTOS_INICIO: "#txt_acabamentoinicio",
  ACABAMENTOS_FIM: "#txt_acabamentofim",
  ACABAMENTOS_PAUSA: "#chk_acabamento",
  ACABAMENTOS_ID: "#txt_acabamentoid",
  ACABAMENTOS_RESP: "#txt_acabamentoresp",

  // EMBALAGEM
  EMBALAGEM_INICIO: "#txt_embalageminicio",
  EMBALAGEM_FIM: "#txt_embalagemfim",
  EMBALAGEM_PAUSA: "#chk_embalagem",
  EMBALAGEM_ID: "#txt_embalagemid",
  EMBALAGEM_RESP: "#txt_embalagemresp",
  TABLE: "#table",
};

const DB = {
  getDataProjetcs: async function () {
    const res = await API.fetchQuery("/fillTablePrevisao");
    return res;
  },

  getDataProjetc: async function (orderBy) {
    const url = `/getPrevisao?p_ordemdecompra=${orderBy}`;
    const res = await API.fetchQuery(url);
    return res;
  },

  getDataAcessories: async function (orderBy) {
    const url = `/fillTableAcessorios?p_ordemdecompra=${orderBy}`;
    const res = await API.fetchQuery(url);
    return res;
  },
};

function checkText(item) {
  if (item === "FINALIZADO") {
    return "color: rgb(70, 136, 0);";
  } else if (item === "INICIADO") {
    return "color:rgb(194, 184, 6)";
  }
}

async function populateTableProjects() {
  const res = await DB.getDataProjetcs();

  if (res.status !== 200) {
    Modal.showInfo("error", "ERRO", `${res.data}`);
  } else {
    const td = "td";
    const tbody = q("tbody");
    tbody.innerHTML = "";
    let num = 1;

    res.data.forEach((item) => {
      const tr = ce("tr");
      tr.classList.add("open-modal-row");
      tr.classList.add("fw-bold");

      const cor_corte = checkText(item.scorte);
      const cor_custom = checkText(item.scustom);
      const cor_coladeira = checkText(item.scoladeira);
      const cor_usinagem = checkText(item.susinagem);
      const cor_paineis = checkText(item.spaineis);
      const cor_montagem = checkText(item.smontagem);
      const cor_embalagem = checkText(item.sembalagem);
      const cor_separacao = checkText(item.sseparacao);
      const cor_status = Style.colorStatus(item.status);
      const cor_a = Style.setColorBool(item.total);
      const corPrev = checkPrevisao(item.previsao, item.dataentrega);
      const dNone = "display: None;";
      const leftText = "text-align: left;";
      tr.append(Dom.createElement(td, num));
      tr.append(Dom.createElement(td, item.a, cor_a));
      tr.append(Dom.createElement(td, item.pedido));
      tr.append(Dom.createElement(td, item.etapa));
      tr.append(Dom.createElement(td, item.codcc));
      tr.append(Dom.createElement(td, item.lote));
      tr.append(Dom.createElement(td, item.cliente, leftText));
      tr.append(Dom.createElement(td, item.contrato));
      tr.append(Dom.createElement(td, item.ambiente, leftText));
      tr.append(Dom.createElement(td, item.status, cor_status));
      tr.append(Dom.createElement(td, item.dias_restantes));
      tr.append(Dom.createElement(td, item.material));
      tr.append(Dom.createElement(td, item.scorte, cor_corte));
      tr.append(Dom.createElement(td, item.scustom, cor_custom));
      tr.append(Dom.createElement(td, item.scoladeira, cor_coladeira));
      tr.append(Dom.createElement(td, item.susinagem, cor_usinagem));
      tr.append(Dom.createElement(td, item.spaineis, cor_paineis));
      tr.append(Dom.createElement(td, item.smontagem, cor_montagem));
      tr.append(Dom.createElement(td, item.sembalagem, cor_embalagem));
      tr.append(Dom.createElement(td, item.sseparacao, cor_separacao));
      tr.append(Dom.createElement(td, DateTime.forBr(item.dataentrega)));
      tr.append(Dom.createElement(td, DateTime.forBr(item.previsao)));
      tr.append(Dom.createElement(td, item.ordemdecompra, dNone));

      tbody.appendChild(tr);
      num++;
    });
  }
}

async function populateTableAcessories(ordeBy) {
  const res = await DB.getDataAcessories(ordeBy);

  if (res.status !== 200) {
    Modal.showInfo(
      "error",
      "ERRO",
      `Erro ao carregar acessorios !!! ${res.data}`
    );
  } else {
    const tbody = qa("table tbody")[1];
    tbody.innerHTML = "";
    tbody.style.font = "9px";
    const td = "td";
    const dNone = "display: none;";
    const textLeft = "text-align: left;";
    res.data.forEach((item) => {
      const tr = ce("tr");

      tr.append(Dom.createElement(td, item.id, dNone));
      tr.append(Dom.createElement(td, item.descricao, textLeft));
      tr.append(Dom.createElement(td, item.medida));
      tr.append(Dom.createElement(td, item.qtd));
      tr.append(Dom.createElement(td, DateTime.forBr(item.datacompra)));
      tr.append(Dom.createElement(td, DateTime.forBr(item.previsao)));
      tr.append(Dom.createElement(td, DateTime.forBr(item.recebido)));
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
  const firstColumnValue = Table.getIndexColumnValue(td, 22);
  await populateModalPrev(firstColumnValue);
  await populateTableAcessories(firstColumnValue);
  Modal.show("modal");
}

async function populateModalPrev(ordemdecompra) {
  const res = await DB.getDataProjetc(ordemdecompra);
  if (res.status !== 200) {
    Modal.showInfo("error", "ERRO", `Ocorreu um erro ${error.message}`);
  } else {
    for (const item of res.data) {
      Dom.setValue(EL.NUM_OC, item.ordemdecompra);
      Dom.setValue(EL.CLIENTE, item.cliente);
      Dom.setValue(EL.CONTRATO, item.contrato);
      Dom.setValue(EL.CORTE_CERTO, item.codcc);
      Dom.setValue(EL.AMBIENTE, item.ambiente);
      Dom.setValue(EL.NUM_PROJ, item.numproj);
      Dom.setValue(EL.LOTE, item.lote);
      Dom.setValue(EL.CHEGOU_FABRICA, DateTime.forBr(item.chegoufabrica));
      Dom.setValue(EL.DATA_ENTREGA, DateTime.forBr(item.dataentrega));

      Dom.setValue(EL.CORTE_INICIO, item.corteinicio);
      Dom.setValue(EL.CORTE_FIM, item.cortefim);
      Dom.setChecked(EL.CORTE_PAUSA, item.cortepausa);
      Dom.setValue(EL.CORTE_ID, item.corteresp);
      Dom.setValue(EL.CORTE_RESP, await getName(EL.CORTE_ID));

      Dom.setValue(EL.CUSTOM_INICIO, item.customizacaoinicio);
      Dom.setValue(EL.CUSTOM_FIM, item.customizacaofim);
      Dom.setChecked(EL.CUSTOM_PAUSA, item.customizacaopausa);
      Dom.setValue(EL.CUSTOM_ID, item.customizacaoresp);
      Dom.setValue(EL.CUSTOM_RESP, await getName(EL.CUSTOM_ID));

      Dom.setValue(EL.COLADEIRA_INICIO, item.coladeirainicio);
      Dom.setValue(EL.COLADEIRA_FIM, item.coladeirafim);
      Dom.setChecked(EL.COLADEIRA_PAUSA, item.coladeirapausa);
      Dom.setValue(EL.COLADEIRA_ID, item.coladeiraresp);
      Dom.setValue(EL.COLADEIRA_RESP, await getName(EL.COLADEIRA_ID));

      Dom.setValue(EL.USINAGEM_INICIO, item.usinageminicio);
      Dom.setValue(EL.USINAGEM_FIM, item.usinagemfim);
      Dom.setChecked(EL.USINAGEM_PAUSA, item.usinagempausa);
      Dom.setValue(EL.USINAGEM_ID, item.usinagemresp);
      Dom.setValue(EL.USINAGEM_RESP, await getName(EL.USINAGEM_ID));

      Dom.setValue(EL.MONTAGEM_INICIO, item.montageminicio);
      Dom.setValue(EL.MONTAGEM_FIM, item.montagemfim);
      Dom.setChecked(EL.MONTAGEM_PAUSA, item.montagempausa);
      Dom.setValue(EL.MONTAGEM_ID, item.montagemresp);
      Dom.setValue(EL.MONTAGEM_RESP, await getName(EL.MONTAGEM_ID));

      Dom.setValue(EL.PAINEIS_INICIO, item.paineisinicio);
      Dom.setValue(EL.PAINEIS_FIM, item.paineisfim);
      Dom.setChecked(EL.PAINEIS_PAUSA, item.paineispausa);
      Dom.setValue(EL.PAINEIS_ID, item.paineisresp);
      Dom.setValue(EL.PAINEIS_RESP, await getName(EL.PAINEIS_ID));

      Dom.setValue(EL.ACABAMENTOS_INICIO, item.acabamentoinicio);
      Dom.setValue(EL.ACABAMENTOS_FIM, item.acabamentofim);
      Dom.setChecked(EL.ACABAMENTOS_PAUSA, item.acabamentopausa);
      Dom.setValue(EL.ACABAMENTOS_ID, item.acabamentoresp);
      Dom.setValue(EL.ACABAMENTOS_RESP, await getName(EL.ACABAMENTOS_ID));

      Dom.setValue(EL.EMBALAGEM_INICIO, item.embalageminicio);
      Dom.setValue(EL.EMBALAGEM_FIM, item.embalagemfim);
      Dom.setChecked(EL.EMBALAGEM_PAUSA, item.embalagempausa);
      Dom.setValue(EL.EMBALAGEM_ID, item.embalagemresp);
      Dom.setValue(EL.EMBALAGEM_RESP, await getName(EL.EMBALAGEM_ID));

      Dom.setValue(EL.OBSERVACOES, item.observacoes);
    }
  }
}

function init() {
  loadPage("previsao", "previsoes.html");
  populateTableProjects();
  Table.onmouseover(EL.TABLE.slice(1));
  enableTableFilterSort(EL.TABLE.slice(1));
  onclickHighlightRow(EL.TABLE.slice(1));
  window.addEventListener("resize", ajustarTamanhoModal);
  Dom.addEventBySelector(EL.TABLE, "dblclick", handleTableClicked);
}

window.addEventListener("resize", ajustarTamanhoModal);
document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
