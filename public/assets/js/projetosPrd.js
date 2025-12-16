import {
  ajustarTamanhoModal,
  loadPage,
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

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  projeto: {
    numOc: "#txt_numoc",
    cliente: "#txt_cliente",
    contrato: "#txt_contrato",
    codCc: "#txt_codcc",
    ambiente: "#txt_ambiente",
    numProj: "#txt_numproj",
    lote: "#txt_lote",
    chegouFabrica: "#txt_chegoufabrica",
    dataEntrega: "#txt_dataentrega",
    previsao: "#txt_previsao",
    observacoes: "#txt_observacoes",
  },

  ui: {
    table: "#table",
    btSalvar: "#bt_salvar",
    btFuncionarios: "#bt_funcionarios",
    modalUsuarios: "#modal-1",
    modalUsuariosBody: "#modal-1 tbody",
  },

  modalAcessorios: {
    tbody: () => qa("table tbody")[1],
  },

  etapas: {
    corte: {
      inicio: "#txt_corteinicio",
      fim: "#txt_cortefim",
      pausa: "#chk_corte",
      respId: "#txt_corteid",
      respNome: "#txt_corteresp",
      chkInicio: "#chk_corteinicio",
      chkFim: "#chk_cortefim",
    },
    customizacao: {
      inicio: "#txt_customizacaoinicio",
      fim: "#txt_customizacaofim",
      pausa: "#chk_customizacao",
      respId: "#txt_customizacaoid",
      respNome: "#txt_customizacaoresp",
      chkInicio: "#chk_customizacaoinicio",
      chkFim: "#chk_customizacaofim",
    },
    coladeira: {
      inicio: "#txt_coladeirainicio",
      fim: "#txt_coladeirafim",
      pausa: "#chk_coladeira",
      respId: "#txt_coladeiraid",
      respNome: "#txt_coladeiraresp",
      chkInicio: "#chk_coladeirainicio",
      chkFim: "#chk_coladeirafim",
    },
    usinagem: {
      inicio: "#txt_usinageminicio",
      fim: "#txt_usinagemfim",
      pausa: "#chk_usinagem",
      respId: "#txt_usinagemid",
      respNome: "#txt_usinagemresp",
      chkInicio: "#chk_usinageminicio",
      chkFim: "#chk_usinagemfim",
    },
    montagem: {
      inicio: "#txt_montageminicio",
      fim: "#txt_montagemfim",
      pausa: "#chk_montagem",
      respId: "#txt_montagemid",
      respNome: "#txt_montagemresp",
      chkInicio: "#chk_montageminicio",
      chkFim: "#chk_montagemfim",
    },
    paineis: {
      inicio: "#txt_paineisinicio",
      fim: "#txt_paineisfim",
      pausa: "#chk_paineis",
      respId: "#txt_paineisid",
      respNome: "#txt_paineisresp",
      chkInicio: "#chk_paineisinicio",
      chkFim: "#chk_paineisfim",
    },
    acabamento: {
      inicio: "#txt_acabamentoinicio",
      fim: "#txt_acabamentofim",
      pausa: "#chk_acabamento",
      respId: "#txt_acabamentoid",
      respNome: "#txt_acabamentoresp",
      chkInicio: "#chk_acabamentoinicio",
      chkFim: "#chk_acabamentofim",
    },
    embalagem: {
      inicio: "#txt_embalageminicio",
      fim: "#txt_embalagemfim",
      pausa: "#chk_embalagem",
      respId: "#txt_embalagemid",
      respNome: "#txt_embalagemresp",
      chkInicio: "#chk_embalageminicio",
      chkFim: "#chk_embalagemfim",
    },
  },
};

/* =========================================================
   API LAYER
========================================================= */
const ProducaoAPI = {
  fetchProjects() {
    return API.fetchQuery("/fillTablePrd");
  },

  fetchAcessorios(ordemdecompra) {
    const url = `/fillTableAcessorios?p_ordemdecompra=${ordemdecompra}`;
    return API.fetchQuery(url);
  },

  fetchProducao(ordemdecompra) {
    const url = `/getProducao?p_ordemdecompra=${ordemdecompra}`;
    return API.fetchQuery(url);
  },

  updateProducao(payload) {
    return API.fetchBody("/setDataProducao", "PUT", payload);
  },
};

