import { enableTableFilterSort } from "./filtertable.js";
import { Dom, q, qa, ce } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";
import { DateTime } from "./utils/time.js";
import { API } from "./service/api.js";

/* =========================
   SELECTOR
   ========================= */
const EL = {
  solicitation: {
    solicitacao: "#txt_solicitacao",
    contrato: "#txt_contrato",
    solicitante: "#txt_solicitante",
    datasolicitacao: "#txt_data",
    cliente: "#txt_cliente",
    ambiente: "#txt_ambiente",
    urgente: "#txt_urgente",
    montador: "#txt_responsavel",
    bairro: "#txt_bairro",
    tempo: "#txt_tempo",
    tipoassistencia: "#txt_tipo",
    supervisor: "#txt_supervisor",
    destino: "#txt_destino",
    categoria: "#txt_categoria",
  },

  parts: {
    qtd: "#txt_quantidade",
    peca: "#txt_peca",
    dimensoes: "#txt_dimensoes",
    cor: "#txt_cor",
    lado: "#txt_lado",
    falha: "#txt_falha",
    tipo: "#txt_tipo-1",
    obs: "#txt_obs",
  },

  checkbox: {
    montagem: "#chk_mont",
    promob: "#chk_promob",
    entrega: "#chk_entrega",
  },

  ui: {
    t_body_montador: "#table-montador tbody",
    t_body_pecas: "#table-pecas tbody",
    form_equip: "#form-equip",
    form_parts: "#form-parts",
    form_solicitacao: "#div-form form",
    bt_add: "#bt_adicionar",
    bt_part: "#add_parts",
    bt_part_1: "#add_parts-1",
    bt_concluir: "#bt_concluir",
  },
};

/* =========================
   SERVICES (API calls)
   ========================= */
const orderService = {
  createOrder(payload) {
    return API.fetchBody("/setNewOrder", "POST", payload);
  },

  fetchInstallers() {
    return API.fetchQuery("/getMontador");
  },

  fetchContract(contractId) {
    return API.fetchQuery(`/getContrato?p_contrato=${contractId}`);
  },

  fetchOrderTypes() {
    return API.fetchQuery("/getConfig");
  },

  getOcorrencia() {
    return API.fetchQuery("/getOcorrencia");
  },

  getFalhas() {
    return API.fetchQuery("/getFalhas");
  },

  fetchInsertItens(data) {
    return API.fetchBody("/setPecas", "POST", data);
  },
};

/* =========================
   UI RENDERERS (DOM-only)
   ========================= */
const ui = {
  renderSelectOptions(
    selectEl,
    items,
    { valueKey, labelKey, includeEmpty = true } = {},
  ) {
    if (!selectEl) return;
    const fragment = document.createDocumentFragment();
    selectEl.innerHTML = "";
    if (includeEmpty) {
      const opt = ce("option");
      opt.value = "";
      opt.textContent = "-";
      fragment.appendChild(opt);
    }
    items.forEach((item) => {
      const opt = ce("option");
      opt.value = item[valueKey];
      opt.textContent = item[labelKey];
      fragment.appendChild(opt);
    });
    selectEl.appendChild(fragment);
  },

  appendInstallerRow(id, name) {
    const tbody = q("table.table tbody");
    if (!tbody) return;
    const tr = ce("tr");
    tr.innerHTML = `
      <td style="text-align: center" >${id}</td>
      <td>${name}</td>
    `;
    const button = insertButtonCellTable();
    tr.innerHTML += button;
    tbody.appendChild(tr);
  },

  appendPartsRow(list) {
    const tbody = q(EL.ui.t_body_pecas);
    if (!tbody) return;
    const tr = ce("tr");
    tr.innerHTML = `
      <td>${list[0]}</td>
      <td>${list[1]}</td>
      <td>${list[2]}</td>
      <td>${list[3]}</td>
      <td>${list[4]}</td>
      <td style="display:none">${list[5]}</td>
      <td style="display:none">${list[6]}</td>
      <td>${list[7]}</td>
      <td >${list[8]}</td>
      <td style="display:none">${list[9]}</td>
    `;
    const button = insertButtonCellTable();
    tr.innerHTML += button;
    tbody.appendChild(tr);
  },

  clearTable(tbodySelector) {
    const tbody = q(tbodySelector);
    if (tbody) tbody.innerHTML = "";
  },

  focusFirstField() {
    q(EL.solicitation.solicitacao)?.focus();
  },
};

