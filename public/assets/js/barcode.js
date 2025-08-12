import {
  Dom,
  modalBarCode,
  detectarDispositivo,
  messageQuestion,
  messageInformation,
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
    console.log(response);
    if (!response.ok) {
      throw new Error("Erro ao buscar os dados");
    }
    const data = await response.json();

    data.forEach((item) => {
      Dom.setValue("txt_numoc", item.ordemdecompra);
      Dom.setValue("txt_cliente", item.cliente);
      Dom.setValue("txt_contrato", item.contrato);
      Dom.setValue("txt_codcc", item.codcc);
      Dom.setValue("txt_ambiente", item.ambiente);
      Dom.setValue("txt_numproj", item.numproj);
      Dom.setValue("txt_lote", item.lote);
      Dom.setValue("txt_chegoufabrica", convertDataBr(item.chegoufabrica));
      Dom.setValue("txt_dataentrega", convertDataBr(item.dataentrega));
      Dom.setValue("txt_previsao", item.previsao);

      Dom.setValue("txt_corteinicio", item.corteinicio);
      Dom.setValue("txt_cortefim", item.cortefim);
      Dom.setChecked("chk_corte", item.cortepausa);
      Dom.setValue("txt_corteid", item.corteresp);
      getUsuario(Dom.getValue("txt_corteid"), "txt_corteresp");
      Dom.setChecked("chk_corteinicio", false);
      Dom.setChecked("chk_cortefim", false);

      Dom.setValue("txt_customizacaoinicio", item.customizacaoinicio);
      Dom.setValue("txt_customizacaofim", item.customizacaofim);
      Dom.setChecked("chk_customizacao", item.customizacaopausa);
      Dom.setValue("txt_customizacaoid", item.customizacaoresp);
      getUsuario(Dom.getValue("txt_customizacaoid"), "txt_customizacaoresp");
      Dom.setChecked("chk_customizacaoinicio", false);
      Dom.setChecked("chk_customizacaofim", false);

      Dom.setValue("txt_coladeirainicio", item.coladeirainicio);
      Dom.setValue("txt_coladeirafim", item.coladeirafim);
      Dom.setChecked("chk_coladeira", item.coladeirapausa);
      Dom.setValue("txt_coladeiraid", item.coladeiraresp);
      getUsuario(Dom.getValue("txt_coladeiraid"), "txt_coladeiraresp");
      Dom.setChecked("chk_coladeirainicio", false);
      Dom.setChecked("chk_coladeirafim", false);

      Dom.setValue("txt_usinageminicio", item.usinageminicio);
      Dom.setValue("txt_usinagemfim", item.usinagemfim);
      Dom.setChecked("chk_usinagem", item.usinagempausa);
      Dom.setValue("txt_usinagemid", item.usinagemresp);
      getUsuario(Dom.getValue("txt_usinagemid"), "txt_usinagemresp");
      Dom.setChecked("chk_usinageminicio", false);
      Dom.setChecked("chk_usinagemfim", false);

      Dom.setValue("txt_montageminicio", item.montageminicio);
      Dom.setValue("txt_montagemfim", item.montagemfim);
      Dom.setValue("txt_montagemfim", item.montagemfim);
      Dom.setChecked("chk_montagem", item.montagempausa);
      Dom.setValue("txt_montagemid", item.montagemresp);
      getUsuario(Dom.getValue("txt_montagemid"), "txt_montagemresp");
      Dom.setChecked("chk_montageminicio", false);
      Dom.setChecked("chk_montagemfim", false);

      Dom.setValue("txt_paineisinicio", item.paineisinicio);
      Dom.setValue("txt_paineisfim", item.paineisfim);
      Dom.setValue("txt_paineisfim", item.paineisfim);
      Dom.setChecked("chk_paineis", item.paineispausa);
      Dom.setValue("txt_paineisid", item.paineisresp);
      getUsuario(Dom.getValue("txt_paineisid"), "txt_paineisresp");
      Dom.setChecked("chk_paineisinicio", false);
      Dom.setChecked("chk_paineisfim", false);

      Dom.setValue("txt_acabamentoinicio", item.acabamentoinicio);
      Dom.setValue("txt_acabamentofim", item.acabamentofim);
      Dom.setValue("txt_acabamentofim", item.acabamentofim);
      Dom.setChecked("chk_acabamento", item.acabamentopausa);
      Dom.setValue("txt_acabamentoid", item.acabamentoresp);
      getUsuario(Dom.getValue("txt_acabamentoid"), "txt_acabamentoresp");
      Dom.setChecked("chk_acabamentoinicio", false);
      Dom.setChecked("chk_acabamentofim", false);

      Dom.setValue("txt_embalageminicio", item.embalageminicio);
      Dom.setValue("txt_embalagemfim", item.embalagemfim);
      Dom.setValue("txt_embalagemfim", item.embalagemfim);
      Dom.setChecked("chk_embalagem", item.embalagempausa);
      Dom.setValue("txt_embalagemid", item.embalagemresp);
      getUsuario(Dom.getValue("txt_embalagemid"), "txt_embalagemresp");
      Dom.setChecked("chk_embalageminicio", false);
      Dom.setChecked("chk_embalagemfim", false);

      Dom.setValue("txt_observacoes", item.observacoes);
    });
  } catch (err) {
    alert(err.message);
  }
  document.getElementById("txt_scan").focus();
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
        p_ordemdecompra: Dom.getValue("txt_numoc"),
        p_corteinicio: Dom.getValue("txt_corteinicio"),
        p_cortefim: Dom.getValue("txt_cortefim"),
        p_corteresp: Dom.getValue("txt_corteid"),
        p_cortepausa: Dom.getChecked("chk_corte"),

        p_customizacaoinicio: Dom.getValue("txt_customizacaoinicio"),
        p_customizacaofim: Dom.getValue("txt_customizacaofim"),
        p_customizacaoresp: Dom.getValue("txt_customizacaoid"),
        p_customizacaopausa: Dom.getChecked("chk_customizacao"),

        p_coladeirainicio: Dom.getValue("txt_coladeirainicio"),
        p_coladeirafim: Dom.getValue("txt_coladeirafim"),
        p_coladeiraresp: Dom.getValue("txt_coladeiraid"),
        p_coladeirapausa: Dom.getChecked("chk_coladeira"),

        p_usinageminicio: Dom.getValue("txt_usinageminicio"),
        p_usinagemfim: Dom.getValue("txt_usinagemfim"),
        p_usinagemresp: Dom.getValue("txt_usinagemid"),
        p_usinagempausa: Dom.getChecked("chk_usinagem"),

        p_montageminicio: Dom.getValue("txt_montageminicio"),
        p_montagemfim: Dom.getValue("txt_montagemfim"),
        p_montagemresp: Dom.getValue("txt_montagemid"),
        p_montagempausa: Dom.getChecked("chk_montagem"),

        p_paineisinicio: Dom.getValue("txt_paineisinicio"),
        p_paineisfim: Dom.getValue("txt_paineisfim"),
        p_paineisresp: Dom.getValue("txt_paineisid"),
        p_paineispausa: Dom.getChecked("chk_paineis"),

        p_acabamentoinicio: Dom.getValue("txt_acabamentoinicio"),
        p_acabamentofim: Dom.getValue("txt_acabamentofim"),
        p_acabamentoresp: Dom.getValue("txt_acabamentoid"),
        p_acabamentopausa: Dom.getChecked("chk_acabamento"),

        p_embalageminicio: Dom.getValue("txt_embalageminicio"),
        p_embalagemfim: Dom.getValue("txt_embalagemfim"),
        p_embalagemresp: Dom.getValue("txt_embalagemid"),
        p_embalagempausa: Dom.getChecked("chk_embalagem"),

        p_observacoes: Dom.getValue("txt_observacoes"),
        p_previsao: Dom.getValue("txt_previsao"),
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
  Dom.setValue("txt_scan", "");
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
    Dom.setValue(element, dateTimeNow());
    Dom.setValue("txt_scan", "");
  } catch (erro) {
    messageInformation("error", "ERRO", `${erro}`);
  }
}

