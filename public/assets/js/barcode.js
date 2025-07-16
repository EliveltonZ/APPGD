import {
  addEventBySelector,
  modalBarCode,
  detectarDispositivo,
  getText,
  messageQuestion,
  messageInformation,
  setText,
  setChecked,
  convertDataBr,
  getUsuario,
} from "./utils.js";

function checkMachine() {
  const dispositivo = detectarDispositivo();

  if (dispositivo == "Android") {
    const botao = document.getElementById("bt_scan");
    botao.classList.remove("d-none");
    botao.classList.add("d-flex");
  }

  if (dispositivo == "Windows") {
    const input = document.getElementById("txt_scan");
    input.classList.remove("d-none");
    input.classList.add("d-flex");
  }
}

async function readBarcode(barcode) {
  const pedido = Number(barcode.slice(0, 6));
  const codigo = Number(barcode.slice(6, 9));

  const data = {
    p_pedido: pedido,
    p_codigo: codigo,
  };

  const response = await fetch("/setEtapa", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function getProducaoPedido(pedido) {
  try {
    const numPedido = Number(pedido.slice(0, 6)).toString();
    const response = await fetch(`/getProducaoBarcode?p_pedido=${numPedido}`);

    if (!response.ok) {
      throw new Error("Erro ao buscar os dados");
    }
    const data = await response.json();

    data.forEach((item) => {
      setText("txt_numoc", item.ordemdecompra);
      setText("txt_cliente", item.cliente);
      setText("txt_contrato", item.contrato);
      setText("txt_codcc", item.codcc);
      setText("txt_ambiente", item.ambiente);
      setText("txt_numproj", item.numproj);
      setText("txt_lote", item.lote);
      setText("txt_chegoufabrica", convertDataBr(item.chegoufabrica));
      setText("txt_dataentrega", convertDataBr(item.dataentrega));

      setText("txt_corteinicio", item.corteinicio);
      setText("txt_cortefim", item.cortefim);
      setChecked("chk_corte", item.cortepausa);
      setText("txt_corteid", item.corteresp);
      getUsuario(getText("txt_corteid"), "txt_corteresp");
      setChecked("chk_corteinicio", false);
      setChecked("chk_cortefim", false);

      setText("txt_customizacaoinicio", item.customizacaoinicio);
      setText("txt_customizacaofim", item.customizacaofim);
      setChecked("chk_customizacao", item.customizacaopausa);
      setText("txt_customizacaoid", item.customizacaoresp);
      getUsuario(getText("txt_customizacaoid"), "txt_customizacaoresp");
      setChecked("chk_customizacaoinicio", false);
      setChecked("chk_customizacaofim", false);

      setText("txt_coladeirainicio", item.coladeirainicio);
      setText("txt_coladeirafim", item.coladeirafim);
      setChecked("chk_coladeira", item.coladeirapausa);
      setText("txt_coladeiraid", item.coladeiraresp);
      getUsuario(getText("txt_coladeiraid"), "txt_coladeiraresp");
      setChecked("chk_coladeirainicio", false);
      setChecked("chk_coladeirafim", false);

      setText("txt_usinageminicio", item.usinageminicio);
      setText("txt_usinagemfim", item.usinagemfim);
      setChecked("chk_usinagem", item.usinagempausa);
      setText("txt_usinagemid", item.usinagemresp);
      getUsuario(getText("txt_usinagemid"), "txt_usinagemresp");
      setChecked("chk_usinageminicio", false);
      setChecked("chk_usinagemfim", false);

      setText("txt_montageminicio", item.montageminicio);
      setText("txt_montagemfim", item.montagemfim);
      setText("txt_montagemfim", item.montagemfim);
      setChecked("chk_montagem", item.montagempausa);
      setText("txt_montagemid", item.montagemresp);
      getUsuario(getText("txt_montagemid"), "txt_montagemresp");
      setChecked("chk_montageminicio", false);
      setChecked("chk_montagemfim", false);

      setText("txt_paineisinicio", item.paineisinicio);
      setText("txt_paineisfim", item.paineisfim);
      setText("txt_paineisfim", item.paineisfim);
      setChecked("chk_paineis", item.paineispausa);
      setText("txt_paineisid", item.paineisresp);
      getUsuario(getText("txt_paineisid"), "txt_paineisresp");
      setChecked("chk_paineisinicio", false);
      setChecked("chk_paineisfim", false);

      setText("txt_observacoes", item.observacoes);
    });
  } catch (err) {
    alert(err.message);
  }
}

function getEtapa(value) {
  const dataMap = {
    2: "Corte",
    3: "Customização",
    4: "Coladeira",
    5: "Usinagem",
    6: "Montagem",
    7: "Paineis",
    8: "Embalagem",
  };
  return dataMap[value];
}

function acao(value) {
  const dataMap = {
    1: "Iniciar",
    2: "Finalizar",
  };
  return dataMap[value];
}

async function getCodBar(barcode) {
  const pedido = Number(barcode.slice(0, 6));
  const etapa = Number(barcode.slice(6, 9)).toString();
  const response = await fetch(`/getCodigoBarras?p_pedido=${pedido}`);
  const data = await response.json();

  const question = await messageQuestion(
    "Codigo de Barras",
    `${acao(etapa[1])} ${getEtapa(etapa[0])} ? <br> ${
      data[0].p_contrato
    } <br> ${data[0].p_cliente} <br> ${data[0].p_ambiente}`,
    "Sim",
    "Não"
  );

  if (question.isConfirmed) {
    await readBarcode(barcode);
    messageInformation(
      "success",
      "Sucesso",
      `Processo atualizado com Sucesso !!!`
    );
  }
  setText("txt_scan", "");
}

async function buttonReadCodeBar() {
  const returns = await modalBarCode();
  await getProducaoPedido(returns);
  await getCodBar(returns);
}

async function textReadCodeBar() {
  const returns = getText("txt_scan");
  await getProducaoPedido(returns);
  await getCodBar(returns);
}

checkMachine();
addEventBySelector("#bt_scan", "click", buttonReadCodeBar);
addEventBySelector("#txt_scan", "change", textReadCodeBar);
