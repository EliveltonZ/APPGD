/**
 * SUGESTÃO DE ESTRUTURA DE ARQUIVOS
 * - services/orderService.js
 * - ui/renderers.js
 * - validators/validators.js
 * - controllers/appController.js
 * - main.js
 *
 * Abaixo está tudo junto para fácil adesão.
 */

import {
  Dom,
  messageInformation,
  messageQuestion,
  dateTimeNow,
} from "./utils.js";
import { enableTableFilterSort } from "./filtertable.js";

/* =========================
   SERVICES (API calls)
   ========================= */

const orderService = {
  async createOrder(payload) {
    const res = await fetch("/setNewOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  },

  async fetchInstallers() {
    const res = await fetch("/getMontador");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async fetchContract(contractId) {
    const res = await fetch(`/getContrato?p_contrato=${contractId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async fetchOrderTypes() {
    const res = await fetch("/getConfig");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};

/* =========================
   UI RENDERERS (DOM-only)
   ========================= */
const ui = {
  setRequestDate() {
    Dom.setValue("txt_data", dateTimeNow());
  },

  lerTabela(idTabela) {
    const tabela = document.getElementById(idTabela);
    const linhas = tabela.querySelectorAll("tbody tr");
    const dados = [];

    linhas.forEach((linha) => {
      const celulas = linha.querySelectorAll("td");
      const valores = [];

      celulas.forEach((celula) => {
        valores.push(celula.textContent.trim());
      });

      dados.push(valores);
    });

    return dados;
  },

  renderSelectOptions(
    selectEl,
    items,
    { valueKey, labelKey, includeEmpty = true } = {}
  ) {
    if (!selectEl) return;
    const fragment = document.createDocumentFragment();
    selectEl.innerHTML = "";
    if (includeEmpty) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "-";
      fragment.appendChild(opt);
    }
    items.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item[valueKey];
      opt.textContent = item[labelKey];
      fragment.appendChild(opt);
    });
    selectEl.appendChild(fragment);
  },

  appendInstallerRow(id, name) {
    const tbody = document.querySelector("table.table tbody");
    if (!tbody) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="text-align: center" >${id}</td>
      <td>${name}</td>
    `;
    const button = insertButtonCellTable();
    tr.innerHTML += button;
    tbody.appendChild(tr);
  },

  clearTable(tbodySelector) {
    const tbody = document.querySelector(tbodySelector);
    if (tbody) tbody.innerHTML = "";
  },

  focusFirstField() {
    document.getElementById("txt_solicitacao")?.focus();
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
    const tbody = document.querySelector(tbodySelector);
    const count = tbody ? tbody.querySelectorAll("tr").length : 0;
    return count > 0;
  },
};

/* =========================
   HELPERS (data builders)
   ========================= */
function buildOrderPayload() {
  ui.setRequestDate();
  return {
    p_solicitacao: Dom.getValue("txt_solicitacao"),
    p_contrato: Dom.getValue("txt_contrato"),
    p_solicitante: Dom.getValue("txt_solicitante"),
    p_datasolicitacao: Dom.getValue("txt_data"),
    p_cliente: Dom.getValue("txt_cliente"),
    p_ambiente: Dom.getValue("txt_ambiente"),
    p_urgente: Dom.getValue("txt_urgente"),
    p_montador: Dom.getValue("txt_responsavel"),
    p_bairro: Dom.getValue("txt_bairro"),
    p_tempo: Dom.getValue("txt_tempo"),
    p_tipoassistencia: Dom.getValue("txt_tipo"),
    p_montagem: Dom.getChecked("chk_mont"),
    p_promob: Dom.getChecked("chk_promob"),
    p_entrega: Dom.getChecked("chk_entrega"),
    p_supervisor: Dom.getValue("txt_supervisor"),
    p_destino: Dom.getValue("txt_destino"),
  };
}

/* =========================
   CONTROLLERS (flows)
   ========================= */
async function handleOrderSubmit(evt) {
  evt.preventDefault();
  const form = document.querySelector("form");

  // 1) validação nativa
  if (!validators.isNativeFormValid(form)) {
    form.reportValidity();
    return;
  }

  // 2) validação de tabela
  if (!validators.hasAtLeastOneRow("#table-montador tbody")) {
    messageInformation(
      "warning",
      "ATTENTION",
      "Insert at least one installer for this request."
    );
    return;
  }

  // 3) confirmação
  const confirm = await messageQuestion(
    "Finish",
    "Do you want to submit this assistance?",
    "Confirm",
    "Cancel"
  );
  if (!confirm.isConfirmed) return;

  // 4) envio
  try {
    const payload = buildOrderPayload();
    await orderService.createOrder(payload);
    messageInformation("success", "SUCCESS", "Record created successfully!");

    // 5) limpeza
    form.reset();
    ui.clearTable("#table-montador tbody");
  } catch (err) {
    messageInformation("error", "ERROR", `Error: ${err.message}`);
  }
}

function handleInstallerAdd(evt) {
  evt.preventDefault();
  const smallForm = document.querySelector("#no-form");
  if (!smallForm?.checkValidity()) {
    smallForm?.reportValidity();
    return;
  }

  const select = document.getElementById("txt_categoria");
  const id = select.value;
  const name = select.options[select.selectedIndex].text;
  if (!id) return;

  ui.appendInstallerRow(id, name);
  smallForm.reset();
}

async function handleContractBlur() {
  const contractId = Dom.getValue("txt_contrato");
  if (!contractId) return;
  try {
    const data = await orderService.fetchContract(contractId);
    // ex.: data[0] existe segundo seu backend
    Dom.setValue("txt_cliente", data?.[0]?.p_cliente ?? "");
  } catch (e) {
    messageInformation("error", "ERROR", "Unable to fetch contract.");
  }
}

async function loadOrderTypes() {
  try {
    const data = await orderService.fetchOrderTypes();
    const select = document.getElementById("txt_tipo");
    ui.renderSelectOptions(select, data, {
      valueKey: "p_cod",
      labelKey: "p_descricao",
      includeEmpty: true,
    });
  } catch {
    messageInformation("error", "ERROR", "Unable to load order types.");
  }
}

async function loadInstallers() {
  try {
    const items = await orderService.fetchInstallers();
    console.log(items);
    const select = document.querySelector("#txt_categoria");
    ui.renderSelectOptions(select, items, {
      valueKey: "p_codigo",
      labelKey: "p_nome",
      includeEmpty: true,
    });
  } catch (err) {
    messageInformation("error", "ERROR", `${err.message}`);
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
  ui.focusFirstField();
  Dom.addEventBySelector("#txt_contrato", "blur", handleContractBlur);
  Dom.addEventBySelector("form", "submit", handleOrderSubmit);
  Dom.addEventBySelector("#bt_adicionar", "click", handleInstallerAdd);
  Dom.addEventBySelector("#table-montador tbody", "click", handleRowDel);

  loadOrderTypes();
  loadInstallers();
}

document.addEventListener("DOMContentLoaded", initApp);
