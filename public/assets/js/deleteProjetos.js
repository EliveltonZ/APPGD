import {
  Dom,
  formatCurrency,
  loadPage,
  enableEnterAsTab,
  messageInformation,
  messageQuestion,
} from "./utils.js";

async function getDeleteProjetos() {
  const ordemdecompra = Number(Dom.getValue("txt_numoc"));
  if (!Number.isInteger(ordemdecompra)) return;

  const response = await fetch(
    `/getDeleteProjetos?p_ordemdecompra=${Dom.getValue("txt_numoc")}`
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
        Dom.setValue("txt_valornegociado", formatCurrency(item.valornegociado));
        Dom.setValue("txt_customaterial", formatCurrency(item.customaterial));
        Dom.setValue(
          "txt_custoadicional",
          formatCurrency(item.customaterialadicional)
        );
      });
    } else {
      messageInformation("error", "Erro", "Ordem de Compra Invalida").then(
        () => {
          Dom.setFocus("txt_numoc");
        }
      );
    }
  }
}

async function setDeleteProjeto() {
  const result = await messageQuestion(null, "Deseja excluir Projeto ?");

  if (result.isConfirmed) {
    const response = await fetch("/setDeleteProjeto", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ p_ordemdecompra: Dom.getValue("txt_numoc") }),
    });

    if (!response.ok) {
      messageInformation("error", "Erro", "Digite a ordem de compra");
    } else {
      await messageInformation(
        "success",
        "Sucesso",
        "Projeto excluido com Sucesso !!!"
      );
      document.location.href = "/excluir.html";
    }
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("adicionar_projetos", "excluir.html");
  Dom.setFocus("txt_numoc");
  enableEnterAsTab();
});

Dom.addEventBySelector("#txt_numoc", "change", getDeleteProjetos);
Dom.addEventBySelector("#bt_delete", "click", setDeleteProjeto);
