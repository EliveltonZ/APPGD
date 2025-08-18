import {
  Dom,
  checkValue,
  convertDataBr,
  ajustarTamanhoModal,
  onmouseover,
  loadPage,
  setDateTime,
  enableEnterAsTab,
  colorStatus,
  colorAcessorios,
  onclickHighlightRow,
  createModal,
  modalBarCode,
  messageInformation,
  messageQuestion,
  getUsuario,
  sendMail,
  getConfig,
  checkPrevisao,
  getOperadores,
  getIndexColumnValue,
  getCookie,
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";

async function fillTable() {
  try {
    const response = await fetch("/fillTablePrd");

    if (!response.ok) {
      throw new Error("Erro ao buscar os dados");
    }

    const data = await response.json();

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    let num = 1;

    data.forEach((item) => {
      const tr = document.createElement("tr");
      tr.classList.add("open-modal-row");
      tr.classList.add("fw-bold");

      const corStatus = colorStatus(item.status);
      const corA = colorAcessorios(item.total);
      const corPrev = checkPrevisao(item.previsao, item.dataentrega);

      tr.innerHTML = `
        <td style="text-align: center;">${num}</td>
        <td class="hover-col" style="text-align: center; ${corA}">${item.a}</td>
        <td style="text-align: center;">${item.ordemdecompra}</td>
        <td style="text-align: center;">${checkValue(item.pedido)}</td>
        <td style="text-align: center;">${checkValue(item.etapa)}</td>
        <td style="text-align: center;">${checkValue(item.codcc)}</td>
        <td>${item.cliente}</td>
        <td style="text-align: center;">${checkValue(item.contrato)}</td>
        <td style="text-align: center;">${checkValue(item.numproj)}</td>
        <td>${item.ambiente}</td>
        <td style="text-align: center;">${checkValue(item.tipo)}</td>
        <td style="text-align: center;">${convertDataBr(
          checkValue(item.chegoufabrica)
        )}</td>
        <td style="text-align: center;">${convertDataBr(
          checkValue(item.dataentrega)
        )}</td>
        <td style="text-align: center;">${checkValue(item.lote)}</td>
        <td class="fw-bold" style="text-align: center; ${corStatus}">${
        item.status
      }</td>
        <td style="text-align: center;">${convertDataBr(
          checkValue(item.iniciado)
        )}</td>
        <td style="text-align: center; ${corPrev}">${convertDataBr(
        checkValue(item.previsao)
      )}</td>
        <td style="text-align: center;">${convertDataBr(
          checkValue(item.pronto)
        )}</td>
        <td style="text-align: center;">${convertDataBr(
          checkValue(item.entrega)
        )}</td>
        <td class="info-col" style="display:none;">${checkValue(
          item.observacoes
        )}</td>
      `;
      num++;
      tbody.appendChild(tr);
    });

    Dom.addEventBySelector(".hover-col", "mouseover", showToolTip);
    Dom.addEventBySelector(".hover-col", "mouseleave", hideToolTip);
  } catch (error) {
    messageInformation("error", "Erro", "Não foi possível carregar os dados.");
    console.error("Erro ao preencher tabela:", error);
  }
}

async function fillTableAcessorios(ordemdecompra) {
  const response = await fetch(
    `/fillTableAcessorios?p_ordemdecompra=${ordemdecompra}`
  );

  try {
    const data = await response.json();

    const tbody = document.querySelectorAll("table tbody")[1];
    tbody.innerHTML = "";

    data.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
            <td style="font-size: 9px; display: none">${item.id}</td>
            <td style="font-size: 9px;">${item.descricao}</td>
            <td style="font-size: 9px; text-align: center;">${checkValue(
              item.medida
            )}</td>
            <td style="font-size: 9px; text-align: center;">${checkValue(
              item.qtd
            )}</td>
            <td style="font-size: 9px; text-align: center;">${convertDataBr(
              checkValue(item.previsao)
            )}</td>
            <td style="font-size: 9px; text-align: center;">${convertDataBr(
              checkValue(item.datacompra)
            )}</td>
            <td style="font-size: 9px; text-align: center;">${convertDataBr(
              checkValue(item.recebido)
            )}</td>
            `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    messageInformation(
      "error",
      "ERRO",
      `Não foi possível carregar os dados. ${err.message}`
    );
  }
}

async function handleClikedTable(event) {
  const td = event.target;
  const tr = td.closest(".open-modal-row");
  if (!tr || td.tagName !== "TD") return;
  const firstColumnValue = getIndexColumnValue(td, 2);
  const secondColumnValue = getIndexColumnValue(td, 5);
  if (secondColumnValue != "-") {
    await getProducao(firstColumnValue);
    await fillTableAcessorios(firstColumnValue);
    createModal("modal");
  } else {
    messageInformation("warning", "ATENÇÃO", "Projeto não Calculado");
  }
}

function showToolTip(event) {
  const tooltip = document.getElementById("tooltips");
  if (event) {
    const text =
      event.target.parentElement.querySelector(".info-col").textContent;
    tooltip.textContent = text;
    tooltip.style.display = "block";
    const rect = event.target.getBoundingClientRect();
    tooltip.style.top = rect.top + window.scrollY + rect.height + 5 + "px";
    tooltip.style.left = rect.left + window.scrollX + "px";
  }
}

function hideToolTip() {
  const tooltip = document.getElementById("tooltips");
  tooltip.style.display = "none";
}

async function getProducao(ordemdecompra) {
  try {
    const response = await fetch(
      `/getProducao?p_ordemdecompra=${ordemdecompra}`
    );

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
      Dom.setChecked("chk_montagem", item.montagempausa);
      Dom.setValue("txt_montagemid", item.montagemresp);
      getUsuario(Dom.getValue("txt_montagemid"), "txt_montagemresp");
      Dom.setChecked("chk_montageminicio", false);
      Dom.setChecked("chk_montagemfim", false);

      Dom.setValue("txt_paineisinicio", item.paineisinicio);
      Dom.setValue("txt_paineisfim", item.paineisfim);
      Dom.setChecked("chk_paineis", item.paineispausa);
      Dom.setValue("txt_paineisid", item.paineisresp);
      getUsuario(Dom.getValue("txt_paineisid"), "txt_paineisresp");
      Dom.setChecked("chk_paineisinicio", false);
      Dom.setChecked("chk_paineisfim", false);

      Dom.setValue("txt_acabamentoinicio", item.acabamentoinicio);
      Dom.setValue("txt_acabamentofim", item.acabamentofim);
      Dom.setChecked("chk_acabamento", item.acabamentopausa);
      Dom.setValue("txt_acabamentoid", item.acabamentoresp);
      getUsuario(Dom.getValue("txt_acabamentoid"), "txt_acabamentoresp");
      Dom.setChecked("chk_acabamentoinicio", false);
      Dom.setChecked("chk_acabamentofim", false);

      Dom.setValue("txt_embalageminicio", item.embalageminicio);
      Dom.setValue("txt_embalagemfim", item.embalagemfim);
      Dom.setChecked("chk_embalagem", item.embalagempausa);
      Dom.setValue("txt_embalagemid", item.embalagemresp);
      getUsuario(Dom.getValue("txt_embalagemid"), "txt_embalagemresp");
      Dom.setChecked("chk_embalageminicio", false);
      Dom.setChecked("chk_embalagemfim", false);

      Dom.setValue("txt_observacoes", item.observacoes);
    });
    localStorage.setItem(
      "previsao",
      convertDataBr(Dom.getValue("txt_previsao"))
    );
  } catch (err) {
    alert(err.message);
  }
}

function setarDataHora(checkbox, text) {
  setDateTime(checkbox, text);
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
        await sendEmail();
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

async function sendEmail() {
  const prevOld = localStorage.getItem("previsao");
  const contrato = Dom.getValue("txt_contrato");
  const cliente = Dom.getValue("txt_cliente");
  const ambiente = Dom.getValue("txt_ambiente");
  const previsao = convertDataBr(Dom.getValue("txt_previsao"));
  if (prevOld != previsao) {
    const email = await getConfig(1);
    const text = `*** ${contrato} - ${cliente} - ${ambiente} - PREV: ${previsao} ***`;
    const data = {
      destination: email[0].p_email,
      title: text,

      body: "Previsão Alterada",
    };
    await sendMail(data);
  }
}

function handleClickCheckbox() {
  const operation = [
    "corte",
    "customizacao",
    "coladeira",
    "usinagem",
    "montagem",
    "paineis",
    "acabamento",
    "embalagem",
  ];

  operation.forEach((item) => {
    Dom.addEventBySelector(`#chk_${item}inicio`, "click", () =>
      setarDataHora(`#chk_${item}inicio`, `txt_${item}inicio`)
    );

    Dom.addEventBySelector(`#chk_${item}fim`, "click", () =>
      setarDataHora(`#chk_${item}fim`, `txt_${item}fim`)
    );
  });
}

