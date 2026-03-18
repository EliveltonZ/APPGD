import { Dom, q } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";
import { API } from "./service/api.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  inputs: {
    id: "#txt_id",
    nome: "#txt_login",
    senha: "#password",
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
    const url = `/getUsuario?p_id=${id}`;
    return API.fetchQuery(url);
  },

  validateLogin(id, senha) {
    const url = "/passwordValidation";
    return API.fetchBody(url, "POST", { id, senha });
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
  const user = data?.[0] ?? {};
  lsSet("id_montador", user.id ?? "");
  lsSet("montador", user.login ?? "");
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
  const montadores = res?.data ?? [];
  const match = montadores.find((m) => String(m.p_codigo) === String(id));
  const nome = match?.p_nome ?? "";

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
