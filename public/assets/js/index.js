import { criarSpinnerGlobal } from "./utils.js";
import { API } from "./service/api.js";
import { q, Dom } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  inputs: {
    id: "#txt_id",
    login: "#txt_login",
    password: "#password",
  },
  buttons: {
    login: "#bt_login",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const AuthAPI = {
  fetchUserAccessById(userId) {
    const url = `/getUserAccess?p_id=${encodeURIComponent(userId)}`;
    return API.fetchQuery(url);
  },
  validatePassword(payload) {
    return API.fetchBody("/passwordValidation", "POST", payload);
  },
  setPermissions(payload) {
    return API.fetchBody("/setPermission", "POST", payload);
  },
};

/* =========================================================
   FIELD ACCESS
========================================================= */
const Fields = {
  get(selector) {
    return Dom.getValue(selector);
  },
  set(selector, value) {
    Dom.setValue(selector, value);
  },
  focus(selector) {
    Dom.setFocus(selector);
  },
  clearAndFocus(selector) {
    Fields.set(selector, "");
    Fields.focus(selector);
  },
};

/* =========================================================
   UI HELPERS
========================================================= */
function redirectToMenu() {
  window.location.href = "/menu.html";
}

function showError(message) {
  return Modal.showInfo("error", "Erro", message);
}

/* =========================================================
   MAPPERS (DOMAIN -> API)
========================================================= */
function buildLoginPayload() {
  return {
    p_id: Fields.get(SELECTORS.inputs.id),
    p_senha: Fields.get(SELECTORS.inputs.password),
  };
}

function buildPermissionPayload(user) {
  return {
    id: user.id,
    permissoes: user.permissoes,
    login: user.login,
    adicionar_projetos: user.adicionar_projetos,
    producao: user.producao,
    expedicao: user.expedicao,
    adicionar_usuarios: user.adicionar_usuarios,
    acesso: user.acesso,
    definicoes: user.definicoes,
    pcp: user.pcp,
    previsao: user.previsao,
    compras: user.compras,
    ativo: user.ativo,
    producao_assistencia: user.producao_assistencia,
    solicitar_assistencia: user.solicitar_assistencia,
    valores: user.valores,
    dashboard: user.dashboard,
  };
}

/* =========================================================
   VALIDATORS
========================================================= */
function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function hasValidPasswordResponse(response) {
  return Array.isArray(response?.data) && response.data.length > 0;
}

/* =========================================================
   USE CASES / FLOWS
========================================================= */
async function fetchUserLoginById(userId) {
  const res = await AuthAPI.fetchUserAccessById(userId);
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);

  const user = res?.data?.[0];
  if (!user) return null;

  return user.login || "";
}

async function saveUserPermissions(user) {
  const payload = buildPermissionPayload(user);
  const res = await AuthAPI.setPermissions(payload);

  if (res.status !== 200) {
    throw new Error(`Erro ao salvar permissões: ${res.status}`);
  }
}

async function processLogin() {
  const payload = buildLoginPayload();
  const res = await AuthAPI.validatePassword(payload);

  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  if (!hasValidPasswordResponse(res)) return { ok: false };

  const user = res.data[0];
  await saveUserPermissions(user);

  return { ok: true };
}

/* =========================================================
   HANDLERS
========================================================= */
async function handleIdBlur() {
  const userId = q(SELECTORS.inputs.id).value.trim();

  if (isEmpty(userId)) {
    Fields.set(SELECTORS.inputs.login, "");
    Fields.focus(SELECTORS.inputs.id);
    return;
  }

  try {
    const login = await fetchUserLoginById(userId);

    if (!login) {
      await showError("Número de ID não encontrado");
      Fields.set(SELECTORS.inputs.id, "");
      Fields.set(SELECTORS.inputs.login, "");
      Fields.focus(SELECTORS.inputs.id);
      return;
    }

    Fields.set(SELECTORS.inputs.login, login);
  } catch {
    await showError("Número de ID não encontrado");
    Fields.set(SELECTORS.inputs.id, "");
    Fields.set(SELECTORS.inputs.login, "");
    Fields.focus(SELECTORS.inputs.id);
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  try {
    const result = await processLogin();

    if (!result.ok) {
      await showError("Senha digitada é inválida!");
      Fields.clearAndFocus(SELECTORS.inputs.password);
      return;
    }

    redirectToMenu();
  } catch (err) {
    console.error("Erro na validação de senha:", err);
    await showError("Não foi possível validar o acesso.");
  }
}

/* =========================================================
   INIT
========================================================= */
function configureUiDefaults() {
  Fields.set(SELECTORS.inputs.id, "");
  Fields.focus(SELECTORS.inputs.id);
  Dom.enableEnterAsTab();
  criarSpinnerGlobal();
}

function bindEvents() {
  Dom.addEventBySelector(SELECTORS.buttons.login, "click", handleLoginSubmit);
  Dom.addEventBySelector(SELECTORS.inputs.id, "blur", handleIdBlur);
}

function initLoginPage() {
  configureUiDefaults();
  bindEvents();
}

window.addEventListener("DOMContentLoaded", initLoginPage);
