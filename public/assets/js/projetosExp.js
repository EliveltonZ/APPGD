import Swal from "./sweetalert2.esm.all.min.js";
import {
  Dom,
  checkValue,
  convertDataBr,
  ajustarTamanhoModal,
  onmouseover,
  loadPage,
  setDate,
  setDateTime,
  enableEnterAsTab,
  colorStatus,
  colorAcessorios,
  onclickHighlightRow,
  createModal,
  messageInformation,
  messageQuestion,
  getConfig,
  setConfig,
  getUsuario,
  getOperadores,
  getIndexColumnValue,
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";

async function fillTableAcessorios(ordemdecompra) {
  const response = await fetch(
    `/fillTableAcessorios?p_ordemdecompra=${ordemdecompra}`
  );

  if (!response.ok) {
    messageInformation(
      "error",
      "ERRO",
      `não foi possivel carregar dados de acessorios !!! ${error.message}`
    );
  } else {
    const tbody = document.querySelectorAll("table tbody")[1];
    tbody.innerHTML = "";
    const data = await response.json();
    data.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
            <td style="font-size: 9px; display: none">${checkValue(
              item.id
            )}</td>
            <td style="font-size: 9px;">${checkValue(item.descricao)}</td>
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
  }
}

async function fillTable() {
  const container = document.getElementById("container");
  const scrollPos = container.scrollTop;
  const date_condition = Dom.getValue("txt_datafilter");

  if (date_condition) {
    const response = await fetch(
      `/fillTableExp?data_condition=${date_condition}`
    );
    const data = await response.json();

    if (!response.ok) {
      messageInformation("error", "Erro", "Não foi possivel carregar os dados");
    } else {
      const tbody = document.querySelector("tbody");
      tbody.innerHTML = "";

      let num = 1;
      data.forEach((item) => {
        const tr = document.createElement("tr");

        tr.classList.add("open-modal-row");
        tr.classList.add("fw-bold");

        const cor_status = colorStatus(item.status);
        const cor_a = colorAcessorios(item.total);

        tr.innerHTML = `
            <td style="text-align: center;">${num}</td>
            <td style="text-align: center; ${cor_a}">${item.a}</td>
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
              checkValue(item.dataentrega)
            )}</td>
            <td style="text-align: center;">${convertDataBr(
              checkValue(item.chegoufabrica)
            )}</td>
            <td style="text-align: center;">${checkValue(item.lote)}</td>
            <td style="text-align: center; ${cor_status}">${item.status}</td>
            <td style="text-align: center;">${convertDataBr(
              checkValue(item.iniciado)
            )}</td>
            <td style="text-align: center;">${convertDataBr(
              checkValue(item.pronto)
            )}</td>
            <td style="text-align: center;">${convertDataBr(
              checkValue(item.entrega)
            )}</td>
            `;

        tbody.appendChild(tr);

        num = num + 1;
      });
      container.scrollTop = scrollPos;
    }
  }
}

async function handleClick(event) {
  clearInputFields();
  const td = event.target;
  const tr = td.closest(".open-modal-row");
  if (!tr || td.tagName !== "TD") return;
  const firstColumnValue = getIndexColumnValue(td, 2);
  const secondColumnValue = getIndexColumnValue(td, 5);
  if (secondColumnValue != "-") {
    await getExpedicao(firstColumnValue);
    await fillTableAcessorios(firstColumnValue);
    createModal("modal");
  } else {
    messageInformation("warning", "ATENÇÃO", "Projeto não Calculado");
  }
}

function clearInputFields() {
  document.querySelectorAll('input[type="text"]').forEach((input) => {
    input.value = "";
  });

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });

  document.querySelectorAll("Select").forEach((input) => {
    input.value = "";
  });
}

