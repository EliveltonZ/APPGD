import { getGroupedData, loadPage, applyDateMask } from "./utils.js";

import { Dom, q, qa } from "./UI/interface.js";
import { API } from "./service/api.js";
import { Modal } from "./utils/modal.js";
import { Numbers } from "./utils/number.js";

/*=======================
  HELPER elements
======================= */

const EL = {
  // Inputs
  OC: "#txt_numoc",
  AMBIENTE: "#txt_ambiente",
  CONTRATO: "#txt_contrato",
  CLIENTE: "#txt_cliente",
  VENDEDOR: "#txt_vendedor",
  LIBERADOR: "#txt_liberador",
  DATA_CONTRATO: "#txt_datacontrato",
  DATA_ASSINATURA: "#txt_dataassinatura",
  DATA_ENTREGA: "#txt_dataentrega",
  CHEGOU_FABRICA: "#txt_chegoufabrica",
  LOJA: "#txt_loja",
  TIPO_CLIENTE: "#txt_tipocliente",
  ETAPA: "#txt_etapa",
  TIPO_AMBIENTE: "#txt_tipoambiente",
  NUM_PROJ: "#txt_numproj",
  TIPO_CONTRATO: "#txt_tipocontrato",
  TIPO_CLIENTE: "#txt_tipocliente",
  VALOR_BRUTO: "#txt_valorbruto",
  VALOR_NEGOCIADO: "#txt_valornegociado",
  CUSTO_MATERIAL: "#txt_customaterial",
  CUSTO_ADICIONAL: "#txt_custoadicional",

  // Buttons
  SALVAR: "#bt_salvar",

  //Data List
  DL_VENDEDORES: "#vendedores",
  DL_LIBERADORES: "#liberadores",
  MOEDA: ".moeda",
};
/*=======================
  HELPER API
======================= */

const DB = {
  setProject: async function (payload) {
    const res = await API.fetchBody("/setProjeto", "POST", payload);
    return res;
  },

  getContract: async function (orderBy) {
    const url = `/getContrato?p_contrato=${orderBy}`;
    const res = API.fetchQuery(url);
    return res;
  },
};

function fillContractFields(item) {
  Dom.setValue(EL.CLIENTE, item.p_cliente);
  Dom.setValue(EL.VENDEDOR, item.p_vendedor);
  Dom.setValue(EL.LIBERADOR, item.p_liberador);
  Dom.setValue(EL.DATA_CONTRATO, item.p_datacontrato);
  Dom.setValue(EL.DATA_ASSINATURA, item.p_dataassinatura);
  Dom.setValue(EL.CHEGOU_FABRICA, item.p_chegoufabrica);
  Dom.setValue(EL.DATA_ENTREGA, item.p_dataentrega);
  Dom.setValue(EL.LOJA, item.p_loja);
  Dom.setValue(EL.TIPO_CLIENTE, item.p_tipocliente);
  Dom.setValue(EL.ETAPA, item.p_etapa);
}

function isValidContract(contract) {
  return !!contract;
}

async function fetchContractData() {
  const contract = Dom.getValue(EL.CONTRATO);
  if (!isValidContract(contract)) return;

  try {
    const res = await DB.getContract(contract);
    Dom.setValue(EL.LOJA, getStoreCodeFromContract());

    if (res.status !== 200) {
      Modal.showInfo("error", `erro ao executar consulta ${res.data}`);
    } else {
      res.data.forEach((item) => {
        fillContractFields(item);
      });
    }
  } catch (err) {
    Modal.showInfo("error", "ERRO", `${err.message}`);
  }
}

function getStoreCodeFromContract() {
  const value = Dom.getValue(EL.CONTRATO).slice(0, 3);
  return value;
}

function getOrderNumberLength() {
  const value = Dom.getValue(EL.OC).length;
  return value;
}

async function validateAndSubmitForm(e) {
  const form = q("form");
  if (form.checkValidity()) {
    e.preventDefault();
    await submitProject();
  }
}