/* =========================================================
   FIELD ACCESS
========================================================= */
const Fields = {
  get(sel) {
    return Dom.getValue(sel);
  },
  set(sel, value) {
    Dom.setValue(sel, value);
  },
  getChecked(sel) {
    return Dom.getChecked(sel);
  },
  setChecked(sel, value) {
    Dom.setChecked(sel, value);
  },
};

/* =========================================================
   UI MESSAGES
========================================================= */
function showError(message) {
  return Modal.showInfo("error", "ERRO", message);
}

function showWarning(message) {
  return Modal.showInfo("warning", "ATENÇÃO", message);
}

function showSuccess(message) {
  return Modal.showInfo("success", "Sucesso", message);
}

function confirm(message) {
  return Modal.showConfirmation(null, message);
}

/* =========================================================
   TABLE RENDERING (MAIN TABLE)
========================================================= */
function td(value, style, cls) {
  return Dom.createElement("td", value, style, cls);
}

function getMainTbody() {
  return q("tbody");
}

function clearMainTable() {
  const tbody = getMainTbody();
  if (tbody) tbody.innerHTML = "";
  return tbody;
}

function buildProjectRow(item, index) {
  const tCenter = "text-align: center; ";

  const corStatus = Style.colorStatus(item.status);
  const corA = Style.setColorBool(item.total);
  const corPrev = Style.checkPrevisao(item.previsao, item.dataentrega);

  const tr = ce("tr");
  tr.classList.add("open-modal-row", "fw-bold");

  tr.append(td(index, tCenter));
  tr.append(td(item.a, tCenter + corA, "hover-col"));
  tr.append(td(item.ordemdecompra, tCenter));
  tr.append(td(item.pedido, tCenter));
  tr.append(td(item.etapa, tCenter));
  tr.append(td(item.codcc, tCenter));
  tr.append(td(item.cliente));
  tr.append(td(item.contrato, tCenter));
  tr.append(td(item.numproj, tCenter));
  tr.append(td(item.ambiente));
  tr.append(td(item.tipo, tCenter));
  tr.append(td(DateTime.forBr(item.chegoufabrica), tCenter));
  tr.append(td(DateTime.forBr(item.dataentrega), tCenter));
  tr.append(td(item.lote, tCenter));
  tr.append(td(item.status, tCenter + corStatus));
  tr.append(td(DateTime.forBr(item.iniciado), tCenter));
  tr.append(td(DateTime.forBr(item.previsao), tCenter + corPrev));
  tr.append(td(DateTime.forBr(item.pronto), tCenter));
  tr.append(td(DateTime.forBr(item.entrega), tCenter));
  tr.append(td(item.observacoes, "display:none", "info-col"));

  return tr;
}

async function loadAndRenderProjectsTable() {
  try {
    const res = await ProducaoAPI.fetchProjects();

    if (res.status !== 200) {
      throw new Error(`Erro ao buscar os dados ${res.data}`);
    }

    const tbody = clearMainTable();
    if (!tbody) return;

    let num = 1;
    res.data.forEach((item) => tbody.appendChild(buildProjectRow(item, num++)));

    bindTooltipEvents();
  } catch (err) {
    await showError("Não foi possível carregar os dados.");
    console.error("Erro ao preencher tabela:", err);
  }
}

/* =========================================================
   TOOLTIP
========================================================= */
function getTooltipEl() {
  return q("#tooltips");
}

function showToolTip(event) {
  const tooltip = getTooltipEl();
  if (!tooltip) return;

  const text =
    event.target?.parentElement?.querySelector(".info-col")?.textContent ?? "";
  tooltip.textContent = text;
  tooltip.style.display = "block";

  const rect = event.target.getBoundingClientRect();
  tooltip.style.top = rect.top + window.scrollY + rect.height + 5 + "px";
  tooltip.style.left = rect.left + window.scrollX + "px";
}

function hideToolTip() {
  const tooltip = getTooltipEl();
  if (tooltip) tooltip.style.display = "none";
}

function bindTooltipEvents() {
  Dom.addEventBySelector(".hover-col", "mouseover", showToolTip);
  Dom.addEventBySelector(".hover-col", "mouseleave", hideToolTip);
}