/* =========================
   VALIDATORS (rules only)
   ========================= */
const validators = {
  isNativeFormValid(form) {
    return form.checkValidity();
  },

  hasAtLeastOneRow(tbodySelector) {
    const tbody = q(tbodySelector);
    const count = tbody ? tbody.querySelectorAll("tr").length : 0;
    return count > 0;
  },
};

function processPartsTable() {
  const tbody = q(EL.ui.t_body_pecas);
  processTableRows(tbody);
}

async function processTableRows(tbody) {
  const rows = tbody.querySelectorAll("tr");
  for (const row of rows) {
    await processPartRow(row);
  }
}

async function processPartRow(row) {
  processRows(row, extractParts);
}

async function processInstallerRow(row) {
  processRows(row, extractInstallers);
}

async function processRows(row, _function) {
  try {
    const cells = row.querySelectorAll("td");
    const data = _function(cells);
    console.log(data);
  } catch {
    console.warn(`erro: ${err}`);
  }
}

/* =========================
   HELPERS (data builders)
   ========================= */
function buildOrderPayload() {
  return {
    p_solicitacao: Dom.getValue(EL.solicitation.solicitacao),
    p_contrato: Dom.getValue(EL.solicitation.contrato),
    p_solicitante: Dom.getValue(EL.solicitation.solicitante),
    p_datasolicitacao: Dom.getValue(EL.solicitation.datasolicitacao),
    p_cliente: Dom.getValue(EL.solicitation.cliente),
    p_ambiente: Dom.getValue(EL.solicitation.ambiente),
    p_urgente: Dom.getValue(EL.solicitation.urgente),
    p_montador: Dom.getValue(EL.solicitation.montador),
    p_bairro: Dom.getValue(EL.solicitation.bairro),
    p_tempo: Dom.getValue(EL.solicitation.tempo),
    p_tipoassistencia: Dom.getValue(EL.solicitation.tipoassistencia),
    p_montagem: Dom.getChecked(EL.checkbox.montagem),
    p_promob: Dom.getChecked(EL.checkbox.promob),
    p_entrega: Dom.getChecked(EL.checkbox.entrega),
    p_supervisor: Dom.getValue(EL.solicitation.supervisor),
    p_destino: Dom.getValue(EL.solicitation.destino),
  };
}

function createPartRow() {
  const qtd = Dom.getValue(EL.parts.qtd);
  const peca = Dom.getValue(EL.parts.peca);
  const dimensoes = Dom.getValue(EL.parts.dimensoes);
  const cor = Dom.getValue(EL.parts.cor);
  const tipo = Dom.getValue(EL.parts.tipo);
  const falhaText = Dom.getInnerHtml(EL.parts.falha);
  const tipoText = Dom.getInnerHtml(EL.parts.tipo);
  const lado = Dom.getValue(EL.parts.lado);
  const falha = Dom.getValue(EL.parts.falha);
  const obs = Dom.getValue(EL.parts.obs);

  return [
    qtd,
    peca,
    dimensoes,
    cor,
    lado,
    falha,
    tipo,
    falhaText,
    tipoText,
    obs,
  ];
}

function extractParts(cells) {
  return {
    p_qtd: cells[0].textContent,
    p_peca: cells[1].textContent,
    p_dimensoes: cells[2].textContent,
    p_cor: cells[3].textContent,
    p_id_assistencia: Dom.getValue(EL.solicitation.solicitacao),
    p_lado: cells[4].textContent,
    p_ocorrencia: cells[6].textContent,
    p_falha: cells[5].textContent,
    p_observacoes: cells[9].textContent,
  };
}

function extractInstallers(cells) {
  return {
    p_id_sat: Dom.getValue(EL.solicitation.solicitacao),
    p_id_montador: cells[0].textContent,
  };
}

/* =========================
   CONTROLLERS (flows)
   ========================= */
async function handleOrderSubmit(evt) {
  evt.preventDefault();
  const form = q(EL.ui.form_equip);

  if (!validators.isNativeFormValid(form)) {
    form.reportValidity();
    return;
  }

  if (!validators.hasAtLeastOneRow(EL.ui.t_body_montador)) {
    Modal.showInfo("warning", "ATENÇÃO", "insira o montador responsável");
    return;
  }

  const confirm = await Modal.showConfirmation(
    "Finalizar",
    "Deseja enviar esta solicitação de assistência?",
    "Confirmar",
    "Cancelar",
  );

  if (!confirm.isConfirmed) return;

  try {
    const payload = buildOrderPayload();
    await orderService.createOrder(payload);
    Modal.showInfo("success", "SUCESSO", "Registro criado com sucesso!");

    form.reset();
    ui.clearTable(EL.ui.t_body_montador);
  } catch (err) {
    Modal.showInfo("error", "ERROR", `Error: ${err.message}`);
  }
}

