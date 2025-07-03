import Swal from "./sweetalert2.esm.all.min.js";
import {
  checkValue,
  setText,
  getText,
  setChecked,
  getChecked,
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
  addEventBySelector,
  messageInformation,
  messageQuestion,
  getDateFilter,
  setDateFilter,
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
  const date_condition = getText("txt_datafilter");

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

function getFirstColumnValue(td) {
  const row = td.parentNode;
  return row.cells[2].innerText;
}

async function handleClick(event) {
  clearInputFields();
  const td = event.target;
  const tr = td.closest(".open-modal-row");
  if (!tr || td.tagName !== "TD") return;
  const firstColumnValue = getFirstColumnValue(td);
  await getExpedicao(firstColumnValue);
  await fillTableAcessorios(firstColumnValue);
  createModal("modal");
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

async function getUsuario(id, campo) {
  const response = await fetch(`/getUsuario?p_id=${id}`);
  if (!response.ok) {
    messageInformation("error", "ERRO", "Não foi possivel buscar Usuario");
    return;
  }
  const data = await response.json();
  const nome = data[0].nome;
  document.getElementById(campo).value = nome;
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
      setText("txt_numoc", item.ordemdecompra);
      setText("txt_cliente", item.cliente);
      setText("txt_contrato", item.contrato);
      setText("txt_codcc", item.codcc);
      setText("txt_ambiente", item.ambiente);
      setText("txt_numproj", item.numproj);
      setText("txt_lote", item.lote);
      setText(
        "txt_chegoufabrica",
        convertDataBr(checkValue(item.chegoufabrica))
      );
      setText("txt_dataentrega", convertDataBr(checkValue(item.dataentrega)));
      setText("txt_pronto", item.pronto);
      setText("txt_entrega", item.entrega);
      setChecked("chk_pendencia", item.pendencia);
      setChecked("chk_parcial", item.parcial);
      setText("txt_separacao", item.separacao);
      setText("txt_prontoid", item.conferido);
      getUsuario(getText("txt_prontoid"), "txt_prontoresp");
      setText("txt_entregaid", item.motorista);
      getUsuario(getText("txt_entregaid"), "txt_entregaresp");
      setText("txt_embalageminicio", item.embalageminicio);
      setText("txt_embalagemfim", item.embalagemfim);
      setChecked("chk_embalagem", item.embalagempausa);
      setText("txt_embalagemid", item.embalagemresp);
      getUsuario(getText("txt_embalagemid"), "txt_embalagemresp");
      setChecked("chk_acessoriosavulsos", item.avulso);
      setText("txt_acessoriosavulsosl", item.avulsol);
      setText("txt_acessoriosavulsosq", item.avulsoq);
      setChecked("chk_cabide", item.cabide);
      setText("txt_cabidel", item.cabidel);
      setText("txt_cabideq", item.cabideq);
      setChecked("chk_paineis", item.paineis);
      setText("txt_paineisl", item.paineisl);
      setText("txt_paineisq", item.paineisq);
      setChecked("chk_pecapintura", item.pecaspintadas);
      setText("txt_pecapintural", item.pecaspintadasl);
      setText("txt_pecapinturaq", item.pecaspintadasq);
      setChecked("chk_portaaluminio", item.portaaluminio);
      setText("txt_portaaluminiol", item.portaaluminiol);
      setText("txt_portaaluminioq", item.portaaluminioq);
      setChecked("chk_serralheria", item.serralheria);
      setText("txt_serralherial", item.serralherial);
      setText("txt_serralheriaq", item.serralheriaq);
      setChecked("chk_tapecaria", item.tapecaria);
      setText("txt_tapecarial", item.tapecarial);
      setText("txt_tapecariaq", item.tapecariaq);
      setChecked("chk_trilhos", item.trilho);
      setText("txt_trilhosl", item.trilhol);
      setText("txt_trilhosq", item.trilhoq);
      setChecked("chk_vidroespelho", item.vidros);
      setText("txt_vidroespelhol", item.vidrosl);
      setText("txt_vidroespelhoq", item.vidrosq);
      setChecked("chk_volumesmodulacao", item.volmod);
      setText("txt_volumesmodulacaol", item.modulosl);
      setText("txt_volumesmodulacaoq", item.modulosq);
      setText("txt_volmod", item.totalvolumes);
      setText("txt_tamanho", item.tamanho);
      setText("txt_observacoes", item.observacoes);
      setChecked("chk_embalageminicio", false);
      setChecked("chk_embalagemfim", false);
    });
  }
}

