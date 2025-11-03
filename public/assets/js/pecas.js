import {
  Dom,
  messageInformation,
  messageQuestion,
  getCookie,
} from "./utils.js";

/*==========================
  HELPER render UI
=============================*/
const q = (element) => {
  return document.querySelector(element);
};

const qa = (element) => {
  return document.querySelectorAll(element);
};

const ce = (element) => {
  return document.createElement(element);
};

/* ==========================
  HELPERS id's
=============================*/
const SEL = {
  // form solicitacao
  SOLICITANTE: "#txt_solicitante",
  DATA: "#txt_data",
  CONTRATO: "#txt_contrato",
  CLIENTE: "#txt_cliente",
  AMBIENTE: "#txt_ambiente",
  PECAS_TBODY: "table tbody",
  BT_SALVAR: "bt_concluir",

  // form pecas
  QUANTIDADE: "#txt_quantidade",
  PECA: "#txt_peca",
  DIMENSOES: "#txt_dimensoes",
  COR: "#txt_cor",
  LADO: "#txt_lado",
  TIPO: "#txt_tipo",
  FALHA: "#txt_falha",
  OBSERVACOES: "#txt_obs",
};

/*=========================
  API fetch
=========================*/
const api = {
  fetchBody: async function (url, method, data) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const result = await response.json();
    return result;
  },

  fetchQuery: async function (url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  },
};

/*================================
  render UI
/*================================*/

function textAlignCenter() {
  return "text-align: center";
}

function insertTableRow(event) {
  const form = q(".modal-body form");
  if (form.checkValidity()) {
    event.preventDefault();
    const tbody = document.querySelector("table tbody");
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td style="${textAlignCenter()}">${Dom.getValue(
      `${SEL.QUANTIDADE.slice(1)}`
    )}</td>
    <td>${Dom.getValue(`${SEL.PECA.slice(1)}`)}</td>
    <td>${Dom.getValue(`${SEL.DIMENSOES.slice(1)}`)}</td>
    <td>${Dom.getValue(`${SEL.COR.slice(1)}`)}</td>
    <td>${Dom.getValue(`${SEL.LADO.slice(1)}`)}</td>
    <td style="${textAlignCenter()}">${Dom.getValue(
      `${SEL.TIPO.slice(1)}`
    )}</td>
    <td style="${textAlignCenter()}">${Dom.getValue(
      `${SEL.FALHA.slice(1)}`
    )}</td>
    ${insertButtonCellTable()}
    <td style="display: none">${Dom.getValue(
      `${SEL.OBSERVACOES.slice(1)}`
    )}</td>
  `;
    tbody.appendChild(tr);
    form.reset();
  }
}

function insertButtonCellTable() {
  return `
    <td style="text-align: center;">
      <button class="btn btn-danger btn-delete" type="button" style="padding: 0px;margin-left: 10px;">
        <svg class="d-flex d-xxl-flex justify-content-center justify-content-xxl-center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" fill="none" style="color:rgb(255, 255, 255);text-align: center;height: 100%;width: 15px;">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" fill="currentColor"></path>
        </svg>
      </button>
    </td>
  `;
}

/*=============================
  CONTROLERS interface
==============================*/
async function populateType() {
  const response = await api.fetchQuery("/getOcorrencia");
  const select = q(SEL.TIPO);
  select.innerHTML = '<option value="">-</option>';
  response.forEach((element) => {
    const option = ce("option");
    option.value = element.p_cod;
    option.innerHTML = element.p_descricao;
    select.appendChild(option);
  });
}

async function populateFaills() {
  const response = await api.fetchQuery("/getFalhas");
  const select = q(SEL.FALHA);
  select.innerHTML = '<option value="">-</option>';
  response.forEach((element) => {
    const option = ce("option");
    option.value = element.p_codigo;
    option.innerHTML = `${element.p_codigo} - ${element.p_descricao}`;
    select.appendChild(option);
  });
}

async function delRowTable(event) {
  const button = event.target.closest("button");
  if (button) {
    const row = event.target.closest("tr");
    const result = await messageQuestion("REMOVER", "Deseja remover peça ?");
    if (result.isConfirmed) {
      row.remove();
    }
  }
}

async function confirmSolicitacion(event) {
  const form = q("form");
  const table = q("table tbody");

  if (form.checkValidity()) {
    event.preventDefault();
    const result = await messageQuestion(
      "CONCLUIR",
      "Concluir Solicitação ?",
      "Concluir",
      "Cancelar"
    );

    if (result.isConfirmed) {
      const rows = qa("table tbody tr");
      rows.forEach((row) => {
        const data = {
          p_etiqueta: 0,
          p_qtd: row.cells[0].innerHTML,
          p_peca: row.cells[1].innerHTML,
          p_dimensoes: row.cells[2].innerHTML,
          p_cor: row.cells[3].innerHTML,
          p_lado: row.cells[4].innerHTML,
          p_ocorrencia: row.cells[5].innerHTML,
          p_falha: row.cells[6].innerHTML,
          p_observacoes: row.cells[8].innerHTML,
          p_cliente: Dom.getValue("txt_cliente"),
          p_ambiente: Dom.getValue("txt_ambiente"),
        };

        try {
          const response = api.fetchBody("/setPecas", "POST", data);
          messageInformation(
            "success",
            "SUCESSO",
            `Solicitação aberta com Sucesso !!!`
          );
        } catch (err) {
          messageInformation("error", "ERRO", `ERRO: ${err.message}`);
        }
      });
      table.innerHTML = "";
    }
  }
}

Dom.addEventBySelector("#bt_inserir", "click", insertTableRow);
Dom.addEventBySelector("table tbody", "click", delRowTable);
Dom.addEventBySelector("#bt_concluir", "click", confirmSolicitacion);
document.addEventListener("DOMContentLoaded", (event) => {
  populateType();
  populateFaills();
});
