import { getCookie } from "./utils.js";
import { Dom, q, qa, ce } from "./UI/interface.js";
import { API } from "./service/api.js";
import { Modal } from "./utils/modal.js";

/*==========================
  HELPER render UI
=============================*/
const Field = {
  getValue(selector) {
    return Dom.getValue(selector);
  },
  setValue(selector, value) {
    return Dom.setValue(selector, value);
  },
  ls(key) {
    return localStorage.getItem(key);
  },
  ce(value, style) {
    return Dom.createElement("td", value, style);
  },
};

/* ==========================
  HELPERS id's
=============================*/
const SEL = {
  ui: {
    TSOLICITACOES: "#tab-2 table tbody",
    TSOLICITACAO: "#tab-1 table tbody",
    ID: "#txt_id",
    BT_INSERIR: "#bt_inserir",
    BT_CONCLUIR: "#bt_concluir",
    LINK_TAB_2: "#link_tab2",
  },

  form: {
    SOLICITANTE: "#txt_solicitante",
    DATA: "#txt_data",
    CONTRATO: "#txt_contrato",
    CLIENTE: "#txt_cliente",
    AMBIENTE: "#txt_ambiente",
    PECAS_TBODY: "table tbody",
    BT_SALVAR: "bt_concluir",
  },

  form1: {
    QUANTIDADE: "#txt_quantidade",
    PECA: "#txt_peca",
    DIMENSOES: "#txt_dimensoes",
    COR: "#txt_cor",
    LADO: "#txt_lado",
    TIPO: "#txt_tipo",
    FALHA: "#txt_falha",
    OBSERVACOES: "#txt_obs",
  },
};

/*=========================
  API fetch
=========================*/
const ApiFetch = {
  getOcorrencia: async function () {
    const res = API.fetchQuery("/getOcorrencia");
    return res;
  },

  getFalhas: async function () {
    const res = API.fetchQuery("/getFalhas");
    return res;
  },

  getSolicitacoes: async function (id) {
    const url = `/getSolicitacoes?p_id_montador=${id}`;
    const res = API.fetchQuery(url);
    return res;
  },

  setPecas: async function (data) {
    const res = await API.fetchBody("/setPecas", "POST", data);
    return res;
  },
};

/*================================
  render UI
/*================================*/

function buildRow(tr) {
  const textCenter = "text-align: center";
  tr.append(Field.ce(Field.getValue(SEL.form1.QUANTIDADE), textCenter));
  tr.append(Field.ce(Field.getValue(SEL.form1.PECA)));
  tr.append(Field.ce(Field.getValue(SEL.form1.DIMENSOES)));
  tr.append(Field.ce(Field.getValue(SEL.form1.COR)));
  tr.append(Field.ce(Field.getValue(SEL.form1.LADO)));
  tr.append(Field.ce(Field.getValue(SEL.form1.TIPO), textCenter));
  tr.append(Field.ce(Field.getValue(SEL.form1.FALHA), textCenter));
  tr.append(Field.ce(Field.getValue(SEL.form1.OBSERVACOES), "display: none"));
  tr.innerHTML += insertButtonCellTable();
}

function rowTable(item) {
  const tr = ce("tr");
  tr.append(Field.ce(item.p_codigo));
  tr.append(Field.ce(item.p_qtd));
  tr.append(Field.ce(item.p_cor));
  tr.append(Field.ce(item.p_peca));
  tr.append(Field.ce(item.p_dimensoes));
  tr.append(Field.ce(item.p_cliente));
  tr.append(Field.ce(item.p_ambiente));
  return tr;
}