async function setDataExpedicao() {
  const result = await messageQuestion(null, "Deseja confirmar Alterações?");

  if (result.isConfirmed) {
    try {
      const data = {
        p_ordemdecompra: getText("txt_numoc"),
        p_pronto: getText("txt_pronto"),
        p_entrega: getText("txt_entrega"),
        p_pendencia: getChecked("chk_pendencia"),
        p_parcial: getChecked("chk_parcial"),
        p_separacao: getText("txt_separacao"),
        p_conferido: getText("txt_prontoid"),
        p_motorista: getText("txt_entregaid"),
        p_embalageminicio: getText("txt_embalageminicio"),
        p_embalagemfim: getText("txt_embalagemfim"),
        p_embalagempausa: getChecked("chk_embalagem"),
        p_embalagemresp: getText("txt_embalagemid"),
        p_avulso: getChecked("chk_acessoriosavulsos"),
        p_avulsol: getText("txt_acessoriosavulsosl"),
        p_avulsoq: getText("txt_acessoriosavulsosq"),
        p_cabide: getChecked("chk_cabide"),
        p_cabidel: getText("txt_cabidel"),
        p_cabideq: getText("txt_cabideq"),
        p_paineis: getChecked("chk_paineis"),
        p_paineisl: getText("txt_paineisl"),
        p_paineisq: getText("txt_paineisq"),
        p_pecaspintadas: getChecked("chk_pecapintura"),
        p_pecaspintadasl: getText("txt_pecapintural"),
        p_pecaspintadasq: getText("txt_pecapinturaq"),
        p_portaaluminio: getChecked("chk_portaaluminio"),
        p_portaaluminiol: getText("txt_portaaluminiol"),
        p_portaaluminioq: getText("txt_portaaluminioq"),
        p_serralheria: getChecked("chk_serralheria"),
        p_serralherial: getText("txt_serralherial"),
        p_serralheriaq: getText("txt_serralheriaq"),
        p_tapecaria: getChecked("chk_tapecaria"),
        p_tapecarial: getText("txt_tapecarial"),
        p_tapecariaq: getText("txt_tapecariaq"),
        p_trilho: getChecked("chk_trilhos"),
        p_trilhol: getText("txt_trilhosl"),
        p_trilhoq: getText("txt_trilhosq"),
        p_vidros: getChecked("chk_vidroespelho"),
        p_vidrosl: getText("txt_vidroespelhol"),
        p_vidrosq: getText("txt_vidroespelhoq"),
        p_volmod: getChecked("chk_volumesmodulacao"),
        p_modulosl: getText("txt_volumesmodulacaol"),
        p_modulosq: getText("txt_volumesmodulacaoq"),
        p_totalvolumes: getText("txt_volmod"),
        p_tamanho: getText("txt_tamanho"),
        p_observacoes: getText("txt_observacoes"),
      };

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
  const data = await getDateFilter(1);
  setText("txt_datafilter", data[0].p_data);
  fillTable();
}

async function setDataFilterExp() {
  const data = {
    p_id: 1,
    p_date: getText("txt_datafilter"),
  };
  await setDateFilter(data);
}

function handleClickCheckbox() {
  const operation = ["embalagem"];

  operation.forEach((item) => {
    addEventBySelector(`#chk_${item}inicio`, "click", () =>
      setarDataHora(`#chk_${item}inicio`, `txt_${item}inicio`)
    );

    addEventBySelector(`#chk_${item}fim`, "click", () =>
      setarDataHora(`#chk_${item}fim`, `txt_${item}fim`)
    );
  });
}

document.addEventListener("resize", ajustarTamanhoModal);

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("expedicao", "projetos_exp.html");
  enableEnterAsTab();
  getDataFilterExp();
  onmouseover("table");
  enableTableFilterSort("table");
  onclickHighlightRow("table");
  window.addEventListener("resize", ajustarTamanhoModal);
  handleClickCheckbox();
});

addEventBySelector("#table", "dblclick", handleClick);
addEventBySelector("#txt_datafilter", "blur", fillTable);
addEventBySelector("#txt_datafilter", "blur", setDataFilterExp);
addEventBySelector("#bt_salvar", "click", setDataExpedicao);

addEventBySelector("#txt_embalagemid", "blur", () =>
  getUsuario(getText("txt_embalagemid"), "txt_embalagemresp")
);

addEventBySelector("#txt_prontoid", "blur", () =>
  getUsuario(getText("txt_prontoid"), "txt_prontoresp")
);

addEventBySelector("#txt_entregaid", "blur", () =>
  getUsuario(getText("txt_entregaid"), "txt_entregaresp")
);

addEventBySelector(`#chk_pronto`, "click", () =>
  setDate(`#chk_pronto`, `txt_pronto`)
);

addEventBySelector(`#chk_entrega`, "click", () =>
  setDate(`#chk_entrega`, `txt_entrega`)
);

addEventBySelector(`#chk_separacao`, "click", () =>
  setDateTime(`#chk_separacao`, `txt_separacao`)
);
