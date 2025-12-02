import {
  formatValueDecimal,
  getGroupedData,
  loadPage,
  changeFormatCurrency,
  applyDateMask,
} from "./utils.js";

import { Dom, Modal, q } from "./UI/interface.js";
import { API } from "./service/api.js";

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
};

async function getContrato() {
  const contrato_value = Dom.getValue(EL.CONTRATO);
  if (!contrato_value) {
    return;
  }

  const response = await fetch(`/getContrato?p_contrato=${contrato_value}`);

  if (contrato_value != "") {
    Dom.setValue(EL.LOJA, shopId());
    if (!response.ok) {
      const errText = await response.text();
      Moda.showInfo("error", `erro ao executar consulta ${errText}`);
    } else {
      const data = await response.json();
      data.forEach((item) => {
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
      });
    }
  }
}

function shopId() {
  const value = Dom.getValue(EL.CONTRATO).slice(0, 3);
  return value;
}

function lenghtOrder() {
  const value = Dom.getValue(EL.OC).length;
  return value;
}

async function validForm(e) {
  const form = q("form");
  if (form.checkValidity()) {
    e.preventDefault();
    await insertProject();
  }
}

async function insertProject() {
  const lenghtOC = lenghtOrder();

  if (lenghtOC < 10) {
    Modal.showInfo(
      "warning",
      "Atenção",
      `Ordem de compra invalida: caracteres ${lenghtOC}`
    );
    return;
  }

  const result = await Dom.showInfo(null, "Deseja incluir novo Projeto ?");

  if (result.isConfirmed) {
    const contrato = Dom.getValue(EL.CONTRATO);
    const numoc = Dom.getValue(EL.OC);
    const cliente = Dom.getValue(EL.CLIENTE);
    const tipoambiente = Dom.getValue(EL.TIPO_AMBIENTE);
    const ambiente = Dom.getValue(EL.AMBIENTE);
    const numproj = Dom.getValue(EL.NUM_PROJ);
    const vendedor = Dom.getValue(EL.VENDEDOR);
    const liberador = Dom.getValue(EL.LIBERADOR);
    const datacontrato = Dom.getValue(EL.DATA_CONTRATO);
    const dataassinatura = Dom.getValue(EL.DATA_ASSINATURA);
    const chegoufabrica = Dom.getValue(EL.CHEGOU_FABRICA);
    const dataentrega = Dom.getValue(EL.DATA_ENTREGA);
    const loja = Dom.getValue(EL.LOJA);
    const tipocliente = Dom.getValue(EL.TIPO_CLIENTE);
    const etapa = Dom.getValue(EL.ETAPA);
    const tipocontrato = Dom.getValue(EL.TIPO_CONTRATO);
    const valorbruto = Dom.getValue(EL.VALOR_BRUTO).toFixed(2);
    const valornegociado = Dom.getValue(EL.VALOR_NEGOCIADO).toFixed(2);
    const customaterial = Dom.getValue(EL.CUSTO_MATERIAL).toFixed(2);
    const custoadicional = Dom.getValue(EL.CUSTO_ADICIONAL).toFixed(2);

    const payload = {
      p_contrato: contrato,
      p_ordemdecompra: numoc,
      p_cliente: cliente,
      p_tipoambiente: tipoambiente,
      p_ambiente: ambiente,
      p_numproj: numproj,
      p_vendedor: vendedor,
      p_liberador: liberador,
      p_datacontrato: datacontrato,
      p_dataassinatura: dataassinatura,
      p_chegoufabrica: chegoufabrica,
      p_dataentrega: dataentrega,
      p_loja: loja,
      p_tipocliente: tipocliente,
      p_etapa: etapa,
      p_tipocontrato: tipocontrato,
      p_valorbruto: valorbruto,
      p_valornegociado: valornegociado,
      p_customaterial: customaterial,
      p_custoadicional: custoadicional,
    };

    const response = await API.fetchBody("/setProjeto", "POST", payload);

    if (response.status !== 200) {
      Modal.showInfo("error", `Erro", "HTTP: ${response.status}`);
    } else {
      await Modal.showInfo("success", "Sucesso", "Inserido com Sucesso !!!");
      Dom.clearInputFields([EL.CONTRATO]);
      Dom.setFocus(EL.CONTRATO);
    }
  }
}

function init() {
  loadPage("adicionar_projetos", "adicionar.html");
  getGroupedData("getGroupedAmbiente", EL.TIPO_AMBIENTE, "tipo_ambiente");
  getGroupedData("getGroupedLiberador", EL.DL_LIBERADORES, "p_liberador");
  getGroupedData("getGroupedVendedor", EL.DL_VENDEDORES, "p_vendedor");
  Dom.setFocus(EL.CONTRATO);
  Dom.allUpperCase();
  Dom.enableEnterAsTab();
  Dom.addEventBySelector(EL.CONTRATO, "blur", getContrato);
  Dom.addEventBySelector(EL.NUM_PROJ, "input", applyDateMask);
  Dom.addEventBySelector(EL.OC, "blur", lenghtOrder);
  Dom.addEventBySelector(EL.SALVAR, "click", async (e) => {
    validForm(e);
  });
}

window.formatarMoeda = function (e) {
  changeFormatCurrency(e);
};

document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
