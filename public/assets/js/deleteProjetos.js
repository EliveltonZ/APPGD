import {
  setText,
  getText,
  formatCurrency,
  setFocus,
  loadPage,
  enableEnterAsTab,
  addEventBySelector,
  messageInformation,
  messageQuestion,
} from "./utils.js";

async function getDeleteProjetos() {
  const ordemdecompra = Number(getText("txt_numoc"));
  if (!Number.isInteger(ordemdecompra)) return;

  const response = await fetch(
    `/getDeleteProjetos?p_ordemdecompra=${getText("txt_numoc")}`
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
      messageInformation("error", "Erro", "Ordem de Compra Invalida");
    }
  }
}

async function setDeleteProjeto() {
  const result = await messageQuestion(null, "Deseja excluir Projeto ?");

  if (result.isConfirmed) {
    const response = await fetch("/setDeleteProjeto", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ p_ordemdecompra: getText("txt_numoc") }),
    });

    if (!response.ok) {
      messageInformation("error", "Erro", "Digite a ordem de compra");
    } else {
      messageInformation(
        "success",
        "Sucesso",
        "Projeto excluido com Sucesso !!!"
      );
    }
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("adicionar_projetos", "delete_projetos.html");
  setFocus("txt_numoc");
  enableEnterAsTab();
});

addEventBySelector("#txt_numoc", "blur", getDeleteProjetos);
addEventBySelector("#bt_delete", "click", setDeleteProjeto);
