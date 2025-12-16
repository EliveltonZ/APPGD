import { loadPage } from "./utils.js";
import { Dom, q } from "./UI/interface.js";
import { API } from "./service/api.js";
import { Numbers } from "./utils/number.js";
import { Modal } from "./utils/modal.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  inputs: {
    oc: "#txt_numoc",
    ambiente: "#txt_ambiente",
    contrato: "#txt_contrato",
    cliente: "#txt_cliente",
    vendedor: "#txt_vendedor",
    liberador: "#txt_liberador",
    dataContrato: "#txt_datacontrato",
    dataAssinatura: "#txt_dataassinatura",
    dataEntrega: "#txt_dataentrega",
    chegouFabrica: "#txt_chegoufabrica",
    loja: "#txt_loja",
    tipoCliente: "#txt_tipocliente",
    etapa: "#txt_etapa",
    tipoAmbiente: "#txt_tipoambiente",
    numProj: "#txt_numproj",
    tipoContrato: "#txt_tipocontrato",
    valorBruto: "#txt_valorbruto",
    valorNegociado: "#txt_valornegociado",
    custoMaterial: "#txt_customaterial",
    custoAdicional: "#txt_custoadicional",
  },
  buttons: {
    salvar: "#bt_salvar",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const ProjectsDeleteAPI = {
  fetchProjectByOrder(orderNumber) {
    const url = `/getDeleteProjetos?p_ordemdecompra=${orderNumber}`;
    return API.fetchQuery(url);
  },
  deleteProject(payload) {
    return API.fetchBody("/setDeleteProjeto", "DELETE", payload);
  },
};

/* =========================================================
   FIELD ACCESS
========================================================= */
const Fields = {
  get(selector) {
    return Dom.getValue(selector);
  },
  set(selector, value) {
    Dom.setValue(selector, value);
  },
  focus(selector) {
    Dom.setFocus(selector);
  },
};

/* =========================================================
   UI MESSAGES
========================================================= */
function showError(message) {
  return Modal.showInfo("error", "Erro", message);
}

function showSuccess(message) {
  return Modal.showInfo("success", "Sucesso", message);
}

function confirmDelete() {
  // mantendo o mesmo padrão do seu código original (Modal.ShowQuestion)
  return Modal.ShowQuestion(null, "Deseja excluir Projeto ?");
}

/* =========================================================
   VALIDATORS
========================================================= */
function isFormValid() {
  const form = q("form");
  return !!form?.checkValidity?.() && form.checkValidity();
}

function parseOrderNumber() {
  const raw = Fields.get(SELECTORS.inputs.oc);
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}

function isValidOrderNumber(n) {
  return Number.isInteger(n) && n > 0;
}

/* =========================================================
   MAPPERS (API -> UI) and (UI -> API)
========================================================= */
function currency(value) {
  return Numbers.currency(value);
}

function mapProjectToFormFields(item) {
  return [
    [SELECTORS.inputs.contrato, item.contrato],
    [SELECTORS.inputs.cliente, item.cliente],
    [SELECTORS.inputs.tipoAmbiente, item.tipoambiente],
    [SELECTORS.inputs.ambiente, item.ambiente],
    [SELECTORS.inputs.numProj, item.numproj],
    [SELECTORS.inputs.vendedor, item.vendedor],
    [SELECTORS.inputs.liberador, item.liberador],
    [SELECTORS.inputs.dataContrato, item.datacontrato],
    [SELECTORS.inputs.dataAssinatura, item.dataassinatura],
    [SELECTORS.inputs.chegouFabrica, item.chegoufabrica],
    [SELECTORS.inputs.dataEntrega, item.dataentrega],
    [SELECTORS.inputs.loja, item.loja],
    [SELECTORS.inputs.tipoCliente, item.tipocliente],
    [SELECTORS.inputs.etapa, item.etapa],
    [SELECTORS.inputs.tipoContrato, item.tipocontrato],
    [SELECTORS.inputs.valorBruto, currency(item.valorbruto)],
    [SELECTORS.inputs.valorNegociado, currency(item.valornegociado)],
    [SELECTORS.inputs.custoMaterial, currency(item.customaterial)],
    [SELECTORS.inputs.custoAdicional, currency(item.customaterialadicional)],
  ];
}

function applyFields(pairs) {
  pairs.forEach(([selector, value]) => Fields.set(selector, value));
}

function buildDeletePayload() {
  return { p_ordemdecompra: Fields.get(SELECTORS.inputs.oc) };
}

/* =========================================================
   USE CASES / HANDLERS
========================================================= */
async function loadProjectForDeletion() {
  const orderNumber = parseOrderNumber();

  if (!isValidOrderNumber(orderNumber)) {
    // silencioso como o original, mas pode mostrar msg se quiser
    return;
  }

  try {
    const res = await ProjectsDeleteAPI.fetchProjectByOrder(orderNumber);

    if (res.status !== 200) {
      await showError(`${res.data}`);
      return;
    }

    const item = res?.data?.[0];
    if (!item) {
      await showError("Ordem de Compra Invalida");
      Fields.focus(SELECTORS.inputs.oc);
      return;
    }

    applyFields(mapProjectToFormFields(item));
  } catch (err) {
    await showError(`Erro ao buscar projeto: ${err?.message || err}`);
  }
}

async function handleSaveClick(e) {
  if (!isFormValid()) return;

  e.preventDefault();
  await deleteProjectFlow();
}

async function deleteProjectFlow() {
  const result = await confirmDelete();
  if (!result.isConfirmed) return;

  try {
    const payload = buildDeletePayload();
    const response = await ProjectsDeleteAPI.deleteProject(payload);

    if (response.status !== 200) {
      await showError(`ERRO: ${response.data}`);
      return;
    }

    await showSuccess("Excluido com Sucesso !!!");
    document.location.href = "/excluir.html";
  } catch (err) {
    await showError(`Erro ao excluir: ${err?.message || err}`);
  }
}

/* =========================================================
   PAGE SETUP (INIT)
========================================================= */
function loadView() {
  loadPage("adicionar_projetos", "excluir.html");
}

function configureUiDefaults() {
  Fields.focus(SELECTORS.inputs.oc);
  Dom.enableEnterAsTab();
}

function bindEvents() {
  Dom.addEventBySelector(SELECTORS.inputs.oc, "change", loadProjectForDeletion);
  Dom.addEventBySelector(SELECTORS.buttons.salvar, "click", handleSaveClick);
}

function initDeleteProjectPage() {
  loadView();
  configureUiDefaults();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", initDeleteProjectPage);
