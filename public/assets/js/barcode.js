import {
  addEventBySelector,
  modalBarCode,
  detectarDispositivo,
  messageQuestion,
  messageInformation,
  getText,
  setText,
  setChecked,
  getChecked,
  convertDataBr,
  getUsuario,
  setDateTime,
  dateTimeNow,
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
      setText("txt_previsao", item.previsao);

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

      setText("txt_acabamentoinicio", item.acabamentoinicio);
      setText("txt_acabamentofim", item.acabamentofim);
      setText("txt_acabamentofim", item.acabamentofim);
      setChecked("chk_acabamento", item.acabamentopausa);
      setText("txt_acabamentoid", item.acabamentoresp);
      getUsuario(getText("txt_acabamentoid"), "txt_acabamentoresp");
      setChecked("chk_acabamentoinicio", false);
      setChecked("chk_acabamentofim", false);

      setText("txt_embalageminicio", item.embalageminicio);
      setText("txt_embalagemfim", item.embalagemfim);
      setText("txt_embalagemfim", item.embalagemfim);
      setChecked("chk_embalagem", item.embalagempausa);
      setText("txt_embalagemid", item.embalagemresp);
      getUsuario(getText("txt_embalagemid"), "txt_embalagemresp");
      setChecked("chk_embalageminicio", false);
      setChecked("chk_embalagemfim", false);

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

async function setDataProducao() {
  const result = await messageQuestion(null, "Deseja confirmar Alterações?");

  if (result.isConfirmed) {
    try {
      const data = {
        p_ordemdecompra: getText("txt_numoc"),
        p_corteinicio: getText("txt_corteinicio"),
        p_cortefim: getText("txt_cortefim"),
        p_corteresp: getText("txt_corteid"),
        p_cortepausa: getChecked("chk_corte"),

        p_customizacaoinicio: getText("txt_customizacaoinicio"),
        p_customizacaofim: getText("txt_customizacaofim"),
        p_customizacaoresp: getText("txt_customizacaoid"),
        p_customizacaopausa: getChecked("chk_customizacao"),

        p_coladeirainicio: getText("txt_coladeirainicio"),
        p_coladeirafim: getText("txt_coladeirafim"),
        p_coladeiraresp: getText("txt_coladeiraid"),
        p_coladeirapausa: getChecked("chk_coladeira"),

        p_usinageminicio: getText("txt_usinageminicio"),
        p_usinagemfim: getText("txt_usinagemfim"),
        p_usinagemresp: getText("txt_usinagemid"),
        p_usinagempausa: getChecked("chk_usinagem"),

        p_montageminicio: getText("txt_montageminicio"),
        p_montagemfim: getText("txt_montagemfim"),
        p_montagemresp: getText("txt_montagemid"),
        p_montagempausa: getChecked("chk_montagem"),

        p_paineisinicio: getText("txt_paineisinicio"),
        p_paineisfim: getText("txt_paineisfim"),
        p_paineisresp: getText("txt_paineisid"),
        p_paineispausa: getChecked("chk_paineis"),

        p_acabamentoinicio: getText("txt_acabamentoinicio"),
        p_acabamentofim: getText("txt_acabamentofim"),
        p_acabamentoresp: getText("txt_acabamentoid"),
        p_acabamentopausa: getChecked("chk_acabamento"),

        p_embalageminicio: getText("txt_embalageminicio"),
        p_embalagemfim: getText("txt_embalagemfim"),
        p_embalagemresp: getText("txt_embalagemid"),
        p_embalagempausa: getChecked("chk_embalagem"),

        p_observacoes: getText("txt_observacoes"),
        p_previsao: getText("txt_previsao"),
      };

      const response = await fetch("/setDataProducao", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errText = await response.text();
        messageInformation(
          "error",
          "ERRO",
          "Ocorreu um erro ao salvar os dados!"
        );
      } else {
        messageInformation(
          "success",
          "Sucesso",
          "Alterações confirmadas com sucesso!"
        );
      }
    } catch (err) {
      messageInformation(
        "error",
        "ERRO",
        "Falha na comunicação com o servidor!" + err.message
      );
    }
  }
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

function setor(value) {
  const dataMap = {
    2: "corte",
    3: "customizacao",
    4: "coladeira",
    5: "usinagem",
    6: "montagem",
    7: "paineis",
    8: "embalagem",
  };
  return dataMap[value];
}

function operacao(value) {
  const dataMap = {
    1: "inicio",
    2: "fim",
  };
  return dataMap[value];
}

function setDateTimeSetor(barcode) {
  const codebar = Number(barcode.slice(6, 9)).toString();
  const etapa = setor(codebar[0]);
  const action = operacao(codebar[1]);
  const element = `txt_${etapa}${action}`;
  try {
    setText(element, dateTimeNow());
  } catch (erro) {
    messageInformation("error", "ERRO", `${erro}`);
  }
}

async function buttonReadCodeBar() {
  const returns = await modalBarCode();
  setDateTimeSetor(returns);
}

addEventBySelector("#bt_salvar", "click", setDataProducao);
addEventBySelector("#txt_corteid", "blur", () =>
  getUsuario(getText("txt_corteid"), "txt_corteresp")
);

addEventBySelector("#txt_customizacaoid", "blur", () =>
  getUsuario(getText("txt_customizacaoid"), "txt_customizacaoresp")
);

addEventBySelector("#txt_coladeiraid", "blur", () =>
  getUsuario(getText("txt_coladeiraid"), "txt_coladeiraresp")
);

addEventBySelector("#txt_usinagemid", "blur", () =>
  getUsuario(getText("txt_usinagemid"), "txt_usinagemresp")
);

addEventBySelector("#txt_montagemid", "blur", () =>
  getUsuario(getText("txt_montagemid"), "txt_montagemresp")
);

addEventBySelector("#txt_paineisid", "blur", () =>
  getUsuario(getText("txt_paineisid"), "txt_paineisresp")
);

addEventBySelector("#txt_acabamentoid", "blur", () =>
  getUsuario(getText("txt_acabamentoid"), "txt_acabamentoresp")
);

addEventBySelector("#txt_embalagemid", "blur", () =>
  getUsuario(getText("txt_embalagemid"), "txt_embalagemresp")
);

addEventBySelector("#txt_pedido", "change", () =>
  getProducaoPedido(getText("txt_pedido"))
);

checkMachine();
addEventBySelector("#bt_scan", "click", buttonReadCodeBar);
addEventBySelector("#txt_scan", "change", () =>
  setDateTimeSetor(getText("txt_scan"))
);
