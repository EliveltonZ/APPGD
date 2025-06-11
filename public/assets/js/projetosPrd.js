import Swal from "./sweetalert2.esm.all.min.js";
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
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";

loadPage("producao", "projetos_prd.html");

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
          checkValue(item.chegoufabrica)
        )}</td>
        <td style="text-align: center;">${convertDataBr(
          checkValue(item.dataentrega)
        )}</td>
        <td style="text-align: center;">${checkValue(item.lote)}</td>
        <td style="text-align: center; ${cor_status}">${item.status}</td>
        <td style="text-align: center;">${convertDataBr(
          checkValue(item.iniciado)
        )}</td>
        <td style="text-align: center;">${convertDataBr(
          checkValue(item.previsao)
        )}</td>
        <td style="text-align: center;">${convertDataBr(
          checkValue(item.pronto)
        )}</td>
        <td style="text-align: center;">${convertDataBr(
          checkValue(item.entrega)
        )}</td>
      `;

      num++;
      tbody.appendChild(tr);
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Não foi possível carregar os dados.",
    });
    console.error("Erro ao preencher tabela:", error);
  }
}

window.fillTableAcessorios = async function (ordemdecompra) {
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
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: `Não foi possível carregar os dados. ${err.message}`,
    });
  }
};

function getFirstColumnValue(td) {
  const row = td.parentNode;
  return row.cells[2].innerText;
}

window.clicked = function () {
  document
    .getElementById("table")
    .addEventListener("dblclick", async function (event) {
      const td = event.target;
      const tr = td.closest(".open-modal-row");

      if (!tr || td.tagName !== "TD") return;

      const firstColumnValue = getFirstColumnValue(td);

      await getProducao(firstColumnValue);
      await fillTableAcessorios(firstColumnValue);

      createModal("modal");
    });
};

window.getUsuario = async function (id, campo) {
  const response = await fetch(`/getUsuario?p_id=${id}`);
  if (!response.ok) {
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Não foi possivel buscar Usuario",
    });
    return;
  }
  const data = await response.json();
  const nome = data[0].nome;
  document.getElementById(campo).value = nome;
};

window.getProducao = async function (ordemdecompra) {
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

      setText("txt_corteinicio", item.corteinicio);
      setText("txt_cortefim", item.cortefim);
      setChecked("chk_corte", item.cortepausa);
      setText("txt_corteid", item.corteresp);
      getUsuario(document.getElementById("txt_corteid").value, "txt_corteresp");
      setChecked("chk_corteinicio", false);
      setChecked("chk_cortefim", false);

      setText("txt_customizacaoinicio", item.customizacaoinicio);
      setText("txt_customizacaofim", item.customizacaofim);
      setChecked("chk_customizacao", item.customizacaopausa);
      setText("txt_customizacaoid", item.customizacaoresp);
      getUsuario(
        document.getElementById("txt_customizacaoid").value,
        "txt_customizacaoresp"
      );
      setChecked("chk_customizacaoinicio", false);
      setChecked("chk_customizacaofim", false);

      setText("txt_coladeirainicio", item.coladeirainicio);
      setText("txt_coladeirafim", item.coladeirafim);
      setChecked("chk_coladeira", item.coladeirapausa);
      setText("txt_coladeiraid", item.coladeiraresp);
      getUsuario(
        document.getElementById("txt_coladeiraid").value,
        "txt_coladeiraresp"
      );
      setChecked("chk_coladeirainicio", false);
      setChecked("chk_coladeirafim", false);

      setText("txt_usinageminicio", item.usinageminicio);
      setText("txt_usinagemfim", item.usinagemfim);
      setChecked("chk_usinagem", item.usinagempausa);
      setText("txt_usinagemid", item.usinagemresp);
      getUsuario(
        document.getElementById("txt_usinagemid").value,
        "txt_usinagemresp"
      );
      setChecked("chk_usinageminicio", false);
      setChecked("chk_usinagemfim", false);

      setText("txt_montageminicio", item.montageminicio);
      setText("txt_montagemfim", item.montagemfim);
      setText("txt_montagemfim", item.montagemfim);
      setChecked("chk_montagem", item.montagempausa);
      setText("txt_montagemid", item.montagemresp);
      getUsuario(
        document.getElementById("txt_montagemid").value,
        "txt_montagemresp"
      );
      setChecked("chk_montageminicio", false);
      setChecked("chk_montagemfim", false);

      setText("txt_paineisinicio", item.paineisinicio);
      setText("txt_paineisfim", item.paineisfim);
      setText("txt_paineisfim", item.paineisfim);
      setChecked("chk_paineis", item.paineispausa);
      setText("txt_paineisid", item.paineisresp);
      getUsuario(
        document.getElementById("txt_paineisid").value,
        "txt_paineisresp"
      );
      setChecked("chk_paineisinicio", false);
      setChecked("chk_paineisfim", false);

      setText("txt_observacoes", item.observacoes);
    });
  } catch (err) {
    alert(err.message);
  }
};

window.setarDataHora = function (checkbox, text) {
  setDateTime(checkbox, text);
};

window.setDataProducao = async function () {
  const result = await Swal.fire({
    icon: "question",
    text: "Deseja confirmar Alterações?",
    showDenyButton: true,
    denyButtonText: "Cancelar",
    confirmButtonText: "Confirmar",
  });

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
        p_observacoes: getText("txt_observacoes"),
      };

      const response = await fetch("/setDataProducao", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.log(errText);
        Swal.fire({
          icon: "error",
          text: "Ocorreu um erro ao salvar os dados!",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Sucesso",
          text: "Alterações confirmadas com sucesso!",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: "Falha na comunicação com o servidor!" + err.message,
      });
    }
  }
};

window.readBarCode = function () {
  modalBarCode();
};

document.addEventListener("resize", ajustarTamanhoModal);
document.addEventListener("DOMContentLoaded", (event) => {
  fillTable();
  enableTableFilterSort("table");
  clicked();
  onmouseover("table");
  enableEnterAsTab();
  ajustarTamanhoModal();
  onclickHighlightRow("table");
  window.addEventListener("resize", ajustarTamanhoModal);
});

addEventById();