async function getExpedicao(ordemdecompra) {
  const response = await fetch(
    `/getExpedicao?p_ordemdecompra=${ordemdecompra}`
  );

  if (!response.ok) {
    const errText = await response.text();
    messageInformation("error", "ERRO", `${errText}`);
  } else {
    const data = await response.json();
    data.forEach((item) => {
      Dom.setValue("txt_numoc", item.ordemdecompra);
      Dom.setValue("txt_cliente", item.cliente);
      Dom.setValue("txt_contrato", item.contrato);
      Dom.setValue("txt_codcc", item.codcc);
      Dom.setValue("txt_ambiente", item.ambiente);
      Dom.setValue("txt_numproj", item.numproj);
      Dom.setValue("txt_lote", item.lote);
      Dom.setValue(
        "txt_chegoufabrica",
        convertDataBr(checkValue(item.chegoufabrica))
      );
      Dom.setValue(
        "txt_dataentrega",
        convertDataBr(checkValue(item.dataentrega))
      );
      Dom.setValue("txt_pronto", item.pronto);
      Dom.setValue("txt_entrega", item.entrega);
      Dom.setChecked("chk_pendencia", item.pendencia);
      Dom.setChecked("chk_parcial", item.parcial);
      Dom.setValue("txt_separacao", item.separacao);
      Dom.setValue("txt_prontoid", item.conferido);
      getUsuario(Dom.getValue("txt_prontoid"), "txt_prontoresp");
      Dom.setValue("txt_entregaid", item.motorista);
      getUsuario(Dom.getValue("txt_entregaid"), "txt_entregaresp");
      Dom.setValue("txt_embalageminicio", item.embalageminicio);
      Dom.setValue("txt_embalagemfim", item.embalagemfim);
      Dom.setChecked("chk_embalagem", item.embalagempausa);
      Dom.setValue("txt_embalagemid", item.embalagemresp);
      getUsuario(Dom.getValue("txt_embalagemid"), "txt_embalagemresp");
      Dom.setChecked("chk_acessoriosavulsos", item.avulso);
      Dom.setValue("txt_acessoriosavulsosl", item.avulsol);
      Dom.setValue("txt_acessoriosavulsosq", item.avulsoq);
      Dom.setChecked("chk_cabide", item.cabide);
      Dom.setValue("txt_cabidel", item.cabidel);
      Dom.setValue("txt_cabideq", item.cabideq);
      Dom.setChecked("chk_paineis", item.paineis);
      Dom.setValue("txt_paineisl", item.paineisl);
      Dom.setValue("txt_paineisq", item.paineisq);
      Dom.setChecked("chk_pecapintura", item.pecaspintadas);
      Dom.setValue("txt_pecapintural", item.pecaspintadasl);
      Dom.setValue("txt_pecapinturaq", item.pecaspintadasq);
      Dom.setChecked("chk_portaaluminio", item.portaaluminio);
      Dom.setValue("txt_portaaluminiol", item.portaaluminiol);
      Dom.setValue("txt_portaaluminioq", item.portaaluminioq);
      Dom.setChecked("chk_serralheria", item.serralheria);
      Dom.setValue("txt_serralherial", item.serralherial);
      Dom.setValue("txt_serralheriaq", item.serralheriaq);
      Dom.setChecked("chk_tapecaria", item.tapecaria);
      Dom.setValue("txt_tapecarial", item.tapecarial);
      Dom.setValue("txt_tapecariaq", item.tapecariaq);
      Dom.setChecked("chk_trilhos", item.trilho);
      Dom.setValue("txt_trilhosl", item.trilhol);
      Dom.setValue("txt_trilhosq", item.trilhoq);
      Dom.setChecked("chk_vidroespelho", item.vidros);
      Dom.setValue("txt_vidroespelhol", item.vidrosl);
      Dom.setValue("txt_vidroespelhoq", item.vidrosq);
      Dom.setChecked("chk_volumesmodulacao", item.volmod);
      Dom.setValue("txt_volumesmodulacaol", item.modulosl);
      Dom.setValue("txt_volumesmodulacaoq", item.modulosq);
      Dom.setValue("txt_volmod", item.totalvolumes);
      Dom.setValue("txt_tamanho", item.tamanho);
      Dom.setValue("txt_observacoes", item.observacoes);
      Dom.setChecked("chk_embalageminicio", false);
      Dom.setChecked("chk_embalagemfim", false);
      Dom.setChecked("chk_etapas", item.etapa);
      Dom.setInnerHtml("txt_etapas", setEtapa(item.etapa, "txt_etapas"));
    });
  }
}

function setEtapa(value, element) {
  const item = document.getElementById(element);
  if (value) {
    item.style.color = "green";
    return "CONCLUIDO";
  }
  item.style.color = "red";
  return "EM ABERTO";
}

