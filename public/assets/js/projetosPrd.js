import {
  ajustarTamanhoModal,
  loadPage,
  getCookie,
  getName,
  confirmDateInsertion,
  handleElementsUser,
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";
import { Dom, Style, Table, q, ce, qa } from "./UI/interface.js";
import { API, Service } from "./service/api.js";
import { DateTime } from "./utils/time.js";
import { Modal } from "./utils/modal.js";
import { Email } from "./utils/email.js";
import { Numbers } from "./utils/number.js";

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
  PREVISAO: "#txt_previsao",
  OBSERVACOES: "#txt_observacoes",

  // CORTE
  CORTE_INICIO: "#txt_corteinicio",
  CORTE_FIM: "#txt_cortefim",
  CORTE_PAUSA: "#chk_corte",
  CORTE_ID: "#txt_corteid",
  CORTE_C_INICIO: "#chk_corteinicio",
  CORTE_C_FIM: "#chk_cortefim",
  CORTE_RESP: "#txt_corteresp",

  // CUSTOMIZACAO
  CUSTOM_INICIO: "#txt_customizacaoinicio",
  CUSTOM_FIM: "#txt_customizacaofim",
  CUSTOM_PAUSA: "#chk_customizacao",
  CUSTOM_ID: "#txt_customizacaoid",
  CUSTOM_C_INICIO: "#chk_customizacaoinicio",
  CUSTOM_C_FIM: "#chk_customizacaofim",
  CUSTOM_RESP: "#txt_customizacaoresp",

  // COLADEIRA
  COLADEIRA_INICIO: "#txt_coladeirainicio",
  COLADEIRA_FIM: "#txt_coladeirafim",
  COLADEIRA_PAUSA: "#chk_coladeira",
  COLADEIRA_ID: "#txt_coladeiraid",
  COLADEIRA_C_INICIO: "#chk_coladeirainicio",
  COLADEIRA_C_FIM: "#chk_coladeirafim",
  COLADEIRA_RESP: "#txt_coladeiraresp",

  // USINAGEM
  USINAGEM_INICIO: "#txt_usinageminicio",
  USINAGEM_FIM: "#txt_usinagemfim",
  USINAGEM_PAUSA: "#chk_usinagem",
  USINAGEM_ID: "#txt_usinagemid",
  USINAGEM_C_INICIO: "#chk_usinageminicio",
  USINAGEM_C_FIM: "#chk_usinagemfim",
  USINAGEM_RESP: "#txt_usinagemresp",

  // MONTAGEM
  MONTAGEM_INICIO: "#txt_montageminicio",
  MONTAGEM_FIM: "#txt_montagemfim",
  MONTAGEM_PAUSA: "#chk_montagem",
  MONTAGEM_ID: "#txt_montagemid",
  MONTAGEM_C_INICIO: "#chk_montageminicio",
  MONTAGEM_C_FIM: "#chk_montagemfim",
  MONTAGEM_RESP: "#txt_montagemresp",

  // PAINEIS
  PAINEIS_INICIO: "#txt_paineisinicio",
  PAINEIS_FIM: "#txt_paineisfim",
  PAINEIS_PAUSA: "#chk_paineis",
  PAINEIS_ID: "#txt_paineisid",
  PAINEIS_C_INICIO: "#chk_paineisinicio",
  PAINEIS_C_FIM: "#chk_paineisfim",
  PAINEIS_RESP: "#txt_paineisresp",

  // ACABAMENTOS
  ACABAMENTOS_INICIO: "#txt_acabamentoinicio",
  ACABAMENTOS_FIM: "#txt_acabamentofim",
  ACABAMENTOS_PAUSA: "#chk_acabamento",
  ACABAMENTOS_ID: "#txt_acabamentoid",
  ACABAMENTOS_C_INICIO: "#chk_acabamentoinicio",
  ACABAMENTOS_C_FIM: "#chk_acabamentofim",
  ACABAMENTOS_RESP: "#txt_acabamentoresp",

  // EMBALAGEM
  EMBALAGEM_INICIO: "#txt_embalageminicio",
  EMBALAGEM_FIM: "#txt_embalagemfim",
  EMBALAGEM_PAUSA: "#chk_embalagem",
  EMBALAGEM_ID: "#txt_embalagemid",
  EMBALAGEM_C_INICIO: "#chk_embalageminicio",
  EMBALAGEM_C_FIM: "#chk_embalagemfim",
  EMBALAGEM_RESP: "#txt_embalagemresp",

  //ELEMENTS UI
  BT_FUNCIONARIOS: "#bt_funcionarios",
  TABLE: "#table",
  BT_SALVAR: "#bt_salvar",
  TABLE_MODAL: "#modal-1 tbody",
  MODAL: "#modal-1",
};

