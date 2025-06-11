import {
  getText,
  setText,
  formatValueDecimal,
  formatCurrency,
  setFocus,
  getGroupedData,
  allUpperCase,
  loadPage,
  enableEnterAsTab,
  changeFormatCurrency,
  clearInputFields,
  addEventById,
  messageInformation,
  messageQuestion,
} from "./utils.js";

async function getEditProjetos() {
  const ordemdecompra = getText("txt_numoc");
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
          setText("txt_contrato", item.contrato);
          setText("txt_cliente", item.cliente);
          setText("txt_tipoambiente", item.tipoambiente);
          setText("txt_ambiente", item.ambiente);
          setText("txt_numproj", item.numproj);
          setText("txt_vendedor", item.vendedor);
          setText("txt_liberador", item.liberador);
          setText("txt_datacontrato", item.datacontrato);
          setText("txt_dataassinatura", item.dataassinatura);
          setText("txt_chegoufabrica", item.chegoufabrica);
          setText("txt_dataentrega", item.dataentrega);
          setText("txt_loja", item.loja);
          setText("txt_tipocliente", item.tipocliente);
          setText("txt_etapa", item.etapa);
          setText("txt_tipocontrato", item.tipocontrato);
          setText("txt_valorbruto", formatCurrency(item.valorbruto));
          setText("txt_valornegociado", formatCurrency(item.valornegociado));
          setText("txt_customaterial", formatCurrency(item.customaterial));
          setText(
            "txt_custoadicional",
            formatCurrency(item.customaterialadicional)
          );
        });
      } else {
        messageInformation("error", "ERRO", "Ordem de Compra Invalida");
        clearInputFields();
      }
    }
  }
}

async function setEditProjetos() {
  const result = await messageQuestion(null, "Deseja salvar edições ?");

  if (result.isConfirmed) {
    const data = {
      p_ordemdecompra: getText("txt_numoc"),
      p_contrato: getText("txt_contrato"),
      p_cliente: getText("txt_cliente"),
      p_tipoambiente: getText("txt_tipoambiente"),
      p_ambiente: getText("txt_ambiente"),
      p_numproj: getText("txt_numproj"),
      p_vendedor: getText("txt_vendedor"),
      p_liberador: getText("txt_liberador"),
      p_datacontrato: getText("txt_datacontrato"),
      p_dataassinatura: getText("txt_dataassinatura"),
      p_chegoufabrica: getText("txt_chegoufabrica"),
      p_dataentrega: getText("txt_dataentrega"),
      p_loja: getText("txt_loja"),
      p_tipocliente: getText("txt_tipocliente"),
      p_etapa: getText("txt_etapa"),
      p_tipocontrato: getText("txt_tipocontrato"),
      p_valorbruto: formatValueDecimal(getText("txt_valorbruto")),
      p_valornegociado: formatValueDecimal(getText("txt_valornegociado")),
      p_customaterial: formatValueDecimal(getText("txt_customaterial")),
      p_customaterialadicional: formatValueDecimal(
        getText("txt_custoadicional")
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
  loadPage("adicionar_projetos", "edit_projetos.html");
  setFocus("txt_numoc");
  getGroupedData("getGroupedAmbiente", "txt_tipoambiente", "tipo_ambiente");
  getGroupedData("getGroupedLiberador", "txt_liberador", "p_liberador");
  getGroupedData("getGroupedVendedor", "txt_vendedor", "p_vendedor");
  allUpperCase();
  enableEnterAsTab();
});

addEventById("#txt_numoc", "blur", getEditProjetos);
addEventById("#bt_update", "click", setEditProjetos);