async function buttonReadCodeBar() {
  const returns = await modalBarCode();
  setDateTimeSetor(returns);
  Dom.setValue("txt_scan", "");
}

Dom.addEventBySelector("#bt_salvar", "click", setDataProducao);
Dom.addEventBySelector("#txt_corteid", "change", () =>
  getUsuario(Dom.getValue("txt_corteid"), "txt_corteresp")
);

Dom.addEventBySelector("#txt_customizacaoid", "change", () =>
  getUsuario(Dom.getValue("txt_customizacaoid"), "txt_customizacaoresp")
);

Dom.addEventBySelector("#txt_coladeiraid", "change", () =>
  getUsuario(Dom.getValue("txt_coladeiraid"), "txt_coladeiraresp")
);

Dom.addEventBySelector("#txt_usinagemid", "change", () =>
  getUsuario(Dom.getValue("txt_usinagemid"), "txt_usinagemresp")
);

Dom.addEventBySelector("#txt_montagemid", "change", () =>
  getUsuario(Dom.getValue("txt_montagemid"), "txt_montagemresp")
);

Dom.addEventBySelector("#txt_paineisid", "change", () =>
  getUsuario(Dom.getValue("txt_paineisid"), "txt_paineisresp")
);

Dom.addEventBySelector("#txt_acabamentoid", "change", () =>
  getUsuario(Dom.getValue("txt_acabamentoid"), "txt_acabamentoresp")
);

Dom.addEventBySelector("#txt_embalagemid", "change", () =>
  getUsuario(Dom.getValue("txt_embalagemid"), "txt_embalagemresp")
);

Dom.addEventBySelector("#txt_pedido", "change", () =>
  getProducaoPedido(Dom.getValue("txt_pedido"))
);

checkMachine();
Dom.addEventBySelector("#bt_scan", "click", buttonReadCodeBar);
Dom.addEventBySelector("#txt_scan", "change", () =>
  setDateTimeSetor(Dom.getValue("txt_scan"))
);

Dom.setFocus("txt_pedido");