/* =========================================================
   ACESSÓRIOS TABLE (MODAL)
========================================================= */
async function loadAndRenderAcessorios(ordemdecompra) {
  const res = await ProducaoAPI.fetchAcessorios(ordemdecompra);

  try {
    const tbody = SELECTORS.modalAcessorios.tbody();
    if (!tbody) return;

    tbody.innerHTML = "";

    const fontSize = "font-size: 9px;";
    const center = "text-align: center;";
    const d = DateTime.forBr;

    res.data.forEach((item) => {
      const tr = ce("tr");
      tr.append(td(item.id, `${fontSize} display:none`));
      tr.append(td(item.descricao, fontSize));
      tr.append(td(item.medida, `${fontSize} ${center}`));
      tr.append(td(item.qtd, fontSize));
      tr.append(td(d(item.datacompra), `${fontSize} ${center}`));
      tr.append(td(d(item.previsao), `${fontSize} ${center}`));
      tr.append(td(d(item.recebido), `${fontSize} ${center}`));
      tbody.appendChild(tr);
    });
  } catch (err) {
    await showError(`ERRO:. ${err.message}`);
  }
}

/* =========================================================
   FORM POPULATION (API -> UI)
========================================================= */
function resetStageConfirmations() {
  Object.values(SELECTORS.etapas).forEach((stage) => {
    Fields.setChecked(stage.chkInicio, false);
    Fields.setChecked(stage.chkFim, false);
  });
}

async function fillProjetoFields(item) {
  Fields.set(SELECTORS.projeto.numOc, item.ordemdecompra);
  Fields.set(SELECTORS.projeto.cliente, item.cliente);
  Fields.set(SELECTORS.projeto.contrato, item.contrato);
  Fields.set(SELECTORS.projeto.codCc, item.codcc);
  Fields.set(SELECTORS.projeto.ambiente, item.ambiente);
  Fields.set(SELECTORS.projeto.numProj, item.numproj);
  Fields.set(SELECTORS.projeto.lote, item.lote);
  Fields.set(
    SELECTORS.projeto.chegouFabrica,
    DateTime.forBr(item.chegoufabrica)
  );
  Fields.set(SELECTORS.projeto.dataEntrega, DateTime.forBr(item.dataentrega));
  Fields.set(SELECTORS.projeto.previsao, item.previsao);
  Fields.set(SELECTORS.projeto.observacoes, item.observacoes);
}

async function fillStage(stageSelectors, item, keys) {
  Fields.set(stageSelectors.inicio, item[keys.inicio]);
  Fields.set(stageSelectors.fim, item[keys.fim]);
  Fields.setChecked(stageSelectors.pausa, item[keys.pausa]);
  Fields.set(stageSelectors.respId, item[keys.respId]);
  Fields.set(stageSelectors.respNome, await getName(stageSelectors.respId));
}

async function populateProducaoForm(data) {
  for (const item of data) {
    await fillProjetoFields(item);

    await fillStage(SELECTORS.etapas.corte, item, {
      inicio: "corteinicio",
      fim: "cortefim",
      pausa: "cortepausa",
      respId: "corteresp",
    });

    await fillStage(SELECTORS.etapas.customizacao, item, {
      inicio: "customizacaoinicio",
      fim: "customizacaofim",
      pausa: "customizacaopausa",
      respId: "customizacaoresp",
    });

    await fillStage(SELECTORS.etapas.coladeira, item, {
      inicio: "coladeirainicio",
      fim: "coladeirafim",
      pausa: "coladeirapausa",
      respId: "coladeiraresp",
    });

    await fillStage(SELECTORS.etapas.usinagem, item, {
      inicio: "usinageminicio",
      fim: "usinagemfim",
      pausa: "usinagempausa",
      respId: "usinagemresp",
    });

    await fillStage(SELECTORS.etapas.montagem, item, {
      inicio: "montageminicio",
      fim: "montagemfim",
      pausa: "montagempausa",
      respId: "montagemresp",
    });

    await fillStage(SELECTORS.etapas.paineis, item, {
      inicio: "paineisinicio",
      fim: "paineisfim",
      pausa: "paineispausa",
      respId: "paineisresp",
    });

    await fillStage(SELECTORS.etapas.acabamento, item, {
      inicio: "acabamentoinicio",
      fim: "acabamentofim",
      pausa: "acabamentopausa",
      respId: "acabamentoresp",
    });

    await fillStage(SELECTORS.etapas.embalagem, item, {
      inicio: "embalageminicio",
      fim: "embalagemfim",
      pausa: "embalagempausa",
      respId: "embalagemresp",
    });

    resetStageConfirmations();
  }

  localStorage.setItem(
    "previsao",
    DateTime.forBr(Fields.get(SELECTORS.projeto.previsao))
  );
}