/*====================================
HEPERS de API
====================================*/

const DB = {
  getProjects: async function () {
    const response = await API.fetchQuery("/fillTablePrd");
    return response;
  },

  getAcessorios: async function (ordemdecompra) {
    const url = `/fillTableAcessorios?p_ordemdecompra=${ordemdecompra}`;
    const response = await API.fetchQuery(url);
    return response;
  },

  getProject: async function (ordemdecompra) {
    const url = `/getProducao?p_ordemdecompra=${ordemdecompra}`;
    const response = await API.fetchQuery(url);
    return response;
  },
};

async function fillTable() {
  try {
    const response = await DB.getProjects();
    if (response.status !== 200) {
      throw new Error(`Erro ao buscar os dados ${response.data}`);
    }

    const tbody = q("tbody");
    tbody.innerHTML = "";

    let num = 1;
    const td = "td";
    const tCenter = "text-align: center; ";

    response.data.forEach((item) => {
      const tr = ce("tr");
      tr.classList.add("open-modal-row");
      tr.classList.add("fw-bold");

      const corStatus = Style.colorStatus(item.status);
      const corA = Style.setColorBool(item.total);
      const corPrev = Style.checkPrevisao(item.previsao, item.dataentrega);

      tr.append(Dom.createElement(td, num, tCenter));
      tr.append(Dom.createElement(td, item.a, tCenter + corA, "hover-col"));
      tr.append(Dom.createElement(td, item.ordemdecompra, tCenter));
      tr.append(Dom.createElement(td, item.pedido, tCenter));
      tr.append(Dom.createElement(td, item.etapa, tCenter));
      tr.append(Dom.createElement(td, item.codcc, tCenter));
      tr.append(Dom.createElement(td, item.cliente));
      tr.append(Dom.createElement(td, item.contrato, tCenter));
      tr.append(Dom.createElement(td, item.numproj, tCenter));
      tr.append(Dom.createElement(td, item.ambiente));
      tr.append(Dom.createElement(td, item.tipo, tCenter));
      tr.append(
        Dom.createElement(td, DateTime.forBr(item.chegoufabrica), tCenter)
      );
      tr.append(
        Dom.createElement(td, DateTime.forBr(item.dataentrega), tCenter)
      );
      tr.append(Dom.createElement(td, item.lote, tCenter));
      tr.append(Dom.createElement(td, item.status, tCenter + corStatus));
      tr.append(Dom.createElement(td, DateTime.forBr(item.iniciado), tCenter));
      tr.append(Dom.createElement(td, DateTime.forBr(item.previsao), tCenter));
      tr.append(Dom.createElement(td, DateTime.forBr(item.pronto), tCenter));
      tr.append(Dom.createElement(td, DateTime.forBr(item.entrega), tCenter));
      tr.append(
        Dom.createElement(td, item.observacoes, "display:none", "info-col")
      );
      num++;
      tbody.appendChild(tr);
    });

    Dom.addEventBySelector(".hover-col", "mouseover", showToolTip);
    Dom.addEventBySelector(".hover-col", "mouseleave", hideToolTip);
  } catch (error) {
    Modal.showInfo("error", "Erro", "Não foi possível carregar os dados.");
    console.error("Erro ao preencher tabela:", error);
  }
}

