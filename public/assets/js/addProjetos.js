import {
  setText,
  getText,
  setFocus,
  formatValueDecimal,
  getGroupedData,
  loadPage,
  allUpperCase,
  enableEnterAsTab,
  changeFormatCurrency,
  addEventBySelector,
  messageInformation,
  messageQuestion,
} from "./utils.js";

async function getContrato() {
  const contrato_value = document.getElementById("txt_contrato").value;
  if (!contrato_value) {
    return;
  }

  const response = await fetch(`/getContrato?p_contrato=${contrato_value}`);

  if (contrato_value != "") {
    if (!response.ok) {
      const errText = await response.text();
      messageInformation("error", `erro ao executar consulta ${errText}`);
    } else {
      const data = await response.json();
      data.forEach((item) => {
        setText("txt_cliente", item.p_cliente);
        setText("txt_vendedor", item.p_vendedor);
        setText("txt_liberador", item.p_liberador);
        setText("txt_datacontrato", item.p_datacontrato);
        setText("txt_dataassinatura", item.p_dataassinatura);
        setText("txt_chegoufabrica", item.p_chegoufabrica);
        setText("txt_dataentrega", item.p_dataentrega);
        setText("txt_loja", item.p_loja);
        setText("txt_tipocliente", item.p_tipocliente);
        setText("txt_etapa", item.p_etapa);
      });
    }
  }
}

async function insertProject() {
  const result = await messageQuestion(null, "Deseja incluir novo Projeto ?");

  if (result.isConfirmed) {
    const contrato = getText("txt_contrato");
    const numoc = getText("txt_numoc");
    const cliente = getText("txt_cliente");
    const tipoambiente = getText("txt_tipoambiente");
    const ambiente = getText("txt_ambiente");
    const numproj = getText("txt_numproj");
    const vendedor = getText("txt_vendedor");
    const liberador = getText("txt_liberador");
    const datacontrato = getText("txt_datacontrato");
    const dataassinatura = getText("txt_dataassinatura");
    const chegoufabrica = getText("txt_chegoufabrica");
    const dataentrega = getText("txt_dataentrega");
    const loja = getText("txt_loja");
    const tipocliente = getText("txt_tipocliente");
    const etapa = getText("txt_etapa");
    const tipocontrato = getText("txt_tipocontrato");
    const valorbruto = formatValueDecimal(getText("txt_valorbruto"));
    const valornegociado = formatValueDecimal(getText("txt_valornegociado"));
    const customaterial = formatValueDecimal(getText("txt_customaterial"));
    const custoadicional = formatValueDecimal(getText("txt_custoadicional"));

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
      messageInformation(
        "success",
        "Sucesso",
        "Projeto inserido com Sucesso !!!"
      );
    }
  }
}

window.formatarMoeda = function (e) {
  changeFormatCurrency(e);
};

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("adicionar_projetos", "add_projetos.html");
  setFocus("txt_contrato");
  getGroupedData("getGroupedAmbiente", "txt_tipoambiente", "tipo_ambiente");
  getGroupedData("getGroupedLiberador", "txt_liberador", "p_liberador");
  getGroupedData("getGroupedVendedor", "txt_vendedor", "p_vendedor");
  allUpperCase();
  enableEnterAsTab();
});

addEventBySelector("#txt_contrato", "blur", getContrato);
addEventBySelector("#bt_salvar", "click", insertProject);
