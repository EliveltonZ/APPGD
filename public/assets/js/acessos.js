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
    setor: "#txt_setor",
    camiseta: "#txt_camiseta",
    calca: "#txt_calca",
    sapato: "#txt_sapato",
    local: "#txt_local",
  },
  checks: {
    ativo: "#chk_ativo",
    projetos: "#chk_projetos",
    producao: "#chk_producao",
    expedicao: "#chk_expedicao",
    acessos: "#chk_acessos",
    usuarios: "#chk_usuarios",
    definicoes: "#chk_definicoes",
    calcular: "#chk_calcular",
    previsoes: "#chk_previsoes",
    compras: "#chk_compras",
    solicitacao: "#chk_solicitacao",
    prodAss: "#chk_prodass",
    valores: "#chk_valores",
    dashboards: "#chk_dashboard",
  },
  buttons: {
    salvar: "#bt_salvar",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const AccessAPI = {
  fetchUserAccess(id) {
    const url = `/getUserAccess?p_id=${encodeURIComponent(id)}`;
    return API.fetchQuery(url);
  },
  updateUserAccess(payload) {
    return API.fetchBody("/setUserAccess", "PUT", payload);
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
  getChecked(selector) {
    return Dom.getChecked(selector);
  },
  setChecked(selector, value) {
    Dom.setChecked(selector, value);
  },
  focus(selector) {
    q(selector)?.focus?.();
  },
};

/* =========================================================
   UI MESSAGES
========================================================= */
function showError(message) {
  return Modal.showInfo("error", "Erro", message);
}

function showSuccess(message) {
  return Modal.showInfo("success", "Sucesso", message);
}

function showHttpError(status) {
  return Modal.showInfo("error", "ERRO", `ERRO: HTTP ${status}`);
}

function confirmUpdate() {
  return Modal.showConfirmation(null, "Deseja confirmar alterações?");
}

/* =========================================================
   VALIDATORS
========================================================= */
function parsePositiveInt(value) {
  const n = Number(String(value).trim());
  return Number.isFinite(n) ? n : NaN;
}

function getUserIdFromForm() {
  return parsePositiveInt(Fields.get(SELECTORS.inputs.id));
}

function isValidUserId(id) {
  return Number.isFinite(id) && id > 0;
}

/* =========================================================
   MAPPERS (API -> UI) and (UI -> API)
========================================================= */
function mapAccessResponseToForm(item) {
  return {
    inputs: [
      [SELECTORS.inputs.login, item.login],
      [SELECTORS.inputs.setor, item.setor],
      [SELECTORS.inputs.camiseta, item.camiseta],
      [SELECTORS.inputs.calca, item.calca],
      [SELECTORS.inputs.sapato, item.sapato],
      [SELECTORS.inputs.local, item.local],
    ],
    checks: [
      [SELECTORS.checks.ativo, item.ativo],
      [SELECTORS.checks.projetos, item.projetos],
      [SELECTORS.checks.producao, item.producao],
      [SELECTORS.checks.expedicao, item.expedicao],
      [SELECTORS.checks.usuarios, item.usuarios],
      [SELECTORS.checks.acessos, item.acessos],
      [SELECTORS.checks.definicoes, item.definicoes],
      // backend usa nomes diferentes em alguns campos
      [SELECTORS.checks.calcular, item.pcp],
      [SELECTORS.checks.previsoes, item.previsao],
      [SELECTORS.checks.compras, item.compras],
      [SELECTORS.checks.solicitacao, item.solicitacao],
      [SELECTORS.checks.prodAss, item.prodass],
      [SELECTORS.checks.valores, item.valores],
      [SELECTORS.checks.dashboards, item.dashboard],
    ],
  };
}

function applyAccessToForm(mapped) {
  mapped.inputs.forEach(([selector, value]) => Fields.set(selector, value));
  mapped.checks.forEach(([selector, value]) =>
    Fields.setChecked(selector, value)
  );
}

function buildAccessPayloadFromForm() {
  return {
    p_id: Fields.get(SELECTORS.inputs.id),
    p_login: Fields.get(SELECTORS.inputs.login),
    p_setor: Fields.get(SELECTORS.inputs.setor),
    p_camiseta: Fields.get(SELECTORS.inputs.camiseta),
    p_calca: Fields.get(SELECTORS.inputs.calca),
    p_sapato: Fields.get(SELECTORS.inputs.sapato),
    p_local: Fields.get(SELECTORS.inputs.local),
    p_ativo: Fields.getChecked(SELECTORS.checks.ativo),
    p_projetos: Fields.getChecked(SELECTORS.checks.projetos),
    p_producao: Fields.getChecked(SELECTORS.checks.producao),
    p_expedicao: Fields.getChecked(SELECTORS.checks.expedicao),
    p_usuarios: Fields.getChecked(SELECTORS.checks.usuarios),
    p_acessos: Fields.getChecked(SELECTORS.checks.acessos),
    p_definicoes: Fields.getChecked(SELECTORS.checks.definicoes),
    p_calcular: Fields.getChecked(SELECTORS.checks.calcular),
    p_previsoes: Fields.getChecked(SELECTORS.checks.previsoes),
    p_compras: Fields.getChecked(SELECTORS.checks.compras),
    p_solicitacao: Fields.getChecked(SELECTORS.checks.solicitacao),
    p_prodass: Fields.getChecked(SELECTORS.checks.prodAss),
    p_valores: Fields.getChecked(SELECTORS.checks.valores),
    p_dashboard: Fields.getChecked(SELECTORS.checks.dashboards),
  };
}

/* =========================================================
   USE CASES / HANDLERS
========================================================= */
async function handleUserIdBlur() {
  const id = getUserIdFromForm();

  if (!isValidUserId(id)) {
    await showError("ID deve ser um número maior que 0");
    Fields.focus(SELECTORS.inputs.id);
    return;
  }

  try {
    const res = await AccessAPI.fetchUserAccess(id);

    // se quiser tratar status, aqui é o lugar
    if (res.status !== 200) {
      await showHttpError(res.status);
      return;
    }

    const item = res?.data?.[0];
    if (!item) {
      await showError("Usuário não encontrado ou retorno vazio.");
      return;
    }

    applyAccessToForm(mapAccessResponseToForm(item));
  } catch (err) {
    await showError(`Ocorreu um erro ao buscar dados: ${err?.message || err}`);
  }
}

async function handleSaveClick() {
  const id = getUserIdFromForm();
  if (!isValidUserId(id)) {
    await showError("ID deve ser um número maior que 0");
    Fields.focus(SELECTORS.inputs.id);
    return;
  }

  const confirm = await confirmUpdate();
  if (!confirm.isConfirmed) return;

  try {
    const payload = buildAccessPayloadFromForm();
    const res = await AccessAPI.updateUserAccess(payload);

    if (res.status === 200) {
      await showSuccess("Salvo com sucesso!");
      return;
    }

    await showHttpError(res.status);
  } catch (err) {
    await showError(`Erro ao salvar: ${err?.message || err}`);
  }
}

/* =========================================================
   PAGE SETUP (INIT)
========================================================= */
function loadView() {
  loadPage("acesso", "acessos.html");
}

function configureUiDefaults() {
  Dom.enableEnterAsTab();
  Fields.focus(SELECTORS.inputs.id);
}

function bindEvents() {
  Dom.addEventBySelector(SELECTORS.buttons.salvar, "click", handleSaveClick);
  Dom.addEventBySelector(SELECTORS.inputs.id, "blur", handleUserIdBlur);
}

function initAccessPage() {
  loadView();
  configureUiDefaults();
  bindEvents();
}

window.addEventListener("DOMContentLoaded", initAccessPage);