async function fillTableAcessorios(ordemdecompra) {
  const response = await DB.getAcessorios(ordemdecompra);
  try {
    const tbody = qa("table tbody")[1];
    tbody.innerHTML = "";
    const td = "td";
    const tCenter = "text-align: center;";
    const fontSize = "font-size: 9px;";
    const d = DateTime.forBr;
    response.data.forEach((item) => {
      const tr = ce("tr");

      tr.append(Dom.createElement(td, item.id, fontSize + " display: none"));
      tr.append(Dom.createElement(td, item.descricao, fontSize));
      tr.append(Dom.createElement(td, item.medida, fontSize + tCenter));
      tr.append(Dom.createElement(td, item.qtd, fontSize));
      tr.append(Dom.createElement(td, d(item.datacompra), fontSize + tCenter));
      tr.append(Dom.createElement(td, d(item.previsao), fontSize + tCenter));
      tr.append(Dom.createElement(td, d(item.recebido), fontSize + tCenter));

      tbody.appendChild(tr);
    });
  } catch (err) {
    Modal.showInfo("error", "ERRO", `ERRO:. ${err.message}`);
  }
}

async function handleClikedTable(event) {
  const td = event.target;
  const tr = td.closest(".open-modal-row");
  if (!tr || td.tagName !== "TD") return;
  const firstColumnValue = Table.getIndexColumnValue(td, 2);
  const secondColumnValue = Table.getIndexColumnValue(td, 5);
  if (secondColumnValue != "-") {
    await getProducao(firstColumnValue);
    await fillTableAcessorios(firstColumnValue);
    Modal.show("modal");
  } else {
    Modal.showInfo("warning", "ATENÇÃO", "Projeto não Calculado");
  }
  validatedData();
}

function showToolTip(event) {
  const tooltip = q("#tooltips");
  if (event) {
    const text =
      event.target.parentElement.querySelector(".info-col").textContent;
    tooltip.textContent = text;
    tooltip.style.display = "block";
    const rect = event.target.getBoundingClientRect();
    tooltip.style.top = rect.top + window.scrollY + rect.height + 5 + "px";
    tooltip.style.left = rect.left + window.scrollX + "px";
  }
}

function hideToolTip() {
  const tooltip = q("#tooltips");
  tooltip.style.display = "none";
}

