import { loadPage } from "./utils.js";
import { Dom, q } from "./UI/interface.js";
import { API } from "./service/api.js";
import { Modal } from "./utils/modal.js";

/*==============================
 HELPER elementos
==============================*/

const SELECTORS = {
  // inputs
  ID: "#txt_id",
  LOGIN: "#txt_login",
  SETOR: "#txt_setor",
  CAMISETA: "#txt_camiseta",
  CALCA: "#txt_calca",
  SAPATO: "#txt_sapato",
  LOCAL: "#txt_local",
  ATIVO: "#chk_ativo",
  PROJETOS: "#chk_projetos",
  PRODUCAO: "#chk_producao",
  EXPEDICAO: "#chk_expedicao",
  ACESSOS: "#chk_acessos",
  USUARIOS: "#chk_usuarios",
  DEFINICOES: "#chk_definicoes",
  CALCULAR: "#chk_calcular",
  PREVISOES: "#chk_previsoes",
  COMPRAS: "#chk_compras",
  SOLICITACAO: "#chk_solicitacao",
  PROD_ASS: "#chk_prodass",
  VALORES: "#chk_valores",
  DASHBOARDS: "#chk_dashboard",
  // buttons
  SALVAR: "#bt_salvar",
};

const DB = {
  getUserAccess: async function (id) {
    const url = `/getUserAccess?p_id=${encodeURIComponent(id)}`;
    const res = API.fetchQuery(url);
    return res;
  },

  setUserAccess: async function (payload) {
    const res = await API.fetchBody("/setUserAccess", "PUT", payload);
    return res;
  },
};

function getID() {
  return q(SELECTORS.ID).value.trim();
}

async function dataUserAccess(id) {
  const res = await DB.getUserAccess(id);
  return res.data[0];
}

function fillElementsFielddUser(item) {
  Dom.setValue(SELECTORS.LOGIN, item.login);
  Dom.setValue(SELECTORS.SETOR, item.setor);
  Dom.setValue(SELECTORS.CAMISETA, item.camiseta);
  Dom.setValue(SELECTORS.CALCA, item.calca);
  Dom.setValue(SELECTORS.SAPATO, item.sapato);
  Dom.setValue(SELECTORS.LOCAL, item.local);
  Dom.setChecked(SELECTORS.ATIVO, item.ativo);
  Dom.setChecked(SELECTORS.PROJETOS, item.projetos);
  Dom.setChecked(SELECTORS.PRODUCAO, item.producao);
  Dom.setChecked(SELECTORS.EXPEDICAO, item.expedicao);
  Dom.setChecked(SELECTORS.USUARIOS, item.usuarios);
  Dom.setChecked(SELECTORS.ACESSOS, item.acessos);
  Dom.setChecked(SELECTORS.DEFINICOES, item.definicoes);
  Dom.setChecked(SELECTORS.CALCULAR, item.pcp);
  Dom.setChecked(SELECTORS.PREVISOES, item.previsao);
  Dom.setChecked(SELECTORS.COMPRAS, item.compras);
  Dom.setChecked(SELECTORS.SOLICITACAO, item.solicitacao);
  Dom.setChecked(SELECTORS.PROD_ASS, item.prodass);
  Dom.setChecked(SELECTORS.VALORES, item.valores);
  Dom.setChecked(SELECTORS.DASHBOARDS, item.dashboard);
}

async function getUserAccess() {
  const id = getID();
  if (!id || id <= 0) {
    showMessageError("ID deve numero maior que 0").then(() => {
      q(SELECTORS.ID).focus();
    });
    return;
  }
  const response = await dataUserAccess(id);
  try {
    fillElementsFielddUser(response);
  } catch (err) {
    showMessageError(`Ocorreu um erro ao buscar dados: ${err.message}`);
  }
}

function isIdSmallerZero() {
  return Dom.getValue(SELECTORS.ID) <= 0;
}

async function confirmUpdate() {
  return await Modal.showConfirmation(null, "Deseja confirmar alterações?");
}

function buildPayloadUser() {
  const payload = {
    p_id: Dom.getValue(SELECTORS.ID),
    p_login: Dom.getValue(SELECTORS.LOGIN),
    p_setor: Dom.getValue(SELECTORS.SETOR),
    p_camiseta: Dom.getValue(SELECTORS.CAMISETA),
    p_calca: Dom.getValue(SELECTORS.CALCA),
    p_sapato: Dom.getValue(SELECTORS.SAPATO),
    p_local: Dom.getValue(SELECTORS.LOCAL),
    p_ativo: Dom.getChecked(SELECTORS.ATIVO),
    p_projetos: Dom.getChecked(SELECTORS.PROJETOS),
    p_producao: Dom.getChecked(SELECTORS.PRODUCAO),
    p_expedicao: Dom.getChecked(SELECTORS.EXPEDICAO),
    p_usuarios: Dom.getChecked(SELECTORS.USUARIOS),
    p_acessos: Dom.getChecked(SELECTORS.ACESSOS),
    p_definicoes: Dom.getChecked(SELECTORS.DEFINICOES),
    p_calcular: Dom.getChecked(SELECTORS.CALCULAR),
    p_previsoes: Dom.getChecked(SELECTORS.PREVISOES),
    p_compras: Dom.getChecked(SELECTORS.COMPRAS),
    p_solicitacao: Dom.getChecked(SELECTORS.SOLICITACAO),
    p_prodass: Dom.getChecked(SELECTORS.PROD_ASS),
    p_valores: Dom.getChecked(SELECTORS.VALORES),
    p_dashboard: Dom.getChecked(SELECTORS.DASHBOARDS),
  };
  return payload;
}

async function setUserAccess() {
  if (isIdSmallerZero()) return;
  const result = await confirmUpdate();

  if (result.isConfirmed) {
    const payload = buildPayloadUser();
    const response = await DB.setUserAccess(payload);
    if (response.status == 200) {
      Modal.showInfo("success", "Sucesso", "Salvo com sucesso!");
    } else {
      Modal.showInfo("error", "ERRO", `ERRO: HTTP ${response.status}`);
    }
  }
}

function passwordFocus() {
  q(SELECTORS.ID).focus();
}

function showMessageError(message) {
  return Modal.showInfo("error", "Erro", message);
}

function init() {
  loadPage("acesso", "acessos.html");
  Dom.enableEnterAsTab();
  passwordFocus();
  Dom.addEventBySelector(SELECTORS.SALVAR, "click", setUserAccess);
  Dom.addEventBySelector(SELECTORS.ID, "blur", getUserAccess);
}

window.addEventListener("DOMContentLoaded", () => {
  init();
});