function getUsuarios() {
  const meuHTML = document.getElementById("modal-1").innerHTML;
  messageInformation(null, null, meuHTML);
}

async function filltableUsuarios() {
  const data = await getOperadores();
  const tbody = document.querySelector("#modal-1 tbody");
  tbody.innerHTML = "";
  data.forEach((element) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${element.p_id}</td>
      <td>${element.p_nome}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function checkCookie() {
  const teste = await getCookie("id");
  if (!teste) {
    window.location.href = "index.html";
  } else {
    console.log(`valor ${teste}`);
  }
}

document.addEventListener("resize", ajustarTamanhoModal);
document.addEventListener("DOMContentLoaded", (event) => {
  checkCookie();
  loadPage("producao", "producao.html");
  fillTable();
  filltableUsuarios();
  enableTableFilterSort("table");
  onmouseover("table");
  enableEnterAsTab();
  ajustarTamanhoModal();
  onclickHighlightRow("table");
  window.addEventListener("resize", ajustarTamanhoModal);
  handleClickCheckbox();
});

Dom.addEventBySelector("#bt_salvar", "click", setDataProducao);
Dom.addEventBySelector("#table", "dblclick", handleClikedTable);

Dom.addEventBySelector("#txt_corteid", "blur", () =>
  getUsuario(Dom.getValue("txt_corteid"), "txt_corteresp")
);

Dom.addEventBySelector("#txt_customizacaoid", "blur", () =>
  getUsuario(Dom.getValue("txt_customizacaoid"), "txt_customizacaoresp")
);

Dom.addEventBySelector("#txt_coladeiraid", "blur", () =>
  getUsuario(Dom.getValue("txt_coladeiraid"), "txt_coladeiraresp")
);

Dom.addEventBySelector("#txt_usinagemid", "blur", () =>
  getUsuario(Dom.getValue("txt_usinagemid"), "txt_usinagemresp")
);

Dom.addEventBySelector("#txt_montagemid", "blur", () =>
  getUsuario(Dom.getValue("txt_montagemid"), "txt_montagemresp")
);

Dom.addEventBySelector("#txt_paineisid", "blur", () =>
  getUsuario(Dom.getValue("txt_paineisid"), "txt_paineisresp")
);

Dom.addEventBySelector("#txt_acabamentoid", "blur", () =>
  getUsuario(Dom.getValue("txt_acabamentoid"), "txt_acabamentoresp")
);

Dom.addEventBySelector("#txt_embalagemid", "blur", () =>
  getUsuario(Dom.getValue("txt_embalagemid"), "txt_embalagemresp")
);

Dom.addEventBySelector("#bt_funcionarios", "click", getUsuarios);
