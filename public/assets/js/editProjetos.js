import {
  Dom,
  formatValueDecimal,
  formatCurrency,
  getGroupedData,
  allUpperCase,
  loadPage,
  enableEnterAsTab,
  changeFormatCurrency,
  messageInformation,
  messageQuestion,
} from "./utils.js";

async function getEditProjetos() {
  const ordemdecompra = Dom.getValue("txt_numoc");
  if (ordemdecompra) {
    const response = await fetch(
      `/getEditProjetos?p_ordemdecompra=${ordemdecompra}`
    );

    if (!response.ok) {
      messageInformation("error", "Erro", "Digite a ordem de compra");
    } else {
      const data = await response.json();
      if (data && data.length > 0) {
        data.forEach((item) => {
          Dom.setValue("txt_contrato", item.contrato);
          Dom.setValue("txt_cliente", item.cliente);
          Dom.setValue("txt_tipoambiente", item.tipoambiente);
          Dom.setValue("txt_ambiente", item.ambiente);
          Dom.setValue("txt_numproj", item.numproj);
          Dom.setValue("txt_vendedor", item.vendedor);
          Dom.setValue("txt_liberador", item.liberador);
          Dom.setValue("txt_datacontrato", item.datacontrato);
          Dom.setValue("txt_dataassinatura", item.dataassinatura);
          Dom.setValue("txt_chegoufabrica", item.chegoufabrica);
          Dom.setValue("txt_dataentrega", item.dataentrega);
          Dom.setValue("txt_loja", item.loja);
          Dom.setValue("txt_tipocliente", item.tipocliente);
          Dom.setValue("txt_etapa", item.etapa);
          Dom.setValue("txt_tipocontrato", item.tipocontrato);
          Dom.setValue("txt_valorbruto", formatCurrency(item.valorbruto));
          Dom.setValue(
            "txt_valornegociado",
            formatCurrency(item.valornegociado)
          );
          Dom.setValue("txt_customaterial", formatCurrency(item.customaterial));
          Dom.setValue(
            "txt_custoadicional",
            formatCurrency(item.customaterialadicional)
          );
        });
      } else {
        messageInformation("error", "ERRO", "Ordem de Compra Invalida");
        Dom.clearInputFields();
      }
    }
  }
}

async function setEditProjetos() {
  const result = await messageQuestion(null, "Deseja salvar edições ?");

  if (result.isConfirmed) {
    const data = {
      p_ordemdecompra: Dom.getValue("txt_numoc"),
      p_contrato: Dom.getValue("txt_contrato"),
      p_cliente: Dom.getValue("txt_cliente"),
      p_tipoambiente: Dom.getValue("txt_tipoambiente"),
      p_ambiente: Dom.getValue("txt_ambiente"),
      p_numproj: Dom.getValue("txt_numproj"),
      p_vendedor: Dom.getValue("txt_vendedor"),
      p_liberador: Dom.getValue("txt_liberador"),
      p_datacontrato: Dom.getValue("txt_datacontrato"),
      p_dataassinatura: Dom.getValue("txt_dataassinatura"),
      p_chegoufabrica: Dom.getValue("txt_chegoufabrica"),
      p_dataentrega: Dom.getValue("txt_dataentrega"),
      p_loja: Dom.getValue("txt_loja"),
      p_tipocliente: Dom.getValue("txt_tipocliente"),
      p_etapa: Dom.getValue("txt_etapa"),
      p_tipocontrato: Dom.getValue("txt_tipocontrato"),
      p_valorbruto: formatValueDecimal(Dom.getValue("txt_valorbruto")),
      p_valornegociado: formatValueDecimal(Dom.getValue("txt_valornegociado")),
      p_customaterial: formatValueDecimal(Dom.getValue("txt_customaterial")),
      p_customaterialadicional: formatValueDecimal(
        Dom.getValue("txt_custoadicional")
      ),
    };

    try {
      const response = await fetch("/setEditProjetos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        messageInformation(
          "error",
          "Erro",
          "Não foi possível carregar os dados !!!"
        );
      } else {
        messageInformation(
          "success",
          "Sucesso",
          "Alterações salvas com Sucesso !!!"
        );
      }
    } catch (error) {
      messageInformation(
        "error",
        "Erro",
        "Erro na requisição: " + error.message
      );
    }
  }
}

window.formatarMoeda = function (e) {
  changeFormatCurrency(e);
};

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("adicionar_projetos", "editar.html");
  Dom.setFocus("txt_numoc");
  getGroupedData("getGroupedAmbiente", "txt_tipoambiente", "tipo_ambiente");
  getGroupedData("getGroupedLiberador", "liberadores", "p_liberador");
  getGroupedData("getGroupedVendedor", "vendedores", "p_vendedor");
  allUpperCase();
  enableEnterAsTab();
});

Dom.addEventBySelector("#txt_numoc", "blur", getEditProjetos);
Dom.addEventBySelector("#bt_update", "click", setEditProjetos);
