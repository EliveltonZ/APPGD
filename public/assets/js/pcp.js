import {
  Dom,
  loadPage,
  onmouseover,
  enableEnterAsTab,
  createModal,
  exportarParaExcel,
  messageQuestion,
  messageInformation,
  convertDataBr,
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
      p_iniciado: Dom.getValue("txt_data"),
      p_lote: Dom.getValue("txt_loteiniciar"),
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
  if (Dom.getValue("txt_numoc")) {
    const response = await fetch(
      `/getProjetoPcp?p_ordemdecompra=${Dom.getValue("txt_numoc")}`
    );

    if (!response.ok) {
      const errText = await response.text();
      messageInformation(
        "error",
        "ERRO",
        "Erro ao buscar ordem de compra" + errText
      );
      Dom.clearInputFields();
    } else {
      const data = await response.json();
      data.forEach((element) => {
        Dom.setValue("txt_contrato", element.p_contrato),
          Dom.setValue("txt_cliente", element.p_cliente),
          Dom.setChecked("chk_urgente", element.p_urgente),
          Dom.setValue("txt_codcc", element.p_codcc),
          Dom.setValue("txt_ambiente", element.p_ambiente),
          Dom.setValue("txt_numproj", element.p_numproj),
          Dom.setValue("txt_lote", element.p_lote),
          Dom.setValue("txt_pedido", element.p_pedido),
          Dom.setValue("txt_chegada", convertDate(element.p_chegoufabrica)),
          Dom.setValue("txt_entrega", convertDate(element.p_dataentrega)),
          Dom.setValue("txt_tipo", element.p_tipo),
          Dom.setValue("txt_pecas", element.p_peças),
          Dom.setValue("txt_area", element.p_area);
      });
    }
  } else {
    Dom.clearInputFields();
  }
}

async function setProjetoPcp() {
  const result = await messageQuestion(null, "Deseja salvar alterações ?");

  if (result.isConfirmed) {
    const data = {
      p_ordemdecompra: Dom.getValue("txt_numoc"),
      p_urgente: Dom.getChecked("chk_urgente"),
      p_codcc: Dom.getValue("txt_codcc"),
      p_lote: Dom.getValue("txt_lote"),
      p_pedido: Dom.getValue("txt_pedido"),
      p_tipo: Dom.getValue("txt_tipo"),
      p_pecas: Dom.getValue("txt_pecas"),
      p_area: Dom.getValue("txt_area"),
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
            <td ${config}>${convertDataBr(item.p_dataentrega)}</td>
            <td ${config}><input type='checkbox'/></td>
            `;
      tbody.appendChild(tr);
    });
  }
}

async function openModalLote() {
  await getLastLote();
  await getProjetosLote();
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
  const lote = Dom.getValue("txt_gerar_lote");
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
      const lista = [];
      const lote = Dom.getValue("txt_gerar_lote");
      for (const linha of checkboxesMarcados) {
        const colunas = linha.querySelectorAll("td");

        const numOC = colunas[0]?.textContent.trim();
        const codCC = colunas[2]?.textContent.trim();
        const pedido = colunas[1]?.textContent.trim();
        const ambiente = colunas[4]?.textContent.trim();
        const cliente = colunas[3]?.textContent.trim();
        const entrega = colunas[5]?.textContent.trim();
        lista.push({
          codCC,
          pedido,
          ambiente,
          cliente,
          entrega,
          lote,
        });
        await setLote(numOC, lote);
      }
      exportarParaExcel(lista, "ConfolhaLote.xlsx", "ConfolhaLote");

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
  const response = await fetch(
    `/exportarDados?data_inicio=${Dom.getValue(
      "txt_inicio"
    )}&data_fim=${Dom.getValue("txt_fim")}`
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
  loadPage("pcp", "pcp.html");
  Dom.setData("txt_data");
  onmouseover("table");
  enableEnterAsTab();
});

Dom.addEventBySelector("#txt_numoc", "blur", getProjetoPcp);
Dom.addEventBySelector("#bt_salvar", "click", setProjetoPcp);
Dom.addEventBySelector("#bt_startlote", "click", setStartLote);
Dom.addEventBySelector("#bt_export", "click", exportarDados);
Dom.addEventBySelector("#bt_gerar_lote", "click", gerarLote);
Dom.addEventBySelector("#bt_modal_lote", "click", openModalLote);
