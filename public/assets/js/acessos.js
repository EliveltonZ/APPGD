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

async function getUserAccess() {
  const id = q(SELECTORS.ID).value.trim();
  if (!id || id <= 0) {
    Modal.showInfo("error", "ERRO", "ID precisa ser numero maior que 0").then(
      () => {
        q(SELECTORS.ID).focus();
      }
    );
    return;
  }

  try {
    const response = await API.fetchQuery(
      `/getUserAccess?p_id=${encodeURIComponent(id)}`
    );
    const item = response.data[0];

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
  } catch (err) {
    Modal.showInfo(
      "error",
      "Erro",
      `Ocorreu um erro ao buscar dados: ${err.message}`
    );
  }
}

function senhaFocus() {
  q(SELECTORS.ID).focus();
}

async function setUserAccess() {
  if (Dom.getValue(SELECTORS.ID) <= 0) return;
  const result = await Modal.ShowQuestion(null, "Deseja confirmar alterações?");

  if (result.isConfirmed) {
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

    const response = await API.fetchBody("/setUserAccess", "PUT", payload);
    if (response.status == 200) {
      Modal.showInfo("success", "Sucesso", "Salvo com sucesso!");
    } else {
      Modal.showInfo("error", "ERRO", `ERRO: HTTP ${response.status}`);
    }
  }
}

function init() {
  loadPage("acesso", "acessos.html");
  Dom.enableEnterAsTab();
  senhaFocus();
}

window.addEventListener("DOMContentLoaded", () => {
  init();
});

Dom.addEventBySelector(SELECTORS.SALVAR, "click", setUserAccess);
Dom.addEventBySelector(SELECTORS.ID, "blur", getUserAccess);