async function setDataExpedicao() {
  const result = await messageQuestion(null, "Deseja confirmar Alterações?");
  if (result.isConfirmed) {
    try {
      const data = {
        p_ordemdecompra: Dom.getValue("txt_numoc"),
        p_pronto: Dom.getValue("txt_pronto"),
        p_entrega: Dom.getValue("txt_entrega"),
        p_pendencia: Dom.getChecked("chk_pendencia"),
        p_parcial: Dom.getChecked("chk_parcial"),
        p_separacao: Dom.getValue("txt_separacao"),
        p_conferido: Dom.getValue("txt_prontoid"),
        p_motorista: Dom.getValue("txt_entregaid"),
        p_embalageminicio: Dom.getValue("txt_embalageminicio"),
        p_embalagemfim: Dom.getValue("txt_embalagemfim"),
        p_embalagempausa: Dom.getChecked("chk_embalagem"),
        p_embalagemresp: Dom.getValue("txt_embalagemid"),
        p_avulso: Dom.getChecked("chk_acessoriosavulsos"),
        p_avulsol: Dom.getValue("txt_acessoriosavulsosl"),
        p_avulsoq: Dom.getValue("txt_acessoriosavulsosq"),
        p_cabide: Dom.getChecked("chk_cabide"),
        p_cabidel: Dom.getValue("txt_cabidel"),
        p_cabideq: Dom.getValue("txt_cabideq"),
        p_paineis: Dom.getChecked("chk_paineis"),
        p_paineisl: Dom.getValue("txt_paineisl"),
        p_paineisq: Dom.getValue("txt_paineisq"),
        p_pecaspintadas: Dom.getChecked("chk_pecapintura"),
        p_pecaspintadasl: Dom.getValue("txt_pecapintural"),
        p_pecaspintadasq: Dom.getValue("txt_pecapinturaq"),
        p_portaaluminio: Dom.getChecked("chk_portaaluminio"),
        p_portaaluminiol: Dom.getValue("txt_portaaluminiol"),
        p_portaaluminioq: Dom.getValue("txt_portaaluminioq"),
        p_serralheria: Dom.getChecked("chk_serralheria"),
        p_serralherial: Dom.getValue("txt_serralherial"),
        p_serralheriaq: Dom.getValue("txt_serralheriaq"),
        p_tapecaria: Dom.getChecked("chk_tapecaria"),
        p_tapecarial: Dom.getValue("txt_tapecarial"),
        p_tapecariaq: Dom.getValue("txt_tapecariaq"),
        p_trilho: Dom.getChecked("chk_trilhos"),
        p_trilhol: Dom.getValue("txt_trilhosl"),
        p_trilhoq: Dom.getValue("txt_trilhosq"),
        p_vidros: Dom.getChecked("chk_vidroespelho"),
        p_vidrosl: Dom.getValue("txt_vidroespelhol"),
        p_vidrosq: Dom.getValue("txt_vidroespelhoq"),
        p_volmod: Dom.getChecked("chk_volumesmodulacao"),
        p_modulosl: Dom.getValue("txt_volumesmodulacaol"),
        p_modulosq: Dom.getValue("txt_volumesmodulacaoq"),
        p_totalvolumes: Dom.getValue("txt_volmod"),
        p_tamanho: Dom.getValue("txt_tamanho"),
        p_observacoes: Dom.getValue("txt_observacoes"),
      };

      if (!Dom.getChecked("chk_etapas")) {
        if (Dom.getValue("txt_pronto") || Dom.getValue("txt_entrega")) {
          messageInformation(
            "warning",
            "ATENÇÃO",
            "Projeto com etapas em ABERTO"
          );
          return;
        }
      }

      const response = await fetch("/setDataExpedicao", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        messageInformation(
          "error",
          "ERRO",
          `Ocorreu um erro ao salvar os dados! ${error.message}`
        );
      } else {
        await fillTable();
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
        `Falha na comunicação com o servidor! ${err.message}`
      );
    }
  }
}

async function getDataFilterExp() {
  const data = await getConfig(1);
  Dom.setValue("txt_datafilter", data[0].p_data);
  fillTable();
}

async function setDataFilterExp() {
  const data = {
    p_id: 1,
    p_date: Dom.getValue("txt_datafilter"),
  };
  await setConfig(data);
}

function setarDataHora(checkbox, text) {
  setDateTime(checkbox, text);
}

function handleClickCheckbox() {
  const operation = ["embalagem"];

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

document.addEventListener("resize", ajustarTamanhoModal);

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("expedicao", "expedicao.html");
  enableEnterAsTab();
  getDataFilterExp();
  onmouseover("table");
  enableTableFilterSort("table");
  onclickHighlightRow("table");
  window.addEventListener("resize", ajustarTamanhoModal);
  handleClickCheckbox();
  filltableUsuarios();
});

Dom.addEventBySelector("#table", "dblclick", handleClick);
Dom.addEventBySelector("#txt_datafilter", "blur", fillTable);
Dom.addEventBySelector("#txt_datafilter", "blur", setDataFilterExp);
Dom.addEventBySelector("#bt_salvar", "click", setDataExpedicao);

Dom.addEventBySelector("#txt_embalagemid", "blur", () =>
  getUsuario(Dom.getValue("txt_embalagemid"), "txt_embalagemresp")
);

Dom.addEventBySelector("#txt_prontoid", "blur", () =>
  getUsuario(Dom.getValue("txt_prontoid"), "txt_prontoresp")
);

Dom.addEventBySelector("#txt_entregaid", "blur", () =>
  getUsuario(Dom.getValue("txt_entregaid"), "txt_entregaresp")
);

Dom.addEventBySelector(`#chk_pronto`, "click", () =>
  setDate(`#chk_pronto`, `txt_pronto`)
);

Dom.addEventBySelector(`#chk_entrega`, "click", () =>
  setDate(`#chk_entrega`, `txt_entrega`)
);

Dom.addEventBySelector(`#chk_separacao`, "click", () =>
  setDateTime(`#chk_separacao`, `txt_separacao`)
);

Dom.addEventBySelector("#bt_funcionarios", "click", getUsuarios);