async function getProducao(ordemdecompra) {
  try {
    const response = await DB.getProject(ordemdecompra);

    if (response.status !== 200) {
      throw new Error(`Erro ao buscar os dados ${response.data}`);
    }

    for (const item of response.data) {
      Dom.setValue(EL.NUM_OC, item.ordemdecompra);
      Dom.setValue(EL.CLIENTE, item.cliente);
      Dom.setValue(EL.CONTRATO, item.contrato);
      Dom.setValue(EL.CORTE_CERTO, item.codcc);
      Dom.setValue(EL.AMBIENTE, item.ambiente);
      Dom.setValue(EL.NUM_PROJ, item.numproj);
      Dom.setValue(EL.LOTE, item.lote);
      Dom.setValue(EL.CHEGOU_FABRICA, DateTime.forBr(item.chegoufabrica));
      Dom.setValue(EL.DATA_ENTREGA, DateTime.forBr(item.dataentrega));
      Dom.setValue(EL.PREVISAO, item.previsao);

      Dom.setValue(EL.CORTE_INICIO, item.corteinicio);
      Dom.setValue(EL.CORTE_FIM, item.cortefim);
      Dom.setChecked(EL.CORTE_PAUSA, item.cortepausa);
      Dom.setValue(EL.CORTE_ID, item.corteresp);
      Dom.setValue(EL.CORTE_RESP, await getName(EL.CORTE_ID));
      Dom.setChecked(EL.CORTE_C_INICIO, false);
      Dom.setChecked(EL.CORTE_C_FIM, false);

      Dom.setValue(EL.CUSTOM_INICIO, item.customizacaoinicio);
      Dom.setValue(EL.CUSTOM_FIM, item.customizacaofim);
      Dom.setChecked(EL.CUSTOM_PAUSA, item.customizacaopausa);
      Dom.setValue(EL.CUSTOM_ID, item.customizacaoresp);
      Dom.setValue(EL.CUSTOM_RESP, await getName(EL.CUSTOM_ID));
      Dom.setChecked(EL.CUSTOM_C_INICIO, false);
      Dom.setChecked(EL.CUSTOM_C_FIM, false);

      Dom.setValue(EL.COLADEIRA_INICIO, item.coladeirainicio);
      Dom.setValue(EL.COLADEIRA_FIM, item.coladeirafim);
      Dom.setChecked(EL.COLADEIRA_PAUSA, item.coladeirapausa);
      Dom.setValue(EL.COLADEIRA_ID, item.coladeiraresp);
      Dom.setValue(EL.COLADEIRA_RESP, await getName(EL.COLADEIRA_ID));
      Dom.setChecked(EL.COLADEIRA_C_INICIO, false);
      Dom.setChecked(EL.COLADEIRA_C_FIM, false);

      Dom.setValue(EL.USINAGEM_INICIO, item.usinageminicio);
      Dom.setValue(EL.USINAGEM_FIM, item.usinagemfim);
      Dom.setChecked(EL.USINAGEM_PAUSA, item.usinagempausa);
      Dom.setValue(EL.USINAGEM_ID, item.usinagemresp);
      Dom.setValue(EL.USINAGEM_RESP, await getName(EL.USINAGEM_ID));
      Dom.setChecked(EL.USINAGEM_C_INICIO, false);
      Dom.setChecked(EL.USINAGEM_C_FIM, false);

      Dom.setValue(EL.MONTAGEM_INICIO, item.montageminicio);
      Dom.setValue(EL.MONTAGEM_FIM, item.montagemfim);
      Dom.setChecked(EL.MONTAGEM_PAUSA, item.montagempausa);
      Dom.setValue(EL.MONTAGEM_ID, item.montagemresp);
      Dom.setValue(EL.MONTAGEM_RESP, await getName(EL.MONTAGEM_ID));
      Dom.setChecked(EL.MONTAGEM_C_INICIO, false);
      Dom.setChecked(EL.MONTAGEM_C_FIM, false);

      Dom.setValue(EL.PAINEIS_INICIO, item.paineisinicio);
      Dom.setValue(EL.PAINEIS_FIM, item.paineisfim);
      Dom.setChecked(EL.PAINEIS_PAUSA, item.paineispausa);
      Dom.setValue(EL.PAINEIS_ID, item.paineisresp);
      Dom.setValue(EL.PAINEIS_RESP, await getName(EL.PAINEIS_ID));
      Dom.setChecked(EL.PAINEIS_C_INICIO, false);
      Dom.setChecked(EL.PAINEIS_C_FIM, false);

      Dom.setValue(EL.ACABAMENTOS_INICIO, item.acabamentoinicio);
      Dom.setValue(EL.ACABAMENTOS_FIM, item.acabamentofim);
      Dom.setChecked(EL.ACABAMENTOS_PAUSA, item.acabamentopausa);
      Dom.setValue(EL.ACABAMENTOS_ID, item.acabamentoresp);
      Dom.setValue(EL.ACABAMENTOS_RESP, await getName(EL.ACABAMENTOS_ID));
      Dom.setChecked(EL.ACABAMENTOS_C_INICIO, false);
      Dom.setChecked(EL.ACABAMENTOS_C_FIM, false);

      Dom.setValue(EL.EMBALAGEM_INICIO, item.embalageminicio);
      Dom.setValue(EL.EMBALAGEM_FIM, item.embalagemfim);
      Dom.setChecked(EL.EMBALAGEM_PAUSA, item.embalagempausa);
      Dom.setValue(EL.EMBALAGEM_ID, item.embalagemresp);
      Dom.setValue(EL.EMBALAGEM_RESP, await getName(EL.EMBALAGEM_ID));
      Dom.setChecked(EL.EMBALAGEM_C_INICIO, false);
      Dom.setChecked(EL.EMBALAGEM_C_FIM, false);

      Dom.setValue(EL.OBSERVACOES, item.observacoes);
    }

    localStorage.setItem("previsao", DateTime.forBr(Dom.getValue(EL.PREVISAO)));
  } catch (err) {
    alert(err.message);
  }
}

