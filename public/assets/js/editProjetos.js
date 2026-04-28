import { getGroupedData, loadPage } from "./utils.js";
import { Dom, q, ce } from "./UI/interface.js";
import { API } from "./service/api.js";
import { Numbers } from "./utils/number.js";
import { Modal } from "./utils/modal.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const EL = {
  inputs: {
    oc: "#txt_numoc",
    ambiente: "#txt_ambiente",
    contrato: "#txt_contrato",
    cliente: "#txt_cliente",
    id_cliente: "#txt_id_cliente",
    vendedores: "#txt_vendedor",
    liberadores: "#txt_liberador",
    dataContrato: "#txt_datacontrato",
    dataAssinatura: "#txt_dataassinatura",
    dataEntrega: "#txt_dataentrega",
    chegouFabrica: "#txt_chegoufabrica",
    lojas: "#txt_loja",
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
  form: {
    cliente: "#txt_cliente_form",
    bt_salvar: "#bt_salvar_form",
    tbl_clientes: ".table",
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

  fetchClients() {
    return API.fetchQuery("/listClients");
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

function createModal() {
  return Modal.show("modal-1");
}
/* =========================================================
   VALIDATORS
========================================================= */
function isFormValid() {
  const form = q("form");
  return !!form?.checkValidity?.() && form.checkValidity();
}

function getOrderNumber() {
  return Fields.get(EL.inputs.oc);
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
    [EL.inputs.contrato, item.contrato],
    [EL.inputs.id_cliente, item.id_cliente],
    [EL.inputs.cliente, item.cliente],
    [EL.inputs.tipoAmbiente, item.id_tipoambiente],
    [EL.inputs.ambiente, item.ambiente],
    [EL.inputs.numProj, item.numproj],
    [EL.inputs.vendedores, item.id_vendedor],
    [EL.inputs.liberadores, item.id_liberador],
    [EL.inputs.dataContrato, item.datacontrato],
    [EL.inputs.dataAssinatura, item.dataassinatura],
    [EL.inputs.chegouFabrica, item.chegoufabrica],
    [EL.inputs.dataEntrega, item.dataentrega],
    [EL.inputs.lojas, item.id_loja],
    [EL.inputs.tipoCliente, item.id_tipocliente],
    [EL.inputs.etapa, item.id_etapa],
    [EL.inputs.tipoContrato, item.id_tipocontrato],
    [EL.inputs.valorBruto, formatCurrency(item.valorbruto)],
    [EL.inputs.valorNegociado, formatCurrency(item.valornegociado)],
    [EL.inputs.custoMaterial, formatCurrency(item.customaterial)],
    [EL.inputs.custoAdicional, formatCurrency(item.customaterialadicional)],
  ];
}

function applyFields(pairs) {
  pairs.forEach(([selector, value]) => Fields.set(selector, value));
}

function createCells(value) {
  const td = ce("td");
  td.innerHTML = value;
  return td;
}

function createRow(data) {
  const tr = ce("tr");
  tr.append(createCells(data.p_id));
  tr.append(createCells(data.p_nome));
  return tr;
}

async function buildTableClients() {
  const tbody = q(EL.form.tbl_clientes).getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";
  const data = await ProjectsEditAPI.fetchClients();
  data.data.forEach((e) => tbody.appendChild(createRow(e)));
}

function buildEditPayloadFromForm() {
  return {
    p_ordemdecompra: Fields.get(EL.inputs.oc),
    p_contrato: Fields.get(EL.inputs.contrato),
    p_id_cliente: Fields.get(EL.inputs.id_cliente),
    p_id_tipoambiente: Fields.get(EL.inputs.tipoAmbiente),
    p_ambiente: Fields.get(EL.inputs.ambiente),
    p_numproj: Fields.get(EL.inputs.numProj),
    p_id_vendedor: Fields.get(EL.inputs.vendedores),
    p_id_liberador: Fields.get(EL.inputs.liberadores),
    p_datacontrato: Fields.get(EL.inputs.dataContrato),
    p_dataassinatura: Fields.get(EL.inputs.dataAssinatura),
    p_chegoufabrica: Fields.get(EL.inputs.chegouFabrica),
    p_dataentrega: Fields.get(EL.inputs.dataEntrega),
    p_id_loja: Fields.get(EL.inputs.lojas),
    p_id_tipocliente: Fields.get(EL.inputs.tipoCliente),
    p_id_etapa: Fields.get(EL.inputs.etapa),
    p_id_tipocontrato: Fields.get(EL.inputs.tipoContrato),
    p_valorbruto: formatDecimalForApi(Fields.get(EL.inputs.valorBruto)),
    p_valornegociado: formatDecimalForApi(Fields.get(EL.inputs.valorNegociado)),
    p_customaterial: formatDecimalForApi(Fields.get(EL.inputs.custoMaterial)),
    p_customaterialadicional: formatDecimalForApi(
      Fields.get(EL.inputs.custoAdicional),
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

  getGroupedData("/listarAmbientes", EL.inputs.tipoAmbiente, [
    "p_id",
    "p_tipo_ambiente",
  ]);
  getGroupedData("/listarLiberadores", EL.inputs.liberadores, [
    "p_id",
    "p_liberador",
  ]);
  getGroupedData("/listarVendedores", EL.inputs.vendedores, [
    "p_id",
    "p_vendedor",
  ]);
  getGroupedData("/listarTipoClientes", EL.inputs.tipoCliente, [
    "p_id",
    "p_tipocliente",
  ]);
  getGroupedData("/listarTipoContrato", EL.inputs.tipoContrato, [
    "p_id",
    "p_tipocontrato",
  ]);

  getGroupedData("/listarLojas", EL.inputs.lojas, ["p_id", "p_loja"]);
  getGroupedData("/listarEtapas", EL.inputs.etapa, ["p_id", "p_etapa"]);
}

function configureUiDefaults() {
  Fields.focus(EL.inputs.oc);
  Dom.allUpperCase();
  Dom.enableEnterAsTab();
}

function getTextCell(tdEL, index) {
  const item = tdEL.getElementsByTagName("td")[index];
  return item.textContent;
}

function handleSelectClient(e) {
  const tdEL = e.target.closest("tr");
  const idClient = getTextCell(tdEL, 0);
  const name = getTextCell(tdEL, 1);
  Fields.set(EL.inputs.id_cliente, idClient);
  Fields.set(EL.inputs.cliente, name);
}

function bindEvents() {
  Dom.addEventBySelector(EL.inputs.oc, "blur", loadProjectForEdit);
  Dom.addEventBySelector(EL.buttons.salvar, "click", handleSaveClick);
  Dom.addEventBySelector(EL.masks.moeda, "input", handleCurrencyInput);
  Dom.addEventBySelector(EL.inputs.id_cliente, "dblclick", createModal);
  Dom.addEventBySelector(EL.form.tbl_clientes, "dblclick", handleSelectClient);
}

function initEditProjectPage() {
  loadView();
  configureUiDefaults();
  bindEvents();
  buildTableClients();
}

document.addEventListener("DOMContentLoaded", initEditProjectPage);
