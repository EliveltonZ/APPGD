import Swal from "./sweetalert2.esm.all.min.js";
import {
  ajustarTamanhoModal,
  loadPage,
  getName,
  confirmDateInsertion,
  handleElementsUser,
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";
import { Dom, Style, Table, q, ce } from "./UI/interface.js";
import { API, Service } from "./service/api.js";
import { DateTime } from "./utils/time.js";
import { Modal } from "./utils/modal.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  project: {
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

  production: {
    pronto: "#txt_pronto",
    prontoId: "#txt_prontoid",
    prontoResp: "#txt_prontoresp",
    chkPronto: "#chk_pronto",

    entrega: "#txt_entrega",
    entregaId: "#txt_entregaid",
    entregaResp: "#txt_entregaresp",
    chkEntrega: "#chk_entrega",

    chkSeparacao: "#chk_separacao",
    separacao: "#txt_separacao",

    chkPendencia: "#chk_pendencia",
    chkParcial: "#chk_parcial",
    chkEtapas: "#chk_etapas",
    etapas: "#txt_etapas",

    tableAcessorios: "#table_acessorios",
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

  itensEspeciais: {
    avulsos: {
      chk: "#chk_acessoriosavulsos",
      q: "#txt_acessoriosavulsosq",
      l: "#txt_acessoriosavulsosl",
    },
    paineis: { chk: "#chk_paineis", q: "#txt_paineisq", l: "#txt_paineisl" },
    portaAluminio: {
      chk: "#chk_portaaluminio",
      q: "#txt_portaaluminioq",
      l: "#txt_portaaluminiol",
    },
    vidroEspelho: {
      chk: "#chk_vidroespelho",
      q: "#txt_vidroespelhoq",
      l: "#txt_vidroespelhol",
    },
    pecaPintura: {
      chk: "#chk_pecapintura",
      q: "#txt_pecapinturaq",
      l: "#txt_pecapintural",
    },
    tapecaria: {
      chk: "#chk_tapecaria",
      q: "#txt_tapecariaq",
      l: "#txt_tapecarial",
    },
    serralheria: {
      chk: "#chk_serralheria",
      q: "#txt_serralheriaq",
      l: "#txt_serralherial",
    },
    cabide: { chk: "#chk_cabide", q: "#txt_cabideq", l: "#txt_cabidel" },
    trilhos: { chk: "#chk_trilhos", q: "#txt_trilhosq", l: "#txt_trilhosl" },
    volumesModulacao: {
      chk: "#chk_volumesmodulacao",
      q: "#txt_volumesmodulacaoq",
      l: "#txt_volumesmodulacaol",
    },
    volMod: "#txt_volmod",
    tamanho: "#txt_tamanho",
  },

  ui: {
    dataFiltro: "#txt_datafilter",
    btFuncionarios: "#bt_funcionarios",
    btSalvar: "#bt_salvar",
    table: "#table",
    modalUsuarios: "#modal-1",
    modalUsuariosBody: "#modal-1 tbody",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const ExpedicaoAPI = {
  fetchAcessoriosByOc(orderNumber) {
    const url = `/fillTableAcessorios?p_ordemdecompra=${orderNumber}`;
    return API.fetchQuery(url);
  },

  fetchProjects(dateCondition) {
    const url = `/fillTableExp?data_condition=${dateCondition}`;
    return API.fetchQuery(url);
  },

  fetchExpedicao(orderNumber) {
    const url = `/getExpedicao?p_ordemdecompra=${orderNumber}`;
    return API.fetchQuery(url);
  },

  updateExpedicao(payload) {
    return API.fetchBody("/setDataExpedicao", "PUT", payload);
  },

  fetchOperadores() {
    return API.fetchQuery("/getOperadores");
  },

  fetchConfig(id) {
    return Service.getConfig(id);
  },

  saveConfig(payload) {
    return Service.setConfig(payload);
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
  setHtml(sel, html) {
    Dom.setInnerHtml(sel, html);
  },
  getChecked(sel) {
    return Dom.getChecked(sel);
  },
  setChecked(sel, val) {
    Dom.setChecked(sel, val);
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
   TABLE RENDERING
========================================================= */
function td(value, style) {
  return Dom.createElement("td", value, style);
}

function getMainTableBody() {
  return q("tbody");
}

function clearMainTable() {
  const tbody = getMainTableBody();
  if (tbody) tbody.innerHTML = "";
  return tbody;
}

function buildProjectRow(item, index) {
  const tCenter = "text-align: center; ";
  const cor_status = Style.colorStatus(item.status);
  const corA = Style.setColorBool(item.total);

  const tr = ce("tr");
  tr.classList.add("open-modal-row", "fw-bold");

  tr.append(td(index, tCenter));
  tr.append(td(item.a, corA));
  tr.append(td(item.ordemdecompra, tCenter));
  tr.append(td(item.pedido, tCenter));
  tr.append(td(item.etapa, tCenter));
  tr.append(td(item.codcc, tCenter));
  tr.append(td(item.cliente));
  tr.append(td(item.contrato, tCenter));
  tr.append(td(item.numproj, tCenter));
  tr.append(td(item.ambiente));
  tr.append(td(item.tipo, tCenter));
  tr.append(td(DateTime.forBr(item.dataentrega), tCenter));
  tr.append(td(DateTime.forBr(item.chegoufabrica), tCenter));
  tr.append(td(item.lote, tCenter));
  tr.append(td(item.status, tCenter + cor_status));
  tr.append(td(DateTime.forBr(item.iniciado), tCenter));
  tr.append(td(DateTime.forBr(item.pronto), tCenter));
  tr.append(td(DateTime.forBr(item.entrega), tCenter));

  return tr;
}

async function renderProjectsTable(dateCondition) {
  const container = q("#container");
  const scrollPos = container?.scrollTop ?? 0;

  const res = await ExpedicaoAPI.fetchProjects(dateCondition);

  if (res.status !== 200) {
    await showError("Não foi possivel carregar os dados");
    return;
  }

  const tbody = clearMainTable();
  if (!tbody) return;

  let num = 1;
  res.data.forEach((item) => tbody.appendChild(buildProjectRow(item, num++)));

  if (container) container.scrollTop = scrollPos;
}

/* =========================================================
   ACESSÓRIOS MODAL TABLE
========================================================= */
function getAccessoriesModalBody() {
  return q("#modal tbody");
}

function clearAccessoriesModalTable() {
  const tbody = getAccessoriesModalBody();
  if (tbody) tbody.innerHTML = "";
  return tbody;
}

function buildAccessoryModalRow(item) {
  const tCenter = "text-align: center; ";
  const font9 = "font-size: 9px; ";

  const tr = ce("tr");
  tr.append(td(item.id, tCenter + "display:none;"));
  tr.append(td(item.descricao, tCenter + font9));
  tr.append(td(item.medida, tCenter + font9));
  tr.append(td(item.qtd, tCenter + font9));
  tr.append(td(DateTime.forBr(item.datacompra), tCenter + font9));
  tr.append(td(DateTime.forBr(item.previsao), tCenter + font9));
  tr.append(td(DateTime.forBr(item.recebido), tCenter + font9));
  return tr;
}

async function loadAndRenderAccessoriesModal(ordemdecompra) {
  const res = await ExpedicaoAPI.fetchAcessoriosByOc(ordemdecompra);

  if (res.status !== 200) {
    await showError(`ERRO: ${res.data}`);
    return;
  }

  const tbody = clearAccessoriesModalTable();
  if (!tbody) return;

  res.data.forEach((item) => tbody.appendChild(buildAccessoryModalRow(item)));
}

/* =========================================================
   FORM POPULATION (API -> UI)
========================================================= */
async function setEtapaLabel(value, selector) {
  const el = q(selector);
  if (!el) return;

  if (value) {
    el.style.color = "green";
    Fields.setHtml(selector, "CONCLUIDO");
    return;
  }

  el.style.color = "red";
  Fields.setHtml(selector, "EM ABERTO");
}

async function populateExpedicaoForm(item) {
  Fields.set(SELECTORS.project.numOc, item.ordemdecompra);
  Fields.set(SELECTORS.project.cliente, item.cliente);
  Fields.set(SELECTORS.project.contrato, item.contrato);
  Fields.set(SELECTORS.project.codCc, item.codcc);
  Fields.set(SELECTORS.project.ambiente, item.ambiente);
  Fields.set(SELECTORS.project.numProj, item.numproj);
  Fields.set(SELECTORS.project.lote, item.lote);

  Fields.set(
    SELECTORS.project.chegouFabrica,
    DateTime.forBr(item.chegoufabrica)
  );
  Fields.set(SELECTORS.project.dataEntrega, DateTime.forBr(item.dataentrega));

  Fields.set(SELECTORS.production.pronto, item.pronto);
  Fields.set(SELECTORS.production.entrega, item.entrega);

  Fields.setChecked(SELECTORS.production.chkPendencia, item.pendencia);
  Fields.setChecked(SELECTORS.production.chkParcial, item.parcial);

  Fields.set(SELECTORS.production.separacao, item.separacao);

  Fields.set(SELECTORS.production.prontoId, item.conferido);
  Fields.set(
    SELECTORS.production.prontoResp,
    await getName(SELECTORS.production.prontoId)
  );

  Fields.set(SELECTORS.production.entregaId, item.motorista);
  Fields.set(
    SELECTORS.production.entregaResp,
    await getName(SELECTORS.production.entregaId)
  );

  Fields.set(SELECTORS.embalagem.inicio, item.embalageminicio);
  Fields.set(SELECTORS.embalagem.fim, item.embalagemfim);
  Fields.setChecked(SELECTORS.embalagem.pausa, item.embalagempausa);

  Fields.set(SELECTORS.embalagem.respId, item.embalagemresp);
  Fields.set(
    SELECTORS.embalagem.respNome,
    await getName(SELECTORS.embalagem.respId)
  );

  const S = SELECTORS.itensEspeciais;

  Fields.setChecked(S.avulsos.chk, item.avulso);
  Fields.set(S.avulsos.l, item.avulsol);
  Fields.set(S.avulsos.q, item.avulsoq);

  Fields.setChecked(S.cabide.chk, item.cabide);
  Fields.set(S.cabide.l, item.cabidel);
  Fields.set(S.cabide.q, item.cabideq);

  Fields.setChecked(S.paineis.chk, item.paineis);
  Fields.set(S.paineis.l, item.paineisl);
  Fields.set(S.paineis.q, item.paineisq);

  Fields.setChecked(S.pecaPintura.chk, item.pecaspintadas);
  Fields.set(S.pecaPintura.l, item.pecaspintadasl);
  Fields.set(S.pecaPintura.q, item.pecaspintadasq);

  Fields.setChecked(S.portaAluminio.chk, item.portaaluminio);
  Fields.set(S.portaAluminio.l, item.portaaluminiol);
  Fields.set(S.portaAluminio.q, item.portaaluminioq);

  Fields.setChecked(S.serralheria.chk, item.serralheria);
  Fields.set(S.serralheria.l, item.serralherial);
  Fields.set(S.serralheria.q, item.serralheriaq);

  Fields.setChecked(S.tapecaria.chk, item.tapecaria);
  Fields.set(S.tapecaria.l, item.tapecarial);
  Fields.set(S.tapecaria.q, item.tapecariaq);

  Fields.setChecked(S.trilhos.chk, item.trilho);
  Fields.set(S.trilhos.l, item.trilhol);
  Fields.set(S.trilhos.q, item.trilhoq);

  Fields.setChecked(S.vidroEspelho.chk, item.vidros);
  Fields.set(S.vidroEspelho.l, item.vidrosl);
  Fields.set(S.vidroEspelho.q, item.vidrosq);

  Fields.setChecked(S.volumesModulacao.chk, item.volmod);
  Fields.set(S.volumesModulacao.l, item.modulosl);
  Fields.set(S.volumesModulacao.q, item.modulosq);

  Fields.set(S.volMod, item.totalvolumes);
  Fields.set(S.tamanho, item.tamanho);

  Fields.set(SELECTORS.project.observacoes, item.observacoes);

  // resets de confirmação
  Fields.setChecked(SELECTORS.embalagem.chkInicio, false);
  Fields.setChecked(SELECTORS.embalagem.chkFim, false);

  Fields.setChecked(SELECTORS.production.chkEtapas, item.etapa);
  await setEtapaLabel(item.etapa, SELECTORS.production.etapas);
}

async function populateExpedicaoFromResponse(data) {
  for (const item of data) {
    await populateExpedicaoForm(item);
  }
}

/* =========================================================
   PAYLOAD (UI -> API)
========================================================= */
function buildExpedicaoPayloadFromForm() {
  const S = SELECTORS.itensEspeciais;

  return {
    p_ordemdecompra: Fields.get(SELECTORS.project.numOc),
    p_pronto: Fields.get(SELECTORS.production.pronto),
    p_entrega: Fields.get(SELECTORS.production.entrega),
    p_pendencia: Fields.getChecked(SELECTORS.production.chkPendencia),
    p_parcial: Fields.getChecked(SELECTORS.production.chkParcial),
    p_separacao: Fields.get(SELECTORS.production.separacao),
    p_conferido: Fields.get(SELECTORS.production.prontoId),
    p_motorista: Fields.get(SELECTORS.production.entregaId),
    p_embalageminicio: Fields.get(SELECTORS.embalagem.inicio),
    p_embalagemfim: Fields.get(SELECTORS.embalagem.fim),
    p_embalagempausa: Fields.getChecked(SELECTORS.embalagem.pausa),
    p_embalagemresp: Fields.get(SELECTORS.embalagem.respId),

    p_avulso: Fields.getChecked(S.avulsos.chk),
    p_avulsol: Fields.get(S.avulsos.l),
    p_avulsoq: Fields.get(S.avulsos.q),

    p_cabide: Fields.getChecked(S.cabide.chk),
    p_cabidel: Fields.get(S.cabide.l),
    p_cabideq: Fields.get(S.cabide.q),

    p_paineis: Fields.getChecked(S.paineis.chk),
    p_paineisl: Fields.get(S.paineis.l),
    p_paineisq: Fields.get(S.paineis.q),

    p_pecaspintadas: Fields.getChecked(S.pecaPintura.chk),
    p_pecaspintadasl: Fields.get(S.pecaPintura.l),
    p_pecaspintadasq: Fields.get(S.pecaPintura.q),

    p_portaaluminio: Fields.getChecked(S.portaAluminio.chk),
    p_portaaluminiol: Fields.get(S.portaAluminio.l),
    p_portaaluminioq: Fields.get(S.portaAluminio.q),

    p_serralheria: Fields.getChecked(S.serralheria.chk),
    p_serralherial: Fields.get(S.serralheria.l),
    p_serralheriaq: Fields.get(S.serralheria.q),

    p_tapecaria: Fields.getChecked(S.tapecaria.chk),
    p_tapecarial: Fields.get(S.tapecaria.l),
    p_tapecariaq: Fields.get(S.tapecaria.q),

    p_trilho: Fields.getChecked(S.trilhos.chk),
    p_trilhol: Fields.get(S.trilhos.l),
    p_trilhoq: Fields.get(S.trilhos.q),

    p_vidros: Fields.getChecked(S.vidroEspelho.chk),
    p_vidrosl: Fields.get(S.vidroEspelho.l),
    p_vidrosq: Fields.get(S.vidroEspelho.q),

    p_volmod: Fields.getChecked(S.volumesModulacao.chk),
    p_modulosl: Fields.get(S.volumesModulacao.l),
    p_modulosq: Fields.get(S.volumesModulacao.q),

    p_totalvolumes: Fields.get(S.volMod),
    p_tamanho: Fields.get(S.tamanho),
    p_observacoes: Fields.get(SELECTORS.project.observacoes),
  };
}

/* =========================================================
   DOMAIN RULES
========================================================= */
function hasOpenStepsAndDatesFilled() {
  const etapasConcluidas = Fields.getChecked(SELECTORS.production.chkEtapas);
  const pronto = Fields.get(SELECTORS.production.pronto);
  const entrega = Fields.get(SELECTORS.production.entrega);

  if (etapasConcluidas) return false;
  return !!(pronto || entrega);
}

/* =========================================================
   FLOWS / HANDLERS
========================================================= */
async function loadExpedicao(ordemdecompra) {
  const res = await ExpedicaoAPI.fetchExpedicao(ordemdecompra);

  if (res.status !== 200) {
    await showError(`${res.data}`);
    return;
  }

  await populateExpedicaoFromResponse(res.data);
}

async function handleTableDoubleClick(event) {
  Dom.clearInputFields([SELECTORS.ui.dataFiltro.slice(1)]);

  const tdEl = event.target;
  const tr = tdEl.closest(".open-modal-row");
  if (!tr || tdEl.tagName !== "TD") return;

  const oc = Table.getIndexColumnValue(tdEl, 2);
  const codcc = Table.getIndexColumnValue(tdEl, 5);

  if (codcc !== "-") {
    await loadExpedicao(oc);
    await loadAndRenderAccessoriesModal(oc);
    Modal.show("modal");
    return;
  }

  await showWarning("Projeto não Calculado");
}

async function saveExpedicaoFlow() {
  const result = await confirm("Confirmar Alterações ?");
  if (!result.isConfirmed) return;

  try {
    if (hasOpenStepsAndDatesFilled()) {
      await showWarning("Projeto com etapas em ABERTO");
      return;
    }

    const payload = buildExpedicaoPayloadFromForm();
    const res = await ExpedicaoAPI.updateExpedicao(payload);

    if (res.status !== 200) {
      await showError(`Ocorreu um erro ao salvar os dados! ${res.data}`);
      return;
    }

    const filter = Fields.get(SELECTORS.ui.dataFiltro);
    await renderProjectsTable(filter);
    await showSuccess("Alterações feitas com sucesso!");
  } catch (err) {
    await showError(`ERRO: ${err.message}`);
  }
}

async function loadFilterFromConfig() {
  const data = await ExpedicaoAPI.fetchConfig(1);
  Fields.set(SELECTORS.ui.dataFiltro, data?.[0]?.p_data ?? "");
}

async function saveFilterToConfig() {
  const payload = { p_id: 1, p_date: Fields.get(SELECTORS.ui.dataFiltro) };
  await ExpedicaoAPI.saveConfig(payload);
}

async function handleFilterBlur() {
  const filter = Fields.get(SELECTORS.ui.dataFiltro);
  await renderProjectsTable(filter);
  await saveFilterToConfig();
}

/* =========================================================
   USERS MODAL
========================================================= */
async function loadOperadoresTable() {
  const res = await ExpedicaoAPI.fetchOperadores();
  if (res.status !== 200) return;

  const tbody = q(SELECTORS.ui.modalUsuariosBody);
  if (!tbody) return;

  tbody.innerHTML = "";
  res.data.forEach((op) => {
    const tr = ce("tr");
    tr.append(Dom.createElement("td", op.p_id));
    tr.append(Dom.createElement("td", op.p_nome));
    tbody.appendChild(tr);
  });
}

function openUsuariosModalFromHtml() {
  const html = q(SELECTORS.ui.modalUsuarios)?.innerHTML ?? "";
  Modal.showInfo(null, null, html);
}

function listElementsUsers() {
  return [
    [SELECTORS.production.prontoId, SELECTORS.production.prontoResp],
    [SELECTORS.production.entregaId, SELECTORS.production.entregaResp],
    [SELECTORS.embalagem.respId, SELECTORS.embalagem.respNome],
  ];
}

/* =========================================================
   DATE CHECKBOX WIRING
========================================================= */
function bindDateCheckboxes() {
  // mantendo o padrão original, mas isolando a “lista de operações”
  const operations = ["embalagem"];

  operations.forEach((item) => {
    Dom.addEventBySelector(`#chk_${item}inicio`, "click", () =>
      confirmDateInsertion(`#chk_${item}inicio`, `txt_${item}inicio`)
    );

    Dom.addEventBySelector(`#chk_${item}fim`, "click", () =>
      confirmDateInsertion(`#chk_${item}fim`, `txt_${item}fim`)
    );
  });
}

/* =========================================================
   INIT
========================================================= */
function configureUiDefaults() {
  loadPage("expedicao", "expedicao.html");
  Table.onclickHighlightRow(SELECTORS.ui.table);
  Table.onmouseover(SELECTORS.ui.table);
  Dom.enableEnterAsTab();
}

function bindEvents() {
  Dom.addEventBySelector(
    SELECTORS.ui.table,
    "dblclick",
    handleTableDoubleClick
  );

  Dom.addEventBySelector(SELECTORS.ui.dataFiltro, "blur", handleFilterBlur);
  Dom.addEventBySelector(SELECTORS.ui.btSalvar, "click", saveExpedicaoFlow);

  Dom.addEventBySelector(SELECTORS.production.chkPronto, "click", () =>
    setDate(SELECTORS.production.chkPronto, SELECTORS.production.pronto)
  );

  Dom.addEventBySelector(SELECTORS.production.chkSeparacao, "click", () =>
    confirmDateInsertion(
      SELECTORS.production.chkSeparacao,
      SELECTORS.production.separacao
    )
  );

  Dom.addEventBySelector(
    SELECTORS.ui.btFuncionarios,
    "click",
    openUsuariosModalFromHtml
  );
}

async function init() {
  configureUiDefaults();

  await loadFilterFromConfig();
  await renderProjectsTable(Fields.get(SELECTORS.ui.dataFiltro));

  enableTableFilterSort(SELECTORS.ui.table.slice(1));

  await loadOperadoresTable();
  handleElementsUser(listElementsUsers());
  bindDateCheckboxes();

  window.addEventListener("resize", ajustarTamanhoModal);
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);
