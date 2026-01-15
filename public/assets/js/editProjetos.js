import { getGroupedData, loadPage } from "./utils.js";
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
  datalists: {
    vendedores: "#vendedores",
    liberadores: "#liberadores",
  },
  masks: {
    moeda: ".moeda",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const ProjectsEditAPI = {
  fetchProjectForEdit: async function (orderNumber) {
    const url = `/getEditProjetos?p_ordemdecompra=${orderNumber}`;
    return await API.fetchQuery(url);
  },
  updateProject: async function (payload) {
    return await API.fetchBody("/setEditProjetos", "PUT", payload);
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
  clear(selectors) {
    // se você quiser manter o comportamento antigo que limpa tudo:
    if (!selectors) return Dom.clearInputFields();
    Dom.clearInputFields(selectors);
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

function confirmSaveEdits() {
  return Modal.showConfirmation(null, "Deseja salvar edições ?");
}

/* =========================================================
   VALIDATORS
========================================================= */
function isFormValid() {
  const form = q("form") || document.querySelector("form");
  return !!form?.checkValidity?.() && form.checkValidity();
}

function getOrderNumber() {
  return Fields.get(SELECTORS.inputs.oc);
}

function hasOrderNumber(value) {
  return !!String(value || "").trim();
}

/* =========================================================
   FORMATTERS / INPUT MASKS
========================================================= */
function formatCurrency(value) {
  return Numbers.currencyParse(value);
}

function formatDecimalForApi(value) {
  return Numbers.decimal(value);
}

function handleCurrencyInput(e) {
  const el = e.target;
  el.value = Numbers.currency ? Numbers.currency(el.value) : el.value;
}

/* =========================================================
   MAPPERS (API -> UI) and (UI -> API)
========================================================= */
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
    [SELECTORS.inputs.valorBruto, formatCurrency(item.valorbruto)],
    [SELECTORS.inputs.valorNegociado, formatCurrency(item.valornegociado)],
    [SELECTORS.inputs.custoMaterial, formatCurrency(item.customaterial)],
    [
      SELECTORS.inputs.custoAdicional,
      formatCurrency(item.customaterialadicional),
    ],
  ];
}

function applyFields(pairs) {
  pairs.forEach(([selector, value]) => Fields.set(selector, value));
}

function buildEditPayloadFromForm() {
  return {
    p_ordemdecompra: Fields.get(SELECTORS.inputs.oc),
    p_contrato: Fields.get(SELECTORS.inputs.contrato),
    p_cliente: Fields.get(SELECTORS.inputs.cliente),
    p_tipoambiente: Fields.get(SELECTORS.inputs.tipoAmbiente),
    p_ambiente: Fields.get(SELECTORS.inputs.ambiente),
    p_numproj: Fields.get(SELECTORS.inputs.numProj),
    p_vendedor: Fields.get(SELECTORS.inputs.vendedor),
    p_liberador: Fields.get(SELECTORS.inputs.liberador),
    p_datacontrato: Fields.get(SELECTORS.inputs.dataContrato),
    p_dataassinatura: Fields.get(SELECTORS.inputs.dataAssinatura),
    p_chegoufabrica: Fields.get(SELECTORS.inputs.chegouFabrica),
    p_dataentrega: Fields.get(SELECTORS.inputs.dataEntrega),
    p_loja: Fields.get(SELECTORS.inputs.loja),
    p_tipocliente: Fields.get(SELECTORS.inputs.tipoCliente),
    p_etapa: Fields.get(SELECTORS.inputs.etapa),
    p_tipocontrato: Fields.get(SELECTORS.inputs.tipoContrato),
    p_valorbruto: formatDecimalForApi(Fields.get(SELECTORS.inputs.valorBruto)),
    p_valornegociado: formatDecimalForApi(
      Fields.get(SELECTORS.inputs.valorNegociado)
    ),
    p_customaterial: formatDecimalForApi(
      Fields.get(SELECTORS.inputs.custoMaterial)
    ),
    p_customaterialadicional: formatDecimalForApi(
      Fields.get(SELECTORS.inputs.custoAdicional)
    ),
  };
}

/* =========================================================
   USE CASES / HANDLERS
========================================================= */
async function loadProjectForEdit() {
  const oc = getOrderNumber();
  if (!hasOrderNumber(oc)) return;

  try {
    const res = await ProjectsEditAPI.fetchProjectForEdit(oc);

    if (res.status !== 200) {
      await showError("Digite a ordem de compra");
      return;
    }

    const item = res?.data?.[0];
    if (!item) {
      await showError("Ordem de Compra Invalida");
      Fields.clear(); // mantém o comportamento antigo de limpar tudo
      return;
    }
    applyFields(mapProjectToFormFields(item));
  } catch (err) {
    await showError(`Erro ao carregar projeto: ${err?.message || err}`);
  }
}

async function handleSaveClick(e) {
  if (!isFormValid()) return;

  e.preventDefault();
  await saveEditsFlow();
}

async function saveEditsFlow() {
  const result = await confirmSaveEdits();
  if (!result.isConfirmed) return;

  try {
    const payload = buildEditPayloadFromForm();
    const response = await ProjectsEditAPI.updateProject(payload);

    if (response.status !== 200) {
      await showError("Não foi possível carregar os dados !!!");
      return;
    }

    await showSuccess("Alterações salvas com Sucesso !!!");
  } catch (err) {
    await showError(`Erro na requisição: ${err?.message || err}`);
  }
}

/* =========================================================
   PAGE SETUP (INIT)
========================================================= */
function loadView() {
  loadPage("adicionar_projetos", "editar.html");
}

function loadGroupedData() {
  getGroupedData(
    "getGroupedAmbiente",
    SELECTORS.inputs.tipoAmbiente,
    "tipo_ambiente"
  );
  getGroupedData(
    "getGroupedLiberador",
    SELECTORS.datalists.liberadores,
    "p_liberador"
  );
  getGroupedData(
    "getGroupedVendedor",
    SELECTORS.datalists.vendedores,
    "p_vendedor"
  );
}

function configureUiDefaults() {
  Fields.focus(SELECTORS.inputs.oc);
  Dom.allUpperCase();
  Dom.enableEnterAsTab();
}

function bindEvents() {
  Dom.addEventBySelector(SELECTORS.inputs.oc, "blur", loadProjectForEdit);
  Dom.addEventBySelector(SELECTORS.buttons.salvar, "click", handleSaveClick);
  Dom.addEventBySelector(SELECTORS.masks.moeda, "input", handleCurrencyInput);
}

function initEditProjectPage() {
  loadView();
  loadGroupedData();
  configureUiDefaults();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", initEditProjectPage);