function insertTableRow(event) {
  const form = q(".modal-body form");
  if (form.checkValidity()) {
    event.preventDefault();
    const tbody = q("table tbody");
    const tr = ce("tr");
    buildRow(tr);
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
function populateTypeList(element, select) {
  const option = ce("option");
  option.value = element.p_cod;
  option.innerHTML = element.p_descricao;
  select.appendChild(option);
}

function populateFaillsList(element, select) {
  const option = ce("option");
  option.value = element.p_codigo;
  option.innerHTML = `${element.p_codigo} - ${element.p_descricao}`;
  select.appendChild(option);
}

async function populateType() {
  const res = await ApiFetch.getOcorrencia();
  const select = q(SEL.form1.TIPO);
  select.innerHTML = '<option value="">-</option>';
  res.data.forEach((element) => populateTypeList(element, select));
}

async function populateFaills() {
  const response = await ApiFetch.getFalhas();
  const select = q(SEL.form1.FALHA);
  select.innerHTML = '<option value="">-</option>';
  response.data.forEach((element) => populateFaillsList(element, select));
}

async function populateTableSolicitacion() {
  const id = Field.getValue(SEL.ui.ID);
  const res = await ApiFetch.getSolicitacoes(id);
  const tbody = q(SEL.ui.TSOLICITACOES);
  tbody.innerHTML = "";
  res.data.forEach((item) => tbody.appendChild(rowTable(item)));
}

async function delRowTable(event) {
  const button = getButtonDelRow(event);
  if (button) {
    const row = getRow(event);
    const result = await confirmDelRow();
    if (result.isConfirmed) {
      row.remove();
    }
  }
}

function getButtonDelRow(event) {
  return event.target.closest("button");
}

function getRow(event) {
  return event.target.closest("tr");
}

function getTableRows() {
  return qa("table tbody tr");
}

function formSolicitation() {
  return q("form");
}

/*=============================
  HELPERS Modals
==============================*/
async function confirmDelRow() {
  return await Modal.showConfirmation("REMOVER", "Deseja remover peça ?");
}

async function confirmSolicitation(params) {
  return await Modal.showConfirmation("CONCLUIR", "Concluir Solicitação ?");
}

function hasRows(rows) {
  if (!rows || rows.length === 0) {
    Modal.showInfo("warning", "ATENÇÃO", "Insira ao menos uma peça !!!");
    return false;
  }
  return true;
}

function handleFinalFeedback(data) {
  return Modal.showInfo("warning", "PARCIAL", data);
}

function isFormValid() {
  const form = formSolicitation();
  return form.checkValidity();
}

async function userConfirmed() {
  const result = await confirmSolicitation();
  return !!result?.isConfirmed;
}

async function confirmSolicitacion(event) {
  if (!isFormValid()) return;
  event.preventDefault();

  if (!(await userConfirmed())) return;

  const rows = getTableRows();
  if (!hasRows(rows)) return;

  const res = sendRows(rows);
}

function buildRowData(row) {
  return {
    p_etiqueta: 0,
    p_qtd: row.cells[0]?.innerHTML ?? "",
    p_peca: row.cells[1]?.innerHTML ?? "",
    p_dimensoes: row.cells[2]?.innerHTML ?? "",
    p_cor: row.cells[3]?.innerHTML ?? "",
    p_lado: row.cells[4]?.innerHTML ?? "",
    p_ocorrencia: row.cells[5]?.innerHTML ?? "",
    p_falha: row.cells[6]?.innerHTML ?? "",
    p_observacoes: row.cells[7]?.innerHTML ?? "",
    p_cliente: Dom.getValue(SEL.form.CLIENTE),
    p_ambiente: Dom.getValue(SEL.form.AMBIENTE),
    p_id_montador: Dom.getValue(SEL.ui.ID),
  };
}

async function sendRows(rows) {
  for (const row of rows) {
    const data = buildRowData(row);
    try {
      const resp = await ApiFetch.setPecas(data);
      Modal.showInfo(
        "success",
        "Sucesso",
        "Solicitação enviada com sucesso"
      ).then(() => {
        window.location.href = "/pecas.html";
      });
    } catch (err) {
      handleFinalFeedback(err);
    }
  }
}

/*=============================
  HELPERS Clock
==============================*/
function isTypeValid(el) {
  if (el.tagName === "INPUT" && el.type === "datetime-local") return true;
  return false;
}

function formatDateTime(now) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function atualizar(el) {
  const now = new Date();
  if (isTypeValid(el)) {
    const valor = formatDateTime(now);
    el.value = valor;
  } else {
    el.textContent = now.toLocaleString("pt-BR");
  }
}

function initClock(element) {
  const el = q(element);
  atualizar(el);
  const intervalo = setInterval(() => atualizar(el), 1000);
}

document.addEventListener("DOMContentLoaded", (event) => {
  populateType();
  populateFaills();
  Dom.setValue(SEL.ui.ID, Field.ls("id_montador"));
  Dom.setValue(SEL.form.SOLICITANTE, Field.ls("montador"));
  Dom.addEventBySelector(SEL.ui.BT_INSERIR, "click", insertTableRow);
  Dom.addEventBySelector(SEL.ui.TSOLICITACAO, "click", delRowTable);
  Dom.addEventBySelector(SEL.ui.BT_CONCLUIR, "click", confirmSolicitacion);
  Dom.addEventBySelector(SEL.ui.LINK_TAB_2, "click", populateTableSolicitacion);
  initClock(SEL.form.DATA);
});