function getElementsValues() {
  const data = {
    p_ordemdecompra: Dom.getValue(EL.NUM_OC),
    p_corteinicio: Dom.getValue(EL.CORTE_INICIO),
    p_cortefim: Dom.getValue(EL.CORTE_FIM),
    p_corteresp: Dom.getValue(EL.CORTE_ID),
    p_cortepausa: Dom.getChecked(EL.CORTE_PAUSA),

    p_customizacaoinicio: Dom.getValue(EL.CUSTOM_INICIO),
    p_customizacaofim: Dom.getValue(EL.CUSTOM_FIM),
    p_customizacaoresp: Dom.getValue(EL.CUSTOM_ID),
    p_customizacaopausa: Dom.getChecked(EL.CUSTOM_PAUSA),

    p_coladeirainicio: Dom.getValue(EL.COLADEIRA_INICIO),
    p_coladeirafim: Dom.getValue(EL.COLADEIRA_FIM),
    p_coladeiraresp: Dom.getValue(EL.COLADEIRA_ID),
    p_coladeirapausa: Dom.getChecked(EL.COLADEIRA_PAUSA),

    p_usinageminicio: Dom.getValue(EL.USINAGEM_INICIO),
    p_usinagemfim: Dom.getValue(EL.USINAGEM_FIM),
    p_usinagemresp: Dom.getValue(EL.USINAGEM_ID),
    p_usinagempausa: Dom.getChecked(EL.USINAGEM_PAUSA),

    p_montageminicio: Dom.getValue(EL.MONTAGEM_INICIO),
    p_montagemfim: Dom.getValue(EL.MONTAGEM_FIM),
    p_montagemresp: Dom.getValue(EL.MONTAGEM_ID),
    p_montagempausa: Dom.getChecked(EL.MONTAGEM_PAUSA),

    p_paineisinicio: Dom.getValue(EL.PAINEIS_INICIO),
    p_paineisfim: Dom.getValue(EL.PAINEIS_FIM),
    p_paineisresp: Dom.getValue(EL.PAINEIS_ID),
    p_paineispausa: Dom.getChecked(EL.PAINEIS_PAUSA),

    p_acabamentoinicio: Dom.getValue(EL.ACABAMENTOS_INICIO),
    p_acabamentofim: Dom.getValue(EL.ACABAMENTOS_FIM),
    p_acabamentoresp: Dom.getValue(EL.ACABAMENTOS_ID),
    p_acabamentopausa: Dom.getChecked(EL.ACABAMENTOS_PAUSA),

    p_embalageminicio: Dom.getValue(EL.EMBALAGEM_INICIO),
    p_embalagemfim: Dom.getValue(EL.EMBALAGEM_FIM),
    p_embalagemresp: Dom.getValue(EL.EMBALAGEM_ID),
    p_embalagempausa: Dom.getChecked(EL.EMBALAGEM_PAUSA),

    p_observacoes: Dom.getValue(EL.OBSERVACOES),
    p_previsao: Dom.getValue(EL.PREVISAO),
  };
  return data;
}

function validatedData() {
  const data = getElementsValues();
  const steps = [
    {
      etapa: "Corte",
      start: data.p_corteinicio,
      end: data.p_cortefim,
    },
    {
      etapa: "Customização",
      start: data.p_customizacaoinicio,
      end: data.p_customizacaofim,
    },
    {
      etapa: "Coladeira",
      start: data.p_coladeirainicio,
      end: data.p_coladeirafim,
    },
    {
      etapa: "Usinagem",
      start: data.p_usinageminicio,
      end: data.p_usinagemfim,
    },
    {
      etapa: "Montagem",
      start: data.p_montageminicio,
      end: data.p_montagemfim,
    },
    {
      etapa: "Paineis",
      start: data.p_paineisinicio,
      end: data.p_paineisfim,
    },
    {
      etapa: "Acabamentos",
      start: data.p_acabamentoinicio,
      end: data.p_acabamentofim,
    },
    {
      etapa: "Embalagem",
      start: data.p_embalageminicio,
      end: data.p_embalagemfim,
    },
  ];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    // Se fim estiver preenchido, o início também deve estar
    if (step.end && !step.start) {
      return `A data de início da etapa "${step.etapa}" não foi preenchida.`;
    }

    if (
      step.start &&
      step.end &&
      DateTime.isEndBeforeStart(step.start, step.end)
    ) {
      return `A data de fim da etapa "${step.etapa}" não pode ser anterior à data de início.`;
    }

    // Verificar se as datas não são superiores à data de hoje
    if (step.start && DateTime.isDateInFuture(step.start)) {
      return `A data de início da etapa "${step.etapa}" não pode ser maior que a data de hoje.`;
    }

    if (step.end && DateTime.isDateInFuture(step.end)) {
      return `A data de fim da etapa "${step.etapa}" não pode ser maior que a data de hoje.`;
    }
  }
  return data;
}

