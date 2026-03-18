import { Dom, q } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";
import { API } from "./service/api.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  inputs: {
    id: "#txt_id",
    nome: "#txt_nome",
    senha: "#txt_senha",
  },
  ui: {
    form: "form",
    button: "button",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const LoginAPI = {
  fetchMontadorNameById(id) {
    const url = `/getMontador?p_codigo=${id}`;
    return API.fetchQuery(url);
  },

  validateLogin(id, senha) {
    const url = `/validateLogin?p_codigo=${id}&p_senha=${senha}`;
    return API.fetchQuery(url);
  },
};

/* =========================================================
   FIELD ACCESS
========================================================= */
const Fields = {
  get(sel) {
    return Dom.getValue(sel);
  },
  set(sel, value) {
    Dom.setValue(sel, value);
  },
  focus(sel) {
    q(sel)?.focus();
  },
  clear(sel) {
    const el = q(sel);
    if (el) el.value = "";
  },
};

/* =========================================================
   UI MESSAGES
========================================================= */
function showInvalidCredentials() {
  return Modal.showInfo("error", "ATENÇÃO", "Usuário ou senha inválidos");
}

/* =========================================================
   STORAGE
========================================================= */
function lsSet(key, value) {
  localStorage.setItem(key, value);
}

function setUserLocalStorage(data) {
  // preservando seu contrato esperado: data[0].codigo / data[0].nome
  lsSet("id_montador", data?.[0]?.codigo ?? "");
  lsSet("montador", data?.[0]?.nome ?? "");
}

/* =========================================================
   DOMAIN RULES
========================================================= */
function isFormValid() {
  const form = q(SELECTORS.ui.form);
  return !!form?.checkValidity?.() && form.checkValidity();
}

/* =========================================================
   FLOWS / HANDLERS
========================================================= */
async function loadMontadorNameByIdFlow() {
  const id = Fields.get(SELECTORS.inputs.id);
  if (!id) return;

  const res = await LoginAPI.fetchMontadorNameById(id);
  const nome = res?.data?.[0]?.p_nome ?? "";

  Fields.set(SELECTORS.inputs.nome, nome);
}

function goToPecas() {
  window.location.href = "/pecas.html";
}

function clearAndFocusPassword() {
  Fields.clear(SELECTORS.inputs.senha);
  Fields.focus(SELECTORS.inputs.senha);
}

async function handleLoginClick(event) {
  if (!isFormValid()) return;
  event.preventDefault();

  const id = Fields.get(SELECTORS.inputs.id);
  const senha = Fields.get(SELECTORS.inputs.senha);

  const res = await LoginAPI.validateLogin(id, senha);
  const data = res?.data ?? [];
  if (data.length > 0) {
    setUserLocalStorage(data);
    goToPecas();
    return;
  }

  await showInvalidCredentials();
  clearAndFocusPassword();
}

/* =========================================================
   INIT
========================================================= */
function configureUiDefaults() {
  Fields.focus(SELECTORS.inputs.id);
  Dom.enableEnterAsTab();
}

function bindEvents() {
  Dom.addEventBySelector(SELECTORS.inputs.id, "blur", loadMontadorNameByIdFlow);
  Dom.addEventBySelector(SELECTORS.ui.button, "click", handleLoginClick);
}

function init() {
  configureUiDefaults();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);
