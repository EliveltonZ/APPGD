import {
  checkValue,
  setText,
  getText,
  getChecked,
  setChecked,
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
  addEventBySelector,
  getUsuario,
  sendMail,
  getConfig,
  checkPrevisao,
  getOperadores,
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
        <td style="text-align: center; ${corStatus}">${item.status}</td>
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

    addEventBySelector(".hover-col", "mouseover", showToolTip);
    addEventBySelector(".hover-col", "mouseleave", hideToolTip);
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

function getFirstColumnValue(td) {
  const row = td.parentNode;
  return row.cells[2].innerText;
}

async function handleClikedTable(event) {
  const td = event.target;
  const tr = td.closest(".open-modal-row");
  if (!tr || td.tagName !== "TD") return;
  const firstColumnValue = getFirstColumnValue(td);
  await getProducao(firstColumnValue);
  await fillTableAcessorios(firstColumnValue);
  createModal("modal");
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
      setChecked("chk_montagem", item.montagempausa);
      setText("txt_montagemid", item.montagemresp);
      getUsuario(getText("txt_montagemid"), "txt_montagemresp");
      setChecked("chk_montageminicio", false);
      setChecked("chk_montagemfim", false);

      setText("txt_paineisinicio", item.paineisinicio);
      setText("txt_paineisfim", item.paineisfim);
      setChecked("chk_paineis", item.paineispausa);
      setText("txt_paineisid", item.paineisresp);
      getUsuario(getText("txt_paineisid"), "txt_paineisresp");
      setChecked("chk_paineisinicio", false);
      setChecked("chk_paineisfim", false);

      setText("txt_acabamentoinicio", item.acabamentoinicio);
      setText("txt_acabamentofim", item.acabamentofim);
      setChecked("chk_acabamento", item.acabamentopausa);
      setText("txt_acabamentoid", item.acabamentoresp);
      getUsuario(getText("txt_acabamentoid"), "txt_acabamentoresp");
      setChecked("chk_acabamentoinicio", false);
      setChecked("chk_acabamentofim", false);

      setText("txt_observacoes", item.observacoes);
    });
    localStorage.setItem("previsao", convertDataBr(getText("txt_previsao")));
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
  const contrato = getText("txt_contrato");
  const cliente = getText("txt_cliente");
  const ambiente = getText("txt_ambiente");
  const previsao = convertDataBr(getText("txt_previsao"));
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
  ];

  operation.forEach((item) => {
    addEventBySelector(`#chk_${item}inicio`, "click", () =>
      setarDataHora(`#chk_${item}inicio`, `txt_${item}inicio`)
    );

    addEventBySelector(`#chk_${item}fim`, "click", () =>
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

document.addEventListener("resize", ajustarTamanhoModal);
document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("producao", "projetos_prd.html");
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

addEventBySelector("#bt_salvar", "click", setDataProducao);
addEventBySelector("#table", "dblclick", handleClikedTable);

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

addEventBySelector("#bt_funcionarios", "click", getUsuarios);
