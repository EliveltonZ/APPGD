import { getCookie } from "./utils.js";
import { Dom } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";
import { API } from "./service/api.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  user: {
    id: "#txt_id",
    nome: "#txt_nome",
  },
  senha: {
    atual: "#txt_senhaatual",
    nova: "#txt_novasenha",
    confirmar: "#txt_confirmsenha",
    btSalvar: "#bt_senha",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const PasswordAPI = {
  validatePassword(payload) {
    return API.fetchBody("/passwordValidation", "POST", payload);
  },

  updatePassword(payload) {
    // padronizado: sem fetch() direto
    return API.fetchBody("/alterarSenha", "PUT", payload);
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
    Dom.setFocus(sel);
  },
};

/* =========================================================
   UI MESSAGES
========================================================= */
function showError(message) {
  return Modal.showInfo("error", "ERRO", message);
}

function showWarning(message) {
  return Modal.showInfo("warning", "ATENÇÃO", message);
}

function showSuccess(message) {
  return Modal.showInfo("success", "Sucesso", message);
}

/* =========================================================
   PAYLOADS
========================================================= */
function buildPasswordValidationPayload() {
  return {
    p_id: Fields.get(SELECTORS.user.id),
    p_senha: Fields.get(SELECTORS.senha.atual),
  };
}

function buildPasswordUpdatePayload() {
  return {
    p_id: Fields.get(SELECTORS.user.id),
    p_senha: Fields.get(SELECTORS.senha.nova),
  };
}

/* =========================================================
   DOMAIN RULES
========================================================= */
function hasValidPasswordData(data) {
  return Array.isArray(data)
    ? data.length > 0
    : !!data && Object.keys(data).length > 0;
}

function isNewPasswordConfirmed() {
  return (
    Fields.get(SELECTORS.senha.nova) === Fields.get(SELECTORS.senha.confirmar)
  );
}

function hasRequiredUpdateFields(payload) {
  return !!payload?.p_id && !!payload?.p_senha;
}

/* =========================================================
   FLOWS / HANDLERS
========================================================= */
async function validateCurrentPasswordFlow() {
  const payload = buildPasswordValidationPayload();
  const res = await PasswordAPI.validatePassword(payload);

  if (res.status !== 200) {
    throw new Error(`Status ${res.status}`);
  }

  return res.data;
}

async function updateUserPasswordFlow() {
  const payload = buildPasswordUpdatePayload();

  if (!hasRequiredUpdateFields(payload)) {
    await showError("ID ou senha não podem ser vazios.");
    return;
  }

  const res = await PasswordAPI.updatePassword(payload);

  if (res.status !== 200) {
    await showError(`Houve um erro ao alterar a senha. (${res.status})`);
    return;
  }

  await showSuccess("Nova senha definida com sucesso!");
}

async function handlePasswordUpdate() {
  try {
    const data = await validateCurrentPasswordFlow();

    if (!hasValidPasswordData(data)) {
      await showError("Senha digitada é inválida!");
      return;
    }

    if (!isNewPasswordConfirmed()) {
      await showWarning("Senhas não conferem!");
      return;
    }

    await updateUserPasswordFlow();
  } catch (err) {
    console.error(err);
    await showError("Houve um erro ao executar alteração de senha.");
  }
}

/* =========================================================
   INIT
========================================================= */
async function hydrateUserFromCookies() {
  // Preenche campos com cookies
  Fields.set(SELECTORS.user.id, await getCookie("id"));
  Fields.set(SELECTORS.user.nome, await getCookie("login"));
}

function configureUiDefaults() {
  Fields.focus(SELECTORS.senha.atual);
  Dom.enableEnterAsTab();
}

function bindEvents() {
  Dom.addEventBySelector(
    SELECTORS.senha.btSalvar,
    "click",
    handlePasswordUpdate
  );
}

async function init() {
  configureUiDefaults();
  await hydrateUserFromCookies();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);
