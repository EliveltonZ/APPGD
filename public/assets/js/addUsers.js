import { loadPage } from "./utils.js";
import { Dom, q } from "./UI/interface.js";
import { API } from "./service/api.js";
import { Modal } from "./utils/modal.js";

/*================================
  SELECTORS / DOM HELPERS
================================ */

const SELECTORS = {
  // Inputs
  ID: "#txt_id",
  LOGIN: "#txt_login",
  SENHA: "#txt_Senha",
  SETOR: "#txt_setor",
  CAMISA: "#txt_camiseta",
  CALCA: "#txt_calca",
  SAPATO: "#txt_sapato",
  LOCAL: "#txt_local",

  // Buttons
  ADICIONAR: "#bt_adicionar",
};

/*================================
  HELPERS API
================================ */

const DB = {
  async createUser(userData) {
    return API.fetchBody("/insertUser", "POST", userData);
  },

  async fetchMaxUserId() {
    return API.fetchQuery("/getMaxId");
  },
};

/*================================
  CORE FUNCTIONS
================================ */

function showModalError(response) {
  if (response.status !== 200) {
    Modal.showInfo(
      "error",
      "Não foi possível buscar o próximo ID. HTTP: " + response.status
    );
    return false;
  } else {
    return true;
  }
}

async function setNextUserIdField() {
  try {
    const response = await DB.fetchMaxUserId();

    if (showModalError(response)) return;

    const data = response.data;
    const maxId = data?.[0]?.max_id;

    if (maxId != null) {
      q(SELECTORS.ID).value = maxId;
    } else {
      Modal.showInfo("error", "Retorno inválido do ultimo ID.");
    }
  } catch (error) {
    Modal.showInfo("error", "Erro ao buscar ID: " + error.message);
  }
}

function collectUserFormData() {
  return {
    p_id: Dom.getValue(SELECTORS.ID),
    p_login: Dom.getValue(SELECTORS.LOGIN),
    p_senha: "123456",
    p_setor: Dom.getValue(SELECTORS.SETOR),
    p_camiseta: Dom.getValue(SELECTORS.CAMISA),
    p_calca: Dom.getValue(SELECTORS.CALCA),
    p_sapato: Dom.getValue(SELECTORS.SAPATO),
    p_local: Dom.getValue(SELECTORS.LOCAL),
  };
}

async function handleAddUserClick(event) {
  event.preventDefault();

  const form = q("form");
  if (!form.checkValidity()) {
    if (typeof form.reportValidity === "function") {
      form.reportValidity();
    }
    return;
  }

  const userData = collectUserFormData();

  const result = await Modal.showConfirmation(
    "Confirmar",
    `Deseja adicionar ${userData.p_login}?`
  );

  if (!result.isConfirmed) return;

  try {
    const response = await DB.createUser(userData);

    if (response.status !== 200) {
      Modal.showInfo(
        "error",
        "Erro ao salvar usuário",
        `HTTP: ${response.status}`
      );
      return;
    }

    Modal.showInfo(
      "success",
      "Sucesso",
      `Usuário ${userData.p_login} salvo com sucesso!`
    );
  } catch (error) {
    Modal.showInfo("error", "Erro ao salvar usuário", error.message);
  }
}

/*================================
  INIT / BOOTSTRAP
================================ */

function initUserFormPage() {
  loadPage("adicionar_usuarios", "usuarios.html");
  Dom.allUpperCase();
  setNextUserIdField();
  Dom.setFocus(SELECTORS.LOGIN);

  Dom.addEventBySelector(SELECTORS.ADICIONAR, "click", handleAddUserClick);
}

document.addEventListener("DOMContentLoaded", initUserFormPage);
