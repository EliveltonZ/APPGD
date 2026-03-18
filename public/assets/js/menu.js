import { getCookie } from "./utils.js";
import { Dom, q } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";
import { API } from "./service/api.js";
import { DateTime } from "./utils/time.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  cookie: {
    login: "login",
  },
  inputs: {
    usuario: "#txt_usuario",
    responsavel: "#txt_resp",
    urgente: "#chk_urgente",
    numOc: "#txt_numoc",
    tipo: "#txt_tipo",
    data: "#txt_data",
  },
  iframe: {
    capa: "#iframeImpressao",
    pendencia: "#iframeImpressao1",
  },
  ui: {
    lbCapa: "#lb_capa",
    spinnerCapa: "#spinner",
    lbPendencia: "#lb_pendencias",
    spinnerPendencia: "#spinner-1",
  },
  links: {
    logout: "#link_logout",
    dashboard: "#dashboard",
  },
  buttons: {
    capa: "#bt_capa",
    capaPendencia: "#bt_capa_pendencia",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const PrintAPI = {
  fetchAccessories(orderNumber) {
    const url = `/fillTableAcessorios?p_ordemdecompra=${orderNumber}`;
    return API.fetchQuery(url);
  },

  fetchPendencies(orderNumber) {
    const url = `/fillElements?p_ordemdecompra=${orderNumber}`;
    return API.fetchQuery(url);
  },

  setProjectType(orderNumber, type, urgent) {
    const url = `/setTipo?p_ordemdecompra=${orderNumber}&p_tipo=${type}&p_urgente=${urgent}`;
    return API.fetchQuery(url);
  },

  async fetchCurrentPermissions() {
    const res = await fetch("/checkPermission", { credentials: "include" });
    return res;
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
  getChecked(selector) {
    return Dom.getChecked(selector);
  },
  setHtml(selector, html) {
    Dom.setInnerHtml(selector, html);
  },
};

/* =========================================================
   UI HELPERS / MESSAGES
========================================================= */
function showError(message) {
  return Modal.showInfo("error", "ERRO", message);
}

function showWarning(message) {
  return Modal.showInfo("warning", "Atenção", message);
}

function showSpinner(labelSelector, spinnerSelector, show) {
  Dom.handleClass(labelSelector, "d-none", show ? "add" : "remove");
  Dom.handleClass(spinnerSelector, "d-none", show ? "remove" : "add");
}

function redirectTo(url) {
  window.location.href = url;
}

function printIframe(iframeSelector) {
  const iframe = q(iframeSelector);
  if (!iframe?.contentWindow) return;

  iframe.contentWindow.location.reload();
  setTimeout(() => iframe.contentWindow.print(), 500);
}

/* =========================================================
   LOCAL STORAGE (single responsibility)
========================================================= */
function setLs(key, value) {
  localStorage.setItem(key, value);
}

function urgentLabel(isUrgent) {
  return isUrgent ? "SIM" : "-";
}

function persistPrintContext() {
  setLs("numoc", Fields.get(SELECTORS.inputs.numOc));
  setLs("resp", Fields.get(SELECTORS.inputs.responsavel));
  setLs("tipo", Fields.get(SELECTORS.inputs.tipo));
  setLs("data", Fields.get(SELECTORS.inputs.data));
  setLs("urgente", urgentLabel(Fields.getChecked(SELECTORS.inputs.urgente)));
}

/* =========================================================
   VALIDATORS
========================================================= */
function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function hasValidProjectType() {
  return Fields.get(SELECTORS.inputs.tipo) !== "-";
}

function getOrderNumber() {
  return Fields.get(SELECTORS.inputs.numOc);
}

/* =========================================================
   DATA LOADERS (save into localStorage)
========================================================= */
async function loadPendenciesToLocalStorage(orderNumber) {
  if (isEmpty(orderNumber)) return;

  const res = await PrintAPI.fetchPendencies(orderNumber);
  if (res.status !== 200) {
    console.error("Erro ao carregar pendências:", res.data);
    return;
  }

  setLs("project", JSON.stringify(res.data));
}

async function loadAccessoriesToLocalStorage(orderNumber) {
  const res = await PrintAPI.fetchAccessories(orderNumber);

  try {
    setLs("acessorios", JSON.stringify(res.data));
  } catch (err) {
    await showError(`Não foi possível carregar os dados. ${err.message}`);
  }
}

async function loadDataForPrint() {
  const orderNumber = getOrderNumber();
  await loadPendenciesToLocalStorage(orderNumber);
  await loadAccessoriesToLocalStorage(orderNumber);
}

/* =========================================================
   DOMAIN: SET PROJECT TYPE
========================================================= */
async function saveProjectType() {
  const orderNumber = Fields.get(SELECTORS.inputs.numOc);
  const type = Fields.get(SELECTORS.inputs.tipo);
  const urgent = Fields.getChecked(SELECTORS.inputs.urgente);

  const res = await PrintAPI.setProjectType(orderNumber, type, urgent);
  if (res.status !== 200) await showError(`${res.data}`);
}

/* =========================================================
   DOMAIN: USER DISPLAY / LOGOUT
========================================================= */
async function populateUserName() {
  const usuario = await getCookie(SELECTORS.cookie.login);
  Fields.setHtml(SELECTORS.inputs.usuario, usuario);
  Fields.set(SELECTORS.inputs.responsavel, usuario);
}

function buildClearUserPayload() {
  return {
    id: "",
    permissoes: null,
    login: "Não Logado",
    adicionar_projetos: null,
    producao: null,
    expedicao: null,
    adicionar_usuarios: null,
    acesso: null,
    definicoes: null,
    pcp: null,
    previsao: null,
    compras: null,
    ativo: null,
    producao_assistencia: null,
    solicitar_assistencia: null,
    valores: null,
    dashboard: null,
  };
}

async function clearUserPermissionsOnBackend() {
  // seu código original chamava API.fetchBody(payload) sem endpoint/método.
  // aqui usamos o endpoint correto que já existe no seu DB: /setPermission
  const payload = buildClearUserPayload();
  const res = await PrintAPI.setPermissions(payload);

  if (res.status !== 200) {
    throw new Error("Erro ao salvar permissões no backend");
  }
}

async function confirmLogout() {
  return Modal.showConfirmation(null, "Deseja sair do Sistema ?");
}

async function logoutFlow() {
  const result = await confirmLogout();
  if (!result.isConfirmed) return;

  try {
    await clearUserPermissionsOnBackend();
  } catch (err) {
    console.error("Erro ao enviar dados:", err);
  } finally {
    localStorage.clear();
    redirectTo("/");
  }
}

/* =========================================================
   DOMAIN: DASHBOARD PERMISSION
========================================================= */
const DASHBOARD_URL = "https://dashboardgd.streamlit.app/";

async function fetchCurrentPermissionsJson() {
  const res = await PrintAPI.fetchCurrentPermissions();
  if (!res.ok) throw new Error("Não autenticado");
  return res.json();
}

function canAccessDashboard(permissoes) {
  return Boolean(permissoes?.dashboard);
}

async function handleDashboardClick() {
  try {
    const permissoes = await fetchCurrentPermissionsJson();
    if (canAccessDashboard(permissoes)) return redirectTo(DASHBOARD_URL);
    return showError("Usuario sem Permissão");
  } catch (err) {
    return showError(`ERRO: ${err.message}`);
  }
}

/* =========================================================
   PRINT FLOWS
========================================================= */
async function printCapaFlow() {
  if (!hasValidProjectType()) {
    await showWarning("Selecione o tipo do Projeto");
    return;
  }

  showSpinner(SELECTORS.ui.lbCapa, SELECTORS.ui.spinnerCapa, true);

  try {
    persistPrintContext();
    await loadDataForPrint();
    printIframe(SELECTORS.iframe.capa);

    // após imprimir, grava tipo/urgência
    setTimeout(async () => {
      await saveProjectType();
      showSpinner(SELECTORS.ui.lbCapa, SELECTORS.ui.spinnerCapa, false);
    }, 500);
  } catch (err) {
    showSpinner(SELECTORS.ui.lbCapa, SELECTORS.ui.spinnerCapa, false);
    await showError(`Erro ao imprimir: ${err?.message || err}`);
  }
}

async function printPendenciaFlow() {
  showSpinner(SELECTORS.ui.lbPendencia, SELECTORS.ui.spinnerPendencia, true);

  try {
    persistPrintContext();
    await loadDataForPrint();
    printIframe(SELECTORS.iframe.pendencia);

    setTimeout(() => {
      showSpinner(
        SELECTORS.ui.lbPendencia,
        SELECTORS.ui.spinnerPendencia,
        false
      );
    }, 500);
  } catch (err) {
    showSpinner(SELECTORS.ui.lbPendencia, SELECTORS.ui.spinnerPendencia, false);
    await showError(`Erro ao imprimir: ${err?.message || err}`);
  }
}

/* =========================================================
   INIT
========================================================= */
function configureDefaults() {
  Fields.set(SELECTORS.inputs.data, DateTime.today());
}

function bindEvents() {
  Dom.addEventBySelector(SELECTORS.links.logout, "click", logoutFlow);
  Dom.addEventBySelector(SELECTORS.buttons.capa, "click", printCapaFlow);
  Dom.addEventBySelector(
    SELECTORS.buttons.capaPendencia,
    "click",
    printPendenciaFlow
  );
  Dom.addEventBySelector(
    SELECTORS.links.dashboard,
    "click",
    handleDashboardClick
  );
}

async function init() {
  configureDefaults();
  await populateUserName();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);