async function loadProducao(ordemdecompra) {
  try {
    const res = await ProducaoAPI.fetchProducao(ordemdecompra);

    if (res.status !== 200) {
      throw new Error(`Erro ao buscar os dados ${res.data}`);
    }

    await populateProducaoForm(res.data);
  } catch (err) {
    alert(err.message);
  }
}

/* =========================================================
   PAYLOAD (UI -> API)
========================================================= */
function buildStagePayload(stage, prefix) {
  return {
    [`p_${prefix}inicio`]: Fields.get(stage.inicio),
    [`p_${prefix}fim`]: Fields.get(stage.fim),
    [`p_${prefix}resp`]: Fields.get(stage.respId),
    [`p_${prefix}pausa`]: Fields.getChecked(stage.pausa),
  };
}

function buildProducaoPayloadFromForm() {
  return {
    p_ordemdecompra: Fields.get(SELECTORS.projeto.numOc),

    ...buildStagePayload(SELECTORS.etapas.corte, "corte"),
    ...buildStagePayload(SELECTORS.etapas.customizacao, "customizacao"),
    ...buildStagePayload(SELECTORS.etapas.coladeira, "coladeira"),
    ...buildStagePayload(SELECTORS.etapas.usinagem, "usinagem"),
    ...buildStagePayload(SELECTORS.etapas.montagem, "montagem"),
    ...buildStagePayload(SELECTORS.etapas.paineis, "paineis"),
    ...buildStagePayload(SELECTORS.etapas.acabamento, "acabamento"),
    ...buildStagePayload(SELECTORS.etapas.embalagem, "embalagem"),

    p_observacoes: Fields.get(SELECTORS.projeto.observacoes),
    p_previsao: Fields.get(SELECTORS.projeto.previsao),
  };
}

/* =========================================================
   VALIDATION (STEPS)
========================================================= */
function getStepsForValidation(payload) {
  return [
    { etapa: "Corte", start: payload.p_corteinicio, end: payload.p_cortefim },
    {
      etapa: "Customização",
      start: payload.p_customizacaoinicio,
      end: payload.p_customizacaofim,
    },
    {
      etapa: "Coladeira",
      start: payload.p_coladeirainicio,
      end: payload.p_coladeirafim,
    },
    {
      etapa: "Usinagem",
      start: payload.p_usinageminicio,
      end: payload.p_usinagemfim,
    },
    {
      etapa: "Montagem",
      start: payload.p_montageminicio,
      end: payload.p_montagemfim,
    },
    {
      etapa: "Paineis",
      start: payload.p_paineisinicio,
      end: payload.p_paineisfim,
    },
    {
      etapa: "Acabamentos",
      start: payload.p_acabamentoinicio,
      end: payload.p_acabamentofim,
    },
    {
      etapa: "Embalagem",
      start: payload.p_embalageminicio,
      end: payload.p_embalagemfim,
    },
  ];
}

function validateSteps(payload) {
  const steps = getStepsForValidation(payload);

  for (const step of steps) {
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

    if (step.start && DateTime.isDateInFuture(step.start)) {
      return `A data de início da etapa "${step.etapa}" não pode ser maior que a data de hoje.`;
    }

    if (step.end && DateTime.isDateInFuture(step.end)) {
      return `A data de fim da etapa "${step.etapa}" não pode ser maior que a data de hoje.`;
    }
  }

  return null;
}

/* =========================================================
   EMAIL
========================================================= */
async function sendEmailIfPrevisaoChanged() {
  const prevOld = localStorage.getItem("previsao");
  const contrato = Fields.get(SELECTORS.projeto.contrato);
  const cliente = Fields.get(SELECTORS.projeto.cliente);
  const ambiente = Fields.get(SELECTORS.projeto.ambiente);
  const previsao = Numbers.formatCoin(Fields.get(SELECTORS.projeto.previsao));

  if (prevOld === previsao) return;

  const email = await Service.getConfig(1);
  const title = `*** ${contrato} - ${cliente} - ${ambiente} - PREV: ${previsao} ***`;

  await Email.send({
    destination: email[0].p_email,
    title,
    body: "Previsão Alterada",
  });
}