async function showInvalidOrderModal(orderLength) {
  await Modal.showInfo(
    "warning",
    "Atenção",
    `Ordem de compra inválida: caracteres ${orderLength}`
  );
}

async function hasValidOrderNumberLength(orderLength) {
  if (orderLength < 10) {
    await showInvalidOrderModal(orderLength);
    return false;
  }
  return true;
}

function buildProjectPayload() {
  return {
    p_contrato: Dom.getValue(EL.CONTRATO),
    p_ordemdecompra: Dom.getValue(EL.OC),
    p_cliente: Dom.getValue(EL.CLIENTE),
    p_tipoambiente: Dom.getValue(EL.TIPO_AMBIENTE),
    p_ambiente: Dom.getValue(EL.AMBIENTE),
    p_numproj: Dom.getValue(EL.NUM_PROJ),
    p_vendedor: Dom.getValue(EL.VENDEDOR),
    p_liberador: Dom.getValue(EL.LIBERADOR),
    p_datacontrato: Dom.getValue(EL.DATA_CONTRATO),
    p_dataassinatura: Dom.getValue(EL.DATA_ASSINATURA),
    p_chegoufabrica: Dom.getValue(EL.CHEGOU_FABRICA),
    p_dataentrega: Dom.getValue(EL.DATA_ENTREGA),
    p_loja: Dom.getValue(EL.LOJA),
    p_tipocliente: Dom.getValue(EL.TIPO_CLIENTE),
    p_etapa: Dom.getValue(EL.ETAPA),
    p_tipocontrato: Dom.getValue(EL.TIPO_CONTRATO),
    p_valorbruto: Number(Dom.getValue(EL.VALOR_BRUTO)).toFixed(2),
    p_valornegociado: Number(Dom.getValue(EL.VALOR_NEGOCIADO)).toFixed(2),
    p_customaterial: Number(Dom.getValue(EL.CUSTO_MATERIAL)).toFixed(2),
    p_custoadicional: Number(Dom.getValue(EL.CUSTO_ADICIONAL)).toFixed(2),
  };
}

async function submitProject() {
  const orderLength = getOrderNumberLength();
  if (!(await hasValidOrderNumberLength(orderLength))) return;

  const result = await Dom.showInfo(null, "Deseja incluir novo Projeto ?");

  if (result.isConfirmed) {
    const payload = buildProjectPayload();
    const response = await DB.setProject(payload);

    if (response.status !== 200) {
      Modal.showInfo("error", `Erro", "HTTP: ${response.status}`);
    } else {
      await Modal.showInfo("success", "Sucesso", "Inserido com Sucesso !!!");
      Dom.clearInputFields([EL.CONTRATO]);
      Dom.setFocus(EL.CONTRATO);
    }
  }
}

function handleCurrencyInput(e) {
  const element = e.target;
  const format = Numbers.FormatCurrency(element.value);
  element.value = format;
}

function initProjectFormPage() {
  loadPage("adicionar_projetos", "adicionar.html");
  getGroupedData("getGroupedAmbiente", EL.TIPO_AMBIENTE, "tipo_ambiente");
  getGroupedData("getGroupedLiberador", EL.DL_LIBERADORES, "p_liberador");
  getGroupedData("getGroupedVendedor", EL.DL_VENDEDORES, "p_vendedor");
  Dom.setFocus(EL.CONTRATO);
  Dom.allUpperCase();
  Dom.enableEnterAsTab();
  Dom.addEventBySelector(EL.CONTRATO, "blur", fetchContractData);
  Dom.addEventBySelector(EL.NUM_PROJ, "input", applyDateMask);
  Dom.addEventBySelector(EL.SALVAR, "click", async (e) => {
    validateAndSubmitForm(e);
  });
  Dom.addEventBySelector(EL.MOEDA, "input", handleCurrencyInput);
}

document.addEventListener("DOMContentLoaded", () => {
  initProjectFormPage();
});
