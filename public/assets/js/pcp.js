import Swal from "./sweetalert2.esm.all.min.js";
import {
  setFocus,
  setData,
  getText,
  setText,
  getChecked,
  setChecked,
  loadPage,
  onmouseover,
  enableEnterAsTab,
  createModal,
  exportarParaExcel,
  clearInputFields,
  addEventBySelector,
  messageQuestion,
  messageInformation,
} from "./utils.js";

function convertDate(date) {
  if (date != "") {
    const parseData = date.split("-");
    return `${parseData[2]}/${parseData[1]}/${parseData[0]}`;
  }
}

async function setStartLote() {
  const result = await messageQuestion(
    "Iniciar Lote",
    "Deseja iniciar Lote ?",
    "Sim",
    "Não"
  );

  if (result.isConfirmed) {
    const data = {
      p_iniciado: getText("txt_data"),
      p_lote: getText("txt_loteiniciar"),
    };

    const response = await fetch("/setStartLote", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errText = await response.text();
      messageInformation(
        "error",
        "ERRO",
        `Não foi possivel iniciar o lote ${errText}`
      );
    } else {
      messageInformation(
        "success",
        "Successo",
        "Lote iniciado com sucesso !!!"
      );
    }
  }
}

async function getProjetoPcp() {
  if (getText("txt_numoc")) {
    const response = await fetch(
      `/getProjetoPcp?p_ordemdecompra=${getText("txt_numoc")}`
    );

    if (!response.ok) {
      const errText = await response.text();
      messageInformation(
        "error",
        "ERRO",
        "Erro ao buscar ordem de compra" + errText
      );
      clearInputFields();
    } else {
      const data = await response.json();
      data.forEach((element) => {
        setText("txt_contrato", element.p_contrato),
          setText("txt_cliente", element.p_cliente),
          setChecked("chk_urgente", element.p_urgente),
          setText("txt_codcc", element.p_codcc),
          setText("txt_ambiente", element.p_ambiente),
          setText("txt_numproj", element.p_numproj),
          setText("txt_lote", element.p_lote),
          setText("txt_pedido", element.p_pedido),
          setText("txt_chegada", convertDate(element.p_chegoufabrica)),
          setText("txt_entrega", convertDate(element.p_dataentrega)),
          setText("txt_tipo", element.p_tipo),
          setText("txt_pecas", element.p_peças),
          setText("txt_area", element.p_area);
      });
    }
  } else {
    clearInputFields();
  }
}

async function setProjetoPcp() {
  const result = await messageQuestion(null, "Deseja salvar alterações ?");

  if (result.isConfirmed) {
    const data = {
      p_ordemdecompra: getText("txt_numoc"),
      p_urgente: getChecked("chk_urgente"),
      p_codcc: getText("txt_codcc"),
      p_lote: getText("txt_lote"),
      p_pedido: getText("txt_pedido"),
      p_tipo: getText("txt_tipo"),
      p_pecas: getText("txt_pecas"),
      p_area: getText("txt_area"),
    };

    const response = await fetch("/setProjetoPcp", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errText = await response.text();
      messageInformation(
        "error",
        "Erro",
        `Não foi possível salvar alterações: ${errText}`
      );
    } else {
      messageInformation(
        "success",
        "Sucesso",
        `Alterações salvas com sucesso !!!`
      );
    }
  }
}

async function getLastLote() {
  const response = await fetch("/getLastLote");
  const data = await response.json();
  if (!response.ok) {
    messageInformation("error", "ERRO", "Erro ao buscar projetos na base");
  } else {
    document.getElementById("txt_gerar_lote").value = data[0].p_lote + 1;
  }
}

async function getProjetosLote() {
  const response = await fetch("/getProjetosLote");

  if (!response.ok) {
    messageInformation("error", "ERRO", "Erro ao buscar projetos na base");
  } else {
    const config = 'style="text-align: center"';
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    const data = await response.json();
    data.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
            <td ${config}>${item.p_ordemdecompra}</td>
            <td ${config}>${item.p_pedido}</td>
            <td ${config}>${item.p_codcc}</td>
            <td>${item.p_cliente}</td>
            <td>${item.p_ambiente}</td>
            <td ${config}><input type='checkbox'/></td>
            `;
      tbody.appendChild(tr);
    });
  }
}

async function openModalLote() {
  getLastLote();
  getProjetosLote();
  createModal("modal-3");
}

async function setLote(ordemdecompra, lote) {
  const data = {
    p_ordemdecompra: ordemdecompra,
    p_lote: lote,
  };

  const response = await fetch("/setLote", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function gerarLote() {
  const lote = getText("txt_gerar_lote");
  const result = await messageQuestion(null, `Deseja gerar o Lote ${lote} ?`);

  if (result.isConfirmed) {
    const linhas = document.querySelectorAll("tbody tr");
    const checkboxesMarcados = Array.from(linhas).filter((linha) => {
      const checkbox = linha.querySelector('input[type="checkbox"]');
      return checkbox && checkbox.checked;
    });

    if (checkboxesMarcados.length === 0) {
      messageInformation(
        "warning",
        "Atenção",
        "Nenhum item foi selecionado para gerar o lote."
      );
      return;
    }

    try {
      checkboxesMarcados.forEach((linha) => {
        const numOC = linha.querySelector("td:first-child").textContent;
        setLote(numOC, lote);
      });
      messageInformation("success", "Sucesso", "Lote gerado com sucesso!");
    } catch (err) {
      messageInformation(
        "error",
        "Erro",
        "Não foi possível gerar o lote: " + (err.message || err)
      );
    }
  }
}

async function exportarDados() {
  console.log(getText("txt_inicio"), getText("txt_fim"));
  const response = await fetch(
    `/exportarDados?data_inicio=${getText("txt_inicio")}&data_fim=${getText(
      "txt_fim"
    )}`
  );
  if (!response.ok) {
    const errtext = await response.text();
    messageInformation(
      "error",
      "ERRO",
      `Não foi possivel a conexão com banco de dados. ${errtext}`
    );
  } else {
    const data = await response.json();
    exportarParaExcel(data);
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  // loadPage("pcp", "pcp.html");
  setData("txt_data");
  onmouseover("table");
  enableEnterAsTab();
});

addEventBySelector("#txt_numoc", "blur", getProjetoPcp);
addEventBySelector("#bt_salvar", "click", setProjetoPcp);
addEventBySelector("#bt_startlote", "click", setStartLote);
addEventBySelector("#bt_export", "click", exportarDados);
addEventBySelector("#bt_gerar_lote", "click", gerarLote);
addEventBySelector("#bt_modal_lote", "click", openModalLote);