function handleInstallerAdd(evt) {
  evt.preventDefault();
  const smallForm = q(EL.ui.form_equip);
  if (!smallForm?.checkValidity()) {
    smallForm?.reportValidity();
    return;
  }

  const select = q(EL.solicitation.categoria);
  const id = select.value;
  const name = select.options[select.selectedIndex].text;
  if (!id) return;

  ui.appendInstallerRow(id, name);
  select.remove(select.selectedIndex);
  smallForm.reset();
}

function handleTableParts(evt) {
  evt.preventDefault();
  const form = q(EL.ui.form_parts);
  if (!form?.checkValidity()) {
    form?.reportValidity();
  } else {
    const itens = createPartRow();
    ui.appendPartsRow(itens);
    form.reset();
  }
}

async function handleInsertSolicitation(evt) {
  evt.preventDefault();
  const form = q(EL.ui.form_solicitacao);
  if (!form?.checkValidity()) {
    form?.reportValidity();
  } else {
    const result = await Modal.showConfirmation(null, "Concluir Solicitação ?");
    if (result.isConfirmed) processPartsTable();
  }
}

async function populateType() {
  const res = await orderService.getOcorrencia();
  const select = q(EL.parts.tipo);
  select.innerHTML = '<option value="">-</option>';
  res.data.forEach((element) => populateTypeList(element, select));
}

async function populateFaills() {
  const response = await orderService.getFalhas();
  const select = q(EL.parts.falha);
  select.innerHTML = '<option value="">-</option>';
  response.data.forEach((element) => populateFaillsList(element, select));
}

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

async function handleContractBlur() {
  const contractId = Dom.getValue(EL.solicitation.contrato);
  if (!contractId) return;
  try {
    const data = await orderService.fetchContract(contractId);
    Dom.setValue(EL.solicitation.cliente, data?.[0]?.p_cliente ?? "");
  } catch (e) {
    Modal.showInfo("error", "ERROR", `ERRO: ${e}`);
  }
}

async function loadOrderTypes() {
  try {
    const types = await orderService.fetchOrderTypes();
    const select = q(EL.solicitation.tipoassistencia);
    ui.renderSelectOptions(select, types.data, {
      valueKey: "p_cod",
      labelKey: "p_descricao",
      includeEmpty: true,
    });
  } catch {
    Modal.showInfo("error", "ERROR", "Não foi possível carregar os tipos");
  }
}

async function loadInstallers() {
  try {
    const installers = await orderService.fetchInstallers();
    const select = q(EL.solicitation.categoria);
    ui.renderSelectOptions(select, installers.data, {
      valueKey: "p_codigo",
      labelKey: "p_nome",
      includeEmpty: true,
    });
  } catch (err) {
    Modal.showInfo("error", "ERROR", "Não foi possível carregar os montadores");
  }
}

function handleRowDel(button) {
  const _button = button.target.closest("button");
  if (!_button) return;
  const item = button.target.closest("tr");
  item.remove();
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

function initApp() {
  populateType();
  populateFaills();
  loadOrderTypes();
  loadInstallers();
  ui.focusFirstField();
  Dom.addEventBySelector(EL.solicitation.contrato, "blur", handleContractBlur);
  Dom.addEventBySelector(EL.ui.form_equip, "submit", handleOrderSubmit);
  Dom.addEventBySelector(EL.ui.bt_add, "click", handleInstallerAdd);
  Dom.addEventBySelector(EL.ui.t_body_montador, "click", handleRowDel);
  Dom.addEventBySelector(EL.ui.t_body_pecas, "click", handleRowDel);
  Dom.addEventBySelector(EL.ui.bt_part, "click", handleTableParts);
  Dom.addEventBySelector(EL.ui.bt_part_1, "click", processPartsTable);
  Dom.addEventBySelector(EL.ui.bt_concluir, "click", handleInsertSolicitation);
  DateTime.initClock(EL.solicitation.datasolicitacao);
}

document.addEventListener("DOMContentLoaded", initApp);