/* =========================================================
   FLOWS / HANDLERS
========================================================= */
async function handleTableDblClick(event) {
  const tdEl = event.target;
  const tr = tdEl.closest(".open-modal-row");
  if (!tr || tdEl.tagName !== "TD") return;

  const oc = Table.getIndexColumnValue(tdEl, 2);
  const codcc = Table.getIndexColumnValue(tdEl, 5);

  if (codcc !== "-") {
    await loadProducao(oc);
    await loadAndRenderAcessorios(oc);
    Modal.show("modal");
  } else {
    await showWarning("Projeto não Calculado");
  }
}

async function saveProducaoFlow() {
  const payload = buildProducaoPayloadFromForm();
  const error = validateSteps(payload);

  if (error) {
    await showWarning(error);
    return;
  }

  const result = await confirm("Deseja confirmar Alterações?");
  if (!result.isConfirmed) return;

  try {
    const res = await ProducaoAPI.updateProducao(payload);

    if (res.status !== 200) {
      await showError("Ocorreu um erro ao salvar os dados!");
      return;
    }

    await showSuccess("Alterações confirmadas com sucesso!");
    await sendEmailIfPrevisaoChanged();
  } catch (err) {
    await showError("Falha na comunicação com o servidor!" + err.message);
  }
}

/* =========================================================
   USERS MODAL
========================================================= */
function openUsuariosModalFromHtml() {
  const html = q(SELECTORS.ui.modalUsuarios)?.innerHTML ?? "";
  Modal.showInfo(null, null, html);
}

async function loadUsuariosTable() {
  const data = await Service.getOperadores();
  const tbody = q(SELECTORS.ui.modalUsuariosBody);
  if (!tbody) return;

  tbody.innerHTML = "";
  data.forEach((u) => {
    const tr = ce("tr");
    tr.innerHTML = `<td>${u.p_id}</td><td>${u.p_nome}</td>`;
    tbody.appendChild(tr);
  });
}

function listElementsUsers() {
  const E = SELECTORS.etapas;
  return [
    [E.corte.respId, E.corte.respNome],
    [E.customizacao.respId, E.customizacao.respNome],
    [E.coladeira.respId, E.coladeira.respNome],
    [E.usinagem.respId, E.usinagem.respNome],
    [E.montagem.respId, E.montagem.respNome],
    [E.paineis.respId, E.paineis.respNome],
    [E.acabamento.respId, E.acabamento.respNome],
    [E.embalagem.respId, E.embalagem.respNome],
  ];
}

/* =========================================================
   DATE CHECKBOX WIRING
========================================================= */
function bindStageDateConfirmations() {
  const operations = Object.keys(SELECTORS.etapas);

  operations.forEach((op) => {
    Dom.addEventBySelector(`#chk_${op}inicio`, "click", () =>
      confirmDateInsertion(`#chk_${op}inicio`, `#txt_${op}inicio`)
    );

    Dom.addEventBySelector(`#chk_${op}fim`, "click", () =>
      confirmDateInsertion(`#chk_${op}fim`, `#txt_${op}fim`)
    );
  });
}

/* =========================================================
   INIT
========================================================= */
function configureUiDefaults() {
  loadPage("producao", "producao.html");
  enableTableFilterSort(SELECTORS.ui.table.slice(1));
  ajustarTamanhoModal();

  Table.onmouseover(SELECTORS.ui.table);
  Dom.enableEnterAsTab();
  Dom.rowClick(SELECTORS.ui.table);
}

function bindEvents() {
  Dom.addEventBySelector(SELECTORS.ui.btSalvar, "click", saveProducaoFlow);
  Dom.addEventBySelector(SELECTORS.ui.table, "dblclick", handleTableDblClick);
  Dom.addEventBySelector(
    SELECTORS.ui.btFuncionarios,
    "click",
    openUsuariosModalFromHtml
  );

  window.addEventListener("resize", ajustarTamanhoModal);
  document.addEventListener("resize", ajustarTamanhoModal);
}

async function init() {
  configureUiDefaults();

  await loadAndRenderProjectsTable();
  await loadUsuariosTable();

  bindStageDateConfirmations();
  handleElementsUser(listElementsUsers());

  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);
