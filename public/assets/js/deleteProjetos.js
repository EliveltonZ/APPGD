import { loadPage } from "./utils.js";
import { Dom, Modal, q, qa } from "./UI/interface.js";
import { API } from "./service/api.js";
import { MyNumber } from "./utils/time.js";

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

async function getDeleteProjetos() {
  const ordemdecompra = Number(Dom.getValue(EL.OC));
  if (!Number.isInteger(ordemdecompra)) return;

  const response = await API.fetchQuery(
    `/getDeleteProjetos?p_ordemdecompra=${Dom.getValue(EL.OC)}`
  );

  if (response.status !== 200) {
    Modal.showInfo("error", "Erro", `${response.data}`);
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
        Dom.setValue(EL.VALOR_BRUTO, MyNumber.formatCoin(item.valorbruto));
        Dom.setValue(
          EL.VALOR_NEGOCIADO,
          MyNumber.formatCoin(item.valornegociado)
        );
        Dom.setValue(
          EL.CUSTO_MATERIAL,
          MyNumber.formatCoin(item.customaterial)
        );
        Dom.setValue(
          EL.CUSTO_ADICIONAL,
          MyNumber.formatCoin(item.customaterialadicional)
        );
      });
    } else {
      Modal.showInfo("error", "Erro", "Ordem de Compra Invalida").then(() => {
        Dom.setFocus(EL.OC);
      });
    }
  }
}

async function validForm(e) {
  const form = q("form");
  if (form.checkValidity()) {
    e.preventDefault();
    await setDeleteProjeto();
  }
}

async function setDeleteProjeto() {
  const result = await Modal.ShowQuestion(null, "Deseja excluir Projeto ?");

  if (result.isConfirmed) {
    const data = { p_ordemdecompra: Dom.getValue(EL.OC) };
    const response = await API.fetchBody("/setDeleteProjeto", "DELETE", data);

    if (response.status !== 200) {
      Modal.show("error", "Erro", `ERRO: ${response.data}`);
    } else {
      await Modal.show("success", "Sucesso", "Excluido com Sucesso !!!");
      document.location.href = "/excluir.html";
    }
  }
}

function init() {
  loadPage("adicionar_projetos", "excluir.html");
  Dom.setFocus(EL.OC);
  Dom.enableEnterAsTab();
  Dom.addEventBySelector(EL.OC, "change", getDeleteProjetos);
  Dom.addEventBySelector(EL.SALVAR, "click", async (e) => {
    validForm(e);
  });
}

document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
