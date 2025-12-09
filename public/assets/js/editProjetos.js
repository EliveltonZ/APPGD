import { getGroupedData, loadPage, changeFormatCurrency } from "./utils.js";

import { Dom, q } from "./UI/interface.js";
import { API } from "./service/api.js";
import { Numbers } from "./utils/number.js";
import { Modal } from "./utils/modal.js";

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

async function getEditProjetos() {
  const ordemdecompra = Dom.getValue(EL.OC);
  if (ordemdecompra) {
    const response = await fetch(
      `/getEditProjetos?p_ordemdecompra=${ordemdecompra}`
    );

    if (!response.ok) {
      Modal.showInfo("error", "Erro", "Digite a ordem de compra");
    } else {
      const data = await response.json();
      if (data && data.length > 0) {
        data.forEach((item) => {
          Dom.setValue(EL.CONTRATO, item.contrato);
          Dom.setValue(EL.CLIENTE, item.cliente);
          Dom.setValue(EL.TIPO_AMBIENTE, item.tipoambiente);
          Dom.setValue(EL.AMBIENTE, item.ambiente);
          Dom.setValue(EL.NUM_PROJ, item.numproj);
          Dom.setValue(EL.VENDEDOR, item.vendedor);
          Dom.setValue(EL.LIBERADOR, item.liberador);
          Dom.setValue(EL.DATA_CONTRATO, item.datacontrato);
          Dom.setValue(EL.DATA_ASSINATURA, item.dataassinatura);
          Dom.setValue(EL.CHEGOU_FABRICA, item.chegoufabrica);
          Dom.setValue(EL.DATA_ENTREGA, item.dataentrega);
          Dom.setValue(EL.LOJA, item.loja);
          Dom.setValue(EL.TIPO_CLIENTE, item.tipocliente);
          Dom.setValue(EL.ETAPA, item.etapa);
          Dom.setValue(EL.TIPO_CONTRATO, item.tipocontrato);
          Dom.setValue(EL.VALOR_BRUTO, Numbers.currency(item.valorbruto));
          Dom.setValue(
            EL.VALOR_NEGOCIADO,
            Numbers.currency(item.valornegociado)
          );
          Dom.setValue(EL.CUSTO_MATERIAL, Numbers.currency(item.customaterial));
          Dom.setValue(
            EL.CUSTO_ADICIONAL,
            Numbers.currency(item.customaterialadicional)
          );
        });
      } else {
        Modal.showInfo("error", "ERRO", "Ordem de Compra Invalida");
        Dom.clearInputFields();
      }
    }
  }
}

async function validForm(e) {
  const form = document.querySelector("form");
  if (form.checkValidity()) {
    e.preventDefault();
    await setEditProjetos();
  }
}

function getElementsValues() {
  const data = {
    p_ordemdecompra: Dom.getValue(EL.OC),
    p_contrato: Dom.getValue(EL.CONTRATO),
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
    p_valorbruto: MyNumber.formatValueDecimal(Dom.getValue(EL.VALOR_BRUTO)),
    p_valornegociado: MyNumber.formatValueDecimal(
      Dom.getValue(EL.VALOR_NEGOCIADO)
    ),
    p_customaterial: MyNumber.formatValueDecimal(
      Dom.getValue(EL.CUSTO_MATERIAL)
    ),
    p_customaterialadicional: MyNumber.formatValueDecimal(
      Dom.getValue(EL.CUSTO_ADICIONAL)
    ),
  };
  return data;
}

async function setEditProjetos() {
  const result = await Modal.ShowQuestion(null, "Deseja salvar edições ?");

  if (result.isConfirmed) {
    try {
      const data = getElementsValues();
      const response = await API.fetchBody("/setEditProjetos", "PUT", data);

      if (response.status !== 200) {
        Modal.showInfo(
          "error",
          "Erro",
          "Não foi possível carregar os dados !!!"
        );
      } else {
        Modal.showInfo(
          "success",
          "Sucesso",
          "Alterações salvas com Sucesso !!!"
        );
      }
    } catch (error) {
      Modal.showInfo("error", "Erro", "Erro na requisição: " + error.message);
    }
  }
}

function init() {
  loadPage("adicionar_projetos", "editar.html");
  Dom.setFocus(EL.OC);
  getGroupedData("getGroupedAmbiente", EL.TIPO_AMBIENTE, "tipo_ambiente");
  getGroupedData("getGroupedLiberador", EL.DL_LIBERADORES, "p_liberador");
  getGroupedData("getGroupedVendedor", EL.DL_VENDEDORES, "p_vendedor");
  Dom.allUpperCase();
  Dom.enableEnterAsTab();
  Dom.addEventBySelector(EL.OC, "blur", getEditProjetos);
  Dom.addEventBySelector(EL.SALVAR, "click", async (e) => {
    validForm(e);
  });
  Dom.addEventBySelector(EL.MOEDA, "input", (e) => {
    changeFormatCurrency(e.target);
  });
}

document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
