import { loadPage } from "./utils.js";
import { Dom, q } from "./UI/interface.js";
import { API } from "./service/api.js";
import { Modal } from "./utils/modal.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  inputs: {
    id: "#txt_id",
    login: "#txt_login",
    senha: "#txt_Senha",
    setor: "#txt_setor",
    camisa: "#txt_camiseta",
    calca: "#txt_calca",
    sapato: "#txt_sapato",
    local: "#txt_local",
  },
  buttons: {
    adicionar: "#bt_adicionar",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const UserAPI = {
  createUser(payload) {
    return API.fetchBody("/insertUser", "POST", payload);
  },

  fetchMaxUserId() {
    return API.fetchQuery("/getMaxId");
  },
};

/* =========================================================
   FIELD ACCESS (READ/WRITE)
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
};

/* =========================================================
   VALIDATORS
========================================================= */
function isFormValid() {
  const form = q("form");
  if (!form?.checkValidity?.()) return false;

  const valid = form.checkValidity();
  if (!valid && typeof form.reportValidity === "function")
    form.reportValidity();
  return valid;
}

/* =========================================================
   UI MESSAGES
========================================================= */
function showHttpError(title, status, details) {
  return Modal.showInfo(
    "error",
    title,
    `HTTP: ${status}${details ? ` - ${details}` : ""}`,
  );
}

function showGenericError(title, err) {
  return Modal.showInfo("error", title, `${err?.message || err}`);
}

function showSuccess(title, message) {
  return Modal.showInfo("success", title, message);
}

/* =========================================================
   MAPPERS (UI -> API)
========================================================= */
function buildUserPayloadFromForm() {
  return {
    p_id: Fields.get(SELECTORS.inputs.id),
    p_login: Fields.get(SELECTORS.inputs.login),
    // mantendo o comportamento original (senha fixa)
    p_senha: "123456",
    p_setor: Fields.get(SELECTORS.inputs.setor),
    p_camiseta: Fields.get(SELECTORS.inputs.camisa),
    p_calca: Fields.get(SELECTORS.inputs.calca),
    p_sapato: Fields.get(SELECTORS.inputs.sapato),
    p_local: Fields.get(SELECTORS.inputs.local),
  };
}

/* =========================================================
   USE CASES / HANDLERS
========================================================= */
async function loadNextUserIdIntoForm() {
  try {
    const response = await UserAPI.fetchMaxUserId();

    if (response.status !== 200) {
      await showHttpError(
        "Não foi possível buscar o próximo ID.",
        response.status,
      );
      return;
    }

    const maxId = response?.data?.[0]?.max_id;

    if (maxId == null) {
      await Modal.showInfo("error", "ERRO", "Retorno inválido do ultimo ID.");
      return;
    }

    Fields.set(SELECTORS.inputs.id, maxId);
  } catch (err) {
    await showGenericError("Erro ao buscar ID", err);
  }
}

async function handleAddUserClick(e) {
  if (!isFormValid()) return;

  e.preventDefault();
  const payload = buildUserPayloadFromForm();
  const result = await Modal.showConfirmation(
    "Confirmar",
    `Deseja adicionar ${payload.p_login}?`,
  );
  if (!result.isConfirmed) return;

  try {
    const response = await UserAPI.createUser(payload);

    if (response.status !== 200) {
      await showHttpError("Erro ao salvar usuário", response.status);
      return;
    }

    await showSuccess(
      "Sucesso",
      `Usuário ${payload.p_login} salvo com sucesso!`,
    );
  } catch (err) {
    await showGenericError("Erro ao salvar usuário", err);
  }
}

/* =========================================================
   PAGE SETUP (INIT)
========================================================= */
function loadView() {
  loadPage("adicionar_usuarios", "usuarios.html");
}

function configureUiDefaults() {
  Dom.allUpperCase();
  Fields.focus(SELECTORS.inputs.login);
}

function bindEvents() {
  Dom.addEventBySelector(
    SELECTORS.buttons.adicionar,
    "click",
    handleAddUserClick,
  );
}

function initUserFormPage() {
  loadView();
  configureUiDefaults();
  bindEvents();
  loadNextUserIdIntoForm();
}

document.addEventListener("DOMContentLoaded", initUserFormPage);
