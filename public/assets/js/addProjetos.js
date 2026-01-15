import { getGroupedData, loadPage, applyDateMask } from "./utils.js";
import { Dom, q } from "./UI/interface.js";
import { API } from "./service/api.js";
import { Modal } from "./utils/modal.js";
import { Numbers } from "./utils/number.js";

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
   API LAYER (DB)
========================================================= */
const ProjectAPI = {
  createProject(payload) {
    return API.fetchBody("/setProjeto", "POST", payload);
  },

  fetchContract(contract) {
    const url = `/getContrato?p_contrato=${contract}`;
    return API.fetchQuery(url);
  },
};

/* =========================================================
   FIELD ACCESS (READ/WRITE) - single responsibility
========================================================= */
const Fields = {
  get(selector) {
    return Dom.getValue(selector);
  },
  set(selector, value) {
    Dom.setValue(selector, value);
  },
  clear(selectors) {
    Dom.clearInputFields(selectors);
  },
  focus(selector) {
    Dom.setFocus(selector);
  },
};

/* =========================================================
   DOMAIN HELPERS
========================================================= */
function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function getContractValue() {
  return Fields.get(SELECTORS.inputs.contrato);
}

function getStoreCodeFromContract(contract) {
  return String(contract).slice(0, 3);
}

/* =========================================================
   MAPPERS (API -> UI) and (UI -> API)
========================================================= */
function mapContractToForm(item) {
  return [
    [SELECTORS.inputs.cliente, item.p_cliente],
    [SELECTORS.inputs.vendedor, item.p_vendedor],
    [SELECTORS.inputs.liberador, item.p_liberador],
    [SELECTORS.inputs.dataContrato, item.p_datacontrato],
    [SELECTORS.inputs.dataAssinatura, item.p_dataassinatura],
    [SELECTORS.inputs.chegouFabrica, item.p_chegoufabrica],
    [SELECTORS.inputs.dataEntrega, item.p_dataentrega],
    [SELECTORS.inputs.loja, item.p_loja],
    [SELECTORS.inputs.tipoCliente, item.p_tipocliente],
    [SELECTORS.inputs.etapa, item.p_etapa],
  ];
}

function applyMappedFields(fieldPairs) {
  fieldPairs.forEach(([selector, value]) => Fields.set(selector, value));
}

function toFixed2(value) {
  try {
    return value
      ? String(value)
          .replace(/[^\d,]/g, "")
          .replace(",", ".")
      : "0";
  } catch {
    return "0";
  }
}

function buildProjectPayloadFromForm() {
  return {
    p_contrato: Fields.get(SELECTORS.inputs.contrato),
    p_ordemdecompra: Fields.get(SELECTORS.inputs.oc),
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
    p_valorbruto: toFixed2(Fields.get(SELECTORS.inputs.valorBruto)),
    p_valornegociado: toFixed2(Fields.get(SELECTORS.inputs.valorNegociado)),
    p_customaterial: toFixed2(Fields.get(SELECTORS.inputs.custoMaterial)),
    p_custoadicional: toFixed2(Fields.get(SELECTORS.inputs.custoAdicional)),
  };
}

/* =========================================================
   VALIDATORS
========================================================= */
function getOrderNumberLength() {
  return String(Fields.get(SELECTORS.inputs.oc) || "").length;
}

function isOrderNumberLengthValid(length, min = 10) {
  return length >= min;
}

function isFormValid() {
  const form = q("form");
  return !!form?.checkValidity?.() && form.checkValidity();
}

/* =========================================================
   UI MESSAGES (single responsibility)
========================================================= */
function showHttpError(status, data) {
  return Modal.showInfo(
    "error",
    "ERRO",
    `HTTP: ${status}${data ? ` - ${data}` : ""}`
  );
}

function showGenericError(err) {
  return Modal.showInfo("error", "ERRO", `${err?.message || err}`);
}

function showInvalidOrderModal(orderLength) {
  return Modal.showInfo(
    "warning",
    "Atenção",
    `Ordem de compra inválida: caracteres ${orderLength}`
  );
}

function showCreateSuccess() {
  return Modal.showInfo("success", "Sucesso", "Inserido com Sucesso !!!");
}

function confirmCreateProject() {
  return Modal.showConfirmation(null, "Deseja incluir novo Projeto ?");
}

/* =========================================================
   USE CASES / HANDLERS
========================================================= */
function setStoreCodeIntoForm(contract) {
  Fields.set(SELECTORS.inputs.loja, getStoreCodeFromContract(contract));
}

async function handleContractBlur() {
  const contract = getContractValue();
  if (isEmpty(contract)) return;

  try {
    setStoreCodeIntoForm(contract);

    const res = await ProjectAPI.fetchContract(contract);
    if (res.status !== 200) return showHttpError(res.status, res.data);

    // Se o backend retornar vários itens, aplica todos (o último vence nos campos iguais)
    res.data.forEach((item) => applyMappedFields(mapContractToForm(item)));
  } catch (err) {
    await showGenericError(err);
  }
}

async function handleSaveClick(e) {
  if (!isFormValid()) return;

  e.preventDefault();

  const orderLength = getOrderNumberLength();
  if (!isOrderNumberLengthValid(orderLength)) {
    await showInvalidOrderModal(orderLength);
    return;
  }

  const confirmation = await confirmCreateProject();
  if (!confirmation.isConfirmed) return;

  try {
    const payload = buildProjectPayloadFromForm();
    const response = await ProjectAPI.createProject(payload);

    if (response.status !== 200) {
      await showHttpError(response.status);
      return;
    }

    await showCreateSuccess();
    Fields.clear([SELECTORS.inputs.contrato]);
    Fields.focus(SELECTORS.inputs.contrato);
  } catch (err) {
    await showGenericError(err);
  }
}

function handleCurrencyInput(e) {
  const element = e.target;
  element.value = Numbers.currency(element.value);
}

/* =========================================================
   PAGE SETUP (INIT)
========================================================= */
function loadInitialData() {
  loadPage("adicionar_projetos", "adicionar.html");
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
  Fields.focus(SELECTORS.inputs.contrato);
  Dom.allUpperCase();
  Dom.enableEnterAsTab();
}

function bindEvents() {
  Dom.addEventBySelector(SELECTORS.inputs.contrato, "blur", handleContractBlur);
  Dom.addEventBySelector(SELECTORS.inputs.numProj, "input", applyDateMask);
  Dom.addEventBySelector(SELECTORS.buttons.salvar, "click", handleSaveClick);
  Dom.addEventBySelector(SELECTORS.masks.moeda, "input", handleCurrencyInput);
}

function initProjectFormPage() {
  loadInitialData();
  configureUiDefaults();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", initProjectFormPage);
