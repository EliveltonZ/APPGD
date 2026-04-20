import { getGroupedData, loadPage, applyDateMask } from "./utils.js";
import { Dom, q, ce } from "./UI/interface.js";
import { API } from "./service/api.js";
import { Modal } from "./utils/modal.js";
import { Numbers } from "./utils/number.js";

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
    liberadores: "#txt_liberador",
    vendedores: "#txt_vendedor",
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
   API LAYER (DB)
========================================================= */
const ProjectAPI = {
  createClient(payload) {
    return API.fetchBody("/createClient", "POST", payload);
  },

  createProject(payload) {
    return API.fetchBody("/createProject", "POST", payload);
  },

  fetchContract(contract) {
    return API.fetchQuery(`/getContrato?p_contrato=${contract}`);
  },

  fetchMaxOrder() {
    return API.fetchQuery("/getMax");
  },

  fetchShops() {
    return API.fetchQuery("/getLojas");
  },

  fetchClients() {
    return API.fetchQuery("/listClients");
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
  return Fields.get(EL.inputs.contrato);
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

/* =========================================================
   MAPPERS (API -> UI) and (UI -> API)
========================================================= */
function mapContractToForm(item) {
  return [
    [EL.inputs.cliente, item.p_cliente],
    [EL.inputs.id_cliente, item.p_id_cliente],
    [EL.inputs.vendedores, item.p_id_vendedor],
    [EL.inputs.liberadores, item.p_id_liberador],
    [EL.inputs.dataContrato, item.p_datacontrato],
    [EL.inputs.dataAssinatura, item.p_dataassinatura],
    [EL.inputs.chegouFabrica, item.p_chegoufabrica],
    [EL.inputs.dataEntrega, item.p_dataentrega],
    [EL.inputs.lojas, item.p_id_loja],
    [EL.inputs.tipoCliente, item.p_id_tipocliente],
    [EL.inputs.etapa, item.p_id_etapa],
  ];
}

function applyMappedFields(fieldPairs) {
  fieldPairs.forEach(([selector, value]) => Fields.set(selector, value));
}

async function buildTableClients() {
  const tbody = q(EL.form.tbl_clientes).getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";
  const data = await ProjectAPI.fetchClients();
  data.data.forEach((e) => tbody.appendChild(createRow(e)));
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
    p_contrato: Fields.get(EL.inputs.contrato),
    p_ordemdecompra: Fields.get(EL.inputs.oc),
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
    p_valorbruto: toFixed2(Fields.get(EL.inputs.valorBruto)),
    p_valornegociado: toFixed2(Fields.get(EL.inputs.valorNegociado)),
    p_customaterial: toFixed2(Fields.get(EL.inputs.custoMaterial)),
    p_custoadicional: toFixed2(Fields.get(EL.inputs.custoAdicional)),
  };
}

function payloadClient() {
  return { p_nome_cliente: Fields.get(EL.form.cliente) };
}

/* =========================================================
   VALIDATORS
========================================================= */
function getOrderNumberLength() {
  return String(Fields.get(EL.inputs.oc) || "").length;
}

function isOrderNumberLengthValid(length, min = 2) {
  return length >= min;
}

function isFormValid(element) {
  const form = q(element);
  return !!form?.checkValidity?.() && form.checkValidity();
}

/* =========================================================
   UI MESSAGES (single responsibility)
========================================================= */
function showHttpError(status, data) {
  return Modal.showInfo(
    "error",
    "ERRO",
    `HTTP: ${status}${data ? ` - ${data}` : ""}`,
  );
}

function showGenericError(err) {
  return Modal.showInfo("error", "ERRO", `${err?.message || err}`);
}

function showInvalidOrderModal(orderLength) {
  return Modal.showInfo(
    "warning",
    "Atenção",
    `Ordem de compra inválida: caracteres ${orderLength}`,
  );
}

function showCreateSuccess() {
  return Modal.showInfo("success", "Sucesso", "Inserido com Sucesso !!!");
}

function confirmCreateProject() {
  return Modal.showConfirmation(null, "Deseja incluir novo Projeto ?");
}

function confirmCreateClient() {
  return Modal.showConfirmation(null, "Deseja incluir novo Cliente ?");
}

function createModal() {
  return Modal.show("modal-1");
}

/* =========================================================
   USE CASES / HANDLERS
========================================================= */

async function setMaxOrder() {
  const order = await ProjectAPI.fetchMaxOrder();
  const nextOrder = order.data[0].p_max + 1;
  Fields.set(EL.inputs.oc, nextOrder);
}

async function handleContractBlur() {
  const contract = getContractValue();
  if (isEmpty(contract)) return;

  try {
    const res = await ProjectAPI.fetchContract(contract);
    console.log(contract);
    if (res.status !== 200) return showHttpError(res.status, res.data);

    // Se o backend retornar vários itens, aplica todos (o último vence nos campos iguais)
    res.data.forEach((item) => applyMappedFields(mapContractToForm(item)));
  } catch (err) {
    await showGenericError(err);
  }
}

async function handleSaveClick(e) {
  if (!isFormValid("#modal-div form")) return;

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
    Fields.clear([EL.inputs.contrato]);
    Fields.focus(EL.inputs.contrato);
  } catch (err) {
    await showGenericError(err);
  }
}

async function handleSaveClient(e) {
  if (!isFormValid(".form-cliente")) return;

  e.preventDefault();
  const result = await confirmCreateClient();
  if (!result.isConfirmed) return;
  try {
    const payload = payloadClient();
    const response = await ProjectAPI.createClient(payload);
    console.log(payload);
    console.log(response.status);
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
  Fields.focus(EL.inputs.contrato);
  Dom.allUpperCase();
  Dom.enableEnterAsTab();
}

function filterTableClients() {
  const inputFilter = q(EL.form.cliente);
  const filtro = inputFilter.value.toUpperCase();
  const table = q(EL.form.tbl_clientes);
  const linhas = table
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");

  apllyFilter(linhas, filtro);
}

function apllyFilter(linhas, filtro) {
  for (let i = 0; i < linhas.length; i++) {
    const textoLinha = linhas[i].textContent.toUpperCase();

    if (textoLinha.includes(filtro)) {
      linhas[i].style.display = "";
    } else {
      linhas[i].style.display = "none";
    }
  }
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

function teste() {
  console.log("testando ....");
}

function bindEvents() {
  Dom.addEventBySelector(EL.inputs.contrato, "blur", handleContractBlur);
  Dom.addEventBySelector(EL.inputs.numProj, "input", applyDateMask);
  Dom.addEventBySelector(EL.buttons.salvar, "click", handleSaveClick);
  Dom.addEventBySelector(EL.masks.moeda, "input", handleCurrencyInput);
  Dom.addEventBySelector(EL.inputs.id_cliente, "dblclick", createModal);
  Dom.addEventBySelector(EL.form.cliente, "input", filterTableClients);
  Dom.addEventBySelector(EL.form.bt_salvar, "click", handleSaveClient);
  Dom.addEventBySelector(EL.form.tbl_clientes, "dblclick", handleSelectClient);
  Dom.addEventBySelector(EL.inputs.oc, "dblclick", async () => setMaxOrder());
}

function initProjectFormPage() {
  loadInitialData();
  configureUiDefaults();
  bindEvents();
  buildTableClients();
}

document.addEventListener("DOMContentLoaded", initProjectFormPage);
