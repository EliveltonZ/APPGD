import {
  getText,
  setText,
  loadPage,
  setFocus,
  onmouseover,
  convertDataBr,
  convertDataISO,
  getGroupedData,
  enableEnterAsTab,
  checkValue,
  addEventBySelector,
  messageInformation,
  messageQuestion,
  createModal,
} from "./utils.js";

async function getContrato() {
  if (!getText("txt_contrato") || !Number(getText("txt_contrato"))) {
    messageInformation("error", "ERRO", "Contrato Invalido");
    setText("txt_contrato", "");
    return;
  }

  const response = await fetch(
    `/getContratoPendencias?p_contrato=${getText("txt_contrato")}`
  );

  if (!response.ok) {
    messageInformation("error", "ERRO", "Contrato não localizado");
  } else {
    const data = await response.json();
    setText("txt_entrega", convertDataBr(data[0].p_dataentrega));
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const tr = document.createElement("tr");

      tr.classList.add("open-modal-row");

      tr.innerHTML = `
                <td>${item.p_ordemdecompra}</td>
                <td>${item.p_cliente}</td>
                <td>${item.p_ambiente}</td>
                `;
      tbody.appendChild(tr);
    });
  }
}

function getFirstColumnValue(td, index) {
  const row = td.parentNode;
  return row.cells[index].innerText;
}

async function fillTableAcessorios() {
  const response = await fetch(
    `/fillTableAPendencia?p_ordemdecompra=${getText("txt_numoc")}`
  );

  if (!response.ok) {
    messageInformation(
      "error",
      "ERRO",
      "Não foi possivel buscar dados na base"
    );
  } else {
    const config = 'style="text-align: center;"';
    const tbody = document.querySelectorAll("table tbody")[1];
    tbody.innerHTML = "";

    const data = await response.json();
    data.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.p_id}</td>
        <td>${checkValue(item.p_categoria)}</td>
        <td>${checkValue(item.p_descricao)}</td>
        <td ${config}>${checkValue(item.p_medida)}</td>
        <td ${config}>${checkValue(item.p_qtd)}</td>
        <td ${config}>${checkValue(item.p_fornecedor)}</td>
        <td ${config}>${convertDataBr(checkValue(item.p_datacompra))}</td>
        <td ${config}>${convertDataBr(checkValue(item.p_previsao))}</td>
        <td ${config}>${convertDataBr(checkValue(item.p_recebido))}</td>
        ${insertButtonCellTable()}
        `;
      tbody.appendChild(tr);
      clear();
    });
  }
}

function getTextLowCase(element) {
  let value = document.getElementById(element).value;
  return value === "" ? null : value;
}

function clear() {
  setText("txt_categoria", "");
  setText("txt_descricao", "");
  setText("txt_medida", "");
  setText("txt_qtd", "");
  setText("txt_fornecedor", "");
  setText("txt_compra", "");
  setText("txt_previsao", "");
  setText("txt_recebido", "");
}

async function deleteRow(button) {
  try {
    const row = button.closest("tr");
    const firstCell = row.querySelector("td");

    if (firstCell.textContent.trim()) {
      const result = await messageQuestion(
        "REMOVER ITEM",
        "Deseja remover o item selecionado ?"
      );

      if (result.isConfirmed) {
        const data = {
          p_id: firstCell.textContent.trim(),
        };

        const response = await fetch("/delAcessorios", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        row.remove();
      }
    }
  } catch {
    messageInformation("error", "ERRO", "Não foi possivel remover item...");
  }
}

function insertButtonCellTable() {
  return `
    <td style="text-align: center;">
      <button class="btn btn-danger btn-delete" type="button" style="padding: 0px;margin-left: 10px;">
        <svg class="d-flex d-xxl-flex justify-content-center justify-content-xxl-center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" fill="none" style="color:rgb(255, 255, 255);text-align: center;height: 100%;width: 100%;">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" fill="currentColor"></path>
        </svg>
      </button>
    </td>
  `;
}

function handleDeleteButtonClick(event) {
  const button = event.target.closest("button");

  if (button && button.classList.contains("btn-delete")) {
    deleteRow(button);
  }
}

function handleTableClick(event) {
  if (event.target.tagName === "TD") {
    const firstColumnValue = getFirstColumnValue(event.target, 0);
    const secondColumnValue = getFirstColumnValue(event.target, 1);
    const treeColumnValue = getFirstColumnValue(event.target, 2);
    setText("txt_numoc", firstColumnValue);
    setText("txt_cliente", secondColumnValue);
    setText("txt_ambiente", treeColumnValue);
    fillTableAcessorios(firstColumnValue);
    createModal("modal");
  }
}

function getLineItens(event) {
  if (event.target.tagName === "TD") {
    const row = event.target.closest("tr");
    const cellValues = [];
    row.querySelectorAll("td").forEach(function (cell) {
      cellValues.push(cell.textContent);
    });
    setText("txt_categoria", cellValues[1]);
    setText("txt_descricao", cellValues[2]);
    setText("txt_medida", cellValues[3]);
    setText("txt_qtd", cellValues[4]);
    setText("txt_fornecedor", cellValues[5]);
    setText("txt_compra", convertDataISO(checkValue(cellValues[6])));
    setText("txt_previsao", convertDataISO(checkValue(cellValues[7])));
    setText("txt_recebido", convertDataISO(checkValue(cellValues[8])));
  }
}

async function insertAcessorios() {
  const result = await messageQuestion(null, "Deseja inserir novo acessorio ?");

  if (result.isConfirmed) {
    try {
      const data = {
        p_ordemdecompra: getText("txt_numoc"),
        p_categoria: document.getElementById("txt_categoria").value,
        p_descricao: getText("txt_descricao"),
        p_medida: getText("txt_medida"),
        p_quantidade: getText("txt_qtd"),
        p_fornecedor: getText("txt_fornecedor"),
        p_compra: getText("txt_compra"),
        p_previsao: getText("txt_previsao"),
        p_recebido: getText("txt_recebido"),
      };

      const response = await fetch("/insertAcessorios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      fillTableAcessorios(getText("txt_numoc"));
    } catch {
      messageInformation("error", "ERRO", "Não foi possível inserir acessório");
    }
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  setFocus("txt_contrato");
  loadPage("compras", "pendencias.html");
  enableEnterAsTab();
  onmouseover("table");
  onmouseover("table-1");
  getGroupedData("getGroupedAcessorios", "txt_categoria", "p_categoria");
});

addEventBySelector("#txt_contrato", "blur", getContrato);
addEventBySelector("#bt_adicionar", "click", insertAcessorios);
addEventBySelector("#table", "click", handleTableClick);
addEventBySelector("#table-1", "dblclick", getLineItens);
addEventBySelector("#table-1", "click", handleDeleteButtonClick);
