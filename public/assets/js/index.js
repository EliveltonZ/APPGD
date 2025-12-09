import { criarSpinnerGlobal, getCookie } from "./utils.js";
import { API } from "./service/api.js";
import { q, Dom } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";

/*===========================
  HELPER ELEMENTS
===========================*/

const EL = {
  ID: "#txt_id",
  LOGIN: "#txt_login",
  PASSWORD: "#password",
  BTN_LOGIN: "#bt_login",
};

/*===========================
  HELPER API
===========================*/

const DB = {
  getUserById: async function (userId) {
    const url = `/getUserAccess?p_id=${encodeURIComponent(userId)}`;
    return await API.fetchQuery(url);
  },

  validateUserPassword: async function (payload) {
    return await API.fetchBody("/passwordValidation", "POST", payload);
  },

  setUserPermissions: async function (payload) {
    return await API.fetchBody("/setPermission", "POST", payload);
  },
};

/*===========================
  UI HELPERS
===========================*/

function getUserIdInputValue() {
  return q(EL.ID).value.trim();
}

function clearLoginAndFocusId() {
  const idInput = q(EL.ID);
  const loginInput = q(EL.LOGIN);

  loginInput.value = "";
  idInput.focus();
}

function setLoginField(login) {
  q(EL.LOGIN).value = login;
}

function clearAndFocusPasswordInput() {
  const pwdInput = q(EL.PASSWORD);
  pwdInput.value = "";
  pwdInput.focus();
}

function redirectToMenu() {
  window.location.href = "/menu.html";
}

/*===========================
  DOMAIN: USER / PERMISSIONS
===========================*/

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

async function saveUserPermissions(user) {
  const payload = buildPermissionPayload(user);
  const response = await DB.setUserPermissions(payload);

  if (response.status !== 200) {
    throw new Error(`Erro ao salvar permissões ${response.data}`);
  }
}

/*===========================
  DOMAIN: FIND USER BY ID
===========================*/

function isEmptyUserId(userId) {
  return !userId;
}

async function fetchUserDataById(userId) {
  const response = await DB.getUserById(userId);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  return response.data;
}

function handleUserNotFound() {
  Modal.showInfo("error", "Erro", "Número de ID não encontrado").then(() => {
    const idInput = q(EL.ID);
    const loginInput = q(EL.LOGIN);
    loginInput.value = "";
    idInput.value = "";
    idInput.focus();
  });
}

async function handleIdBlur() {
  const userId = getUserIdInputValue();

  if (isEmptyUserId(userId)) {
    clearLoginAndFocusId();
    return;
  }

  try {
    const data = await fetchUserDataById(userId);

    if (!Array.isArray(data) || !data.length) {
      throw new Error("Usuário não encontrado");
    }

    setLoginField(data[0].login);
  } catch (error) {
    handleUserNotFound();
  }
}

/*===========================
  DOMAIN: LOGIN / PASSWORD
===========================*/

function buildLoginPayload() {
  return {
    p_id: Dom.getValue(EL.ID),
    p_senha: Dom.getValue(EL.PASSWORD),
  };
}

function isValidPasswordResponse(response) {
  return Array.isArray(response.data) && response.data.length > 0;
}

function handleInvalidPassword() {
  clearAndFocusPasswordInput();
  Modal.showInfo("error", "Erro", "Senha digitada é inválida!").then(() => {
    clearAndFocusPasswordInput();
  });
}

async function processLogin() {
  const payload = buildLoginPayload();
  const response = await DB.validateUserPassword(payload);

  if (response.status !== 200) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  if (!isValidPasswordResponse(response)) {
    handleInvalidPassword();
    return;
  }

  const user = response.data[0];
  await saveUserPermissions(user);
  redirectToMenu();
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  try {
    await processLogin();
  } catch (error) {
    console.error("Erro na validação de senha:", error);
    Modal.showInfo("error", "Erro", "Não foi possível validar o acesso.");
  }
}

/*===========================
  INIT
===========================*/

function initLoginPage() {
  Dom.setFocus(EL.ID);
  q(EL.ID).value = "";
  Dom.enableEnterAsTab();
  criarSpinnerGlobal();
  Dom.addEventBySelector(EL.BTN_LOGIN, "click", handleLoginSubmit);
  Dom.addEventBySelector(EL.ID, "blur", handleIdBlur);
}

window.addEventListener("DOMContentLoaded", () => {
  initLoginPage();
});