async function setDataProducao() {
  const data = validatedData();
  if (typeof data == "string") {
    Modal.showInfo("warning", "ATENÇÃO", data);
    return;
  }
  const result = await Modal.showConfirmation(
    null,
    "Deseja confirmar Alterações?"
  );
  if (result.isConfirmed) {
    try {
      const response = await API.fetchBody("/setDataProducao", "PUT", data);

      if (response.status !== 200) {
        Modal.showInfo("error", "ERRO", "Ocorreu um erro ao salvar os dados!");
      } else {
        Modal.showInfo(
          "success",
          "Sucesso",
          "Alterações confirmadas com sucesso!"
        );
        await sendEmail();
      }
    } catch (err) {
      Modal.showInfo(
        "error",
        "ERRO",
        "Falha na comunicação com o servidor!" + err.message
      );
    }
  }
}

async function sendEmail() {
  const prevOld = localStorage.getItem("previsao");
  const contrato = Dom.getValue(EL.CONTRATO);
  const cliente = Dom.getValue(EL.CLIENTE);
  const ambiente = Dom.getValue(EL.AMBIENTE);
  const previsao = Numbers.formatCoin(Dom.getValue(EL.PREVISAO));
  if (prevOld != previsao) {
    const email = await Service.getConfig(1);
    const text = `*** ${contrato} - ${cliente} - ${ambiente} - PREV: ${previsao} ***`;
    const data = {
      destination: email[0].p_email,
      // destination: "fabrica@gd.ind.br",
      title: text,
      body: "Previsão Alterada",
    };
    await Email.send(data);
  }
}

function handleClickCheckbox() {
  const operation = [
    "corte",
    "customizacao",
    "coladeira",
    "usinagem",
    "montagem",
    "paineis",
    "acabamento",
    "embalagem",
  ];

  operation.forEach((item) => {
    Dom.addEventBySelector(`#chk_${item}inicio`, "click", () =>
      confirmDateInsertion(`#chk_${item}inicio`, `#txt_${item}inicio`)
    );

    Dom.addEventBySelector(`#chk_${item}fim`, "click", () =>
      confirmDateInsertion(`#chk_${item}fim`, `#txt_${item}fim`)
    );
  });
}

function getUsuarios() {
  const meuHTML = q(EL.MODAL).innerHTML;
  Modal.showInfo(null, null, meuHTML);
}

async function filltableUsuarios() {
  const data = await Service.getOperadores();
  const tbody = q(EL.TABLE_MODAL);
  tbody.innerHTML = "";
  data.forEach((element) => {
    const tr = ce("tr");
    tr.innerHTML = `
      <td>${element.p_id}</td>
      <td>${element.p_nome}</td>
    `;
    tbody.appendChild(tr);
  });
}

function listElementsUsers() {
  return [
    [EL.CORTE_ID, EL.CORTE_RESP],
    [EL.CUSTOM_ID, EL.CUSTOM_RESP],
    [EL.COLADEIRA_ID, EL.COLADEIRA_RESP],
    [EL.USINAGEM_ID, EL.USINAGEM_RESP],
    [EL.MONTAGEM_ID, EL.MONTAGEM_RESP],
    [EL.PAINEIS_ID, EL.PAINEIS_RESP],
    [EL.ACABAMENTOS_ID, EL.ACABAMENTOS_RESP],
    [EL.EMBALAGEM_ID, EL.EMBALAGEM_RESP],
  ];
}

function init() {
  loadPage("producao", "producao.html");
  fillTable();
  filltableUsuarios();
  enableTableFilterSort(EL.TABLE.slice(1));
  ajustarTamanhoModal();
  handleClickCheckbox();
  handleElementsUser(listElementsUsers());
  Table.onmouseover(EL.TABLE);
  Dom.enableEnterAsTab();
  Dom.rowClick(EL.TABLE);
  Dom.addEventBySelector(EL.BT_SALVAR, "click", setDataProducao);
  Dom.addEventBySelector(EL.TABLE, "dblclick", handleClikedTable);
  Dom.addEventBySelector(EL.BT_FUNCIONARIOS, "click", getUsuarios);
  document.addEventListener("resize", ajustarTamanhoModal);
}

document.addEventListener("resize", ajustarTamanhoModal);
document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
