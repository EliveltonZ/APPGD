import {
  Dom,
  formatValueDecimal,
  getGroupedData,
  loadPage,
  enableEnterAsTab,
  changeFormatCurrency,
  messageInformation,
  messageQuestion,
  applyDateMask,
} from "./utils.js";

async function getContrato() {
  const contrato_value = Dom.getValue("txt_contrato");
  if (!contrato_value) {
    return;
  }

  const response = await fetch(`/getContrato?p_contrato=${contrato_value}`);

  if (contrato_value != "") {
    Dom.setValue("txt_loja", shopId());
    if (!response.ok) {
      const errText = await response.text();
      messageInformation("error", `erro ao executar consulta ${errText}`);
    } else {
      const data = await response.json();
      data.forEach((item) => {
        Dom.setValue("txt_cliente", item.p_cliente);
        Dom.setValue("txt_vendedor", item.p_vendedor);
        Dom.setValue("txt_liberador", item.p_liberador);
        Dom.setValue("txt_datacontrato", item.p_datacontrato);
        Dom.setValue("txt_dataassinatura", item.p_dataassinatura);
        Dom.setValue("txt_chegoufabrica", item.p_chegoufabrica);
        Dom.setValue("txt_dataentrega", item.p_dataentrega);
        Dom.setValue("txt_loja", item.p_loja);
        Dom.setValue("txt_tipocliente", item.p_tipocliente);
        Dom.setValue("txt_etapa", item.p_etapa);
      });
    }
  }
}

function shopId() {
  const value = Dom.getValue("txt_contrato").slice(0, 3);
  return value;
}

function checkOrder() {
  const value = Dom.getValue("txt_numoc").length;
  return value;
}

async function insertProject() {
  if (checkOrder() < 10) {
    messageInformation(
      "warning",
      "Atenção",
      `Ordem de compra invalida: caracteres ${checkOrder()}`
    );
    return;
  }

  const result = await messageQuestion(null, "Deseja incluir novo Projeto ?");

  if (result.isConfirmed) {
    const contrato = Dom.getValue("txt_contrato");
    const numoc = Dom.getValue("txt_numoc");
    const cliente = Dom.getValue("txt_cliente");
    const tipoambiente = Dom.getValue("txt_tipoambiente");
    const ambiente = Dom.getValue("txt_ambiente");
    const numproj = Dom.getValue("txt_numproj");
    const vendedor = Dom.getValue("txt_vendedor");
    const liberador = Dom.getValue("txt_liberador");
    const datacontrato = Dom.getValue("txt_datacontrato");
    const dataassinatura = Dom.getValue("txt_dataassinatura");
    const chegoufabrica = Dom.getValue("txt_chegoufabrica");
    const dataentrega = Dom.getValue("txt_dataentrega");
    const loja = Dom.getValue("txt_loja");
    const tipocliente = Dom.getValue("txt_tipocliente");
    const etapa = Dom.getValue("txt_etapa");
    const tipocontrato = Dom.getValue("txt_tipocontrato");
    const valorbruto = formatValueDecimal(Dom.getValue("txt_valorbruto"));
    const valornegociado = formatValueDecimal(
      Dom.getValue("txt_valornegociado")
    );
    const customaterial = formatValueDecimal(Dom.getValue("txt_customaterial"));
    const custoadicional = formatValueDecimal(
      Dom.getValue("txt_custoadicional")
    );

    const data = {
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

    const response = await fetch("/setProjeto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errText = await response.text();
      messageInformation("error", "Erro", "Erro ao inserir dados: " + errText);
    } else {
      await messageInformation(
        "success",
        "Sucesso",
        "Projeto inserido com Sucesso !!!"
      );
      Dom.clearInputFields(["txt_contrato"]);
      Dom.setFocus("txt_contrato");
    }
  }
}

window.formatarMoeda = function (e) {
  changeFormatCurrency(e);
};

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("adicionar_projetos", "adicionar.html");
  Dom.setFocus("txt_contrato");
  getGroupedData("getGroupedAmbiente", "txt_tipoambiente", "tipo_ambiente");
  getGroupedData("getGroupedLiberador", "liberadores", "p_liberador");
  getGroupedData("getGroupedVendedor", "vendedores", "p_vendedor");
  Dom.allUpperCase();
  enableEnterAsTab();
});

Dom.addEventBySelector("#txt_contrato", "blur", getContrato);
Dom.addEventBySelector("#bt_salvar", "click", insertProject);
Dom.addEventBySelector("#txt_numproj", "input", applyDateMask);
Dom.addEventBySelector("#txt_numoc", "blur", checkOrder);
