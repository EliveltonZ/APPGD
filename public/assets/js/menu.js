import { getCookie } from "./utils.js";
import { Dom, q, ce, qa } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";
import { API } from "./service/api.js";
import { DateTime } from "./utils/time.js";

/*========================================
  HELPERS DOM
========================================*/
const EL = {
  LOGIN: "login",
  USUARIO: "#txt_usuario",
  RESP: "#txt_resp",
  CHK_URGENTE: "#chk_urgente",
  NUM_OC: "#txt_numoc",
  TIPO: "#txt_tipo",
  DATA: "#txt_data",
  IFRAME_IMPRESSAO: "#iframeImpressao",
  IFRAME_IMPRESSAO1: "#iframeImpressao1",
  LB_CAPA: "#lb_capa",
  SPINNER: "#spinner",
  SPINNER1: "#spinner-1",
  LB_PENDENCIA: "#lb_pendencias",
};

/*========================================
  HELPERS API
========================================*/
const DB = {
  getDataAcessories: async function (buyOrder) {
    const url = `/fillTableAcessorios?p_ordemdecompra=${buyOrder}`;
    const res = await API.fetchQuery(url);
    return res;
  },

  getDataPendence: async function (buyOrder) {
    const url = `/fillElements?p_ordemdecompra=${buyOrder}`;
    const res = API.fetchQuery(url);
    return res;
  },

  setPermissions: async function (payload) {
    const res = API.fetchBody("/setPermission", "POST", payload);
    return res;
  },

  setType: async function (orderBy, type, urgent) {
    const url = `/setTipo?p_ordemdecompra=${orderBy}&p_tipo=${type}&p_urgente=${urgent}`;
    const res = await API.fetchQuery(url);
    return res;
  },

  getPermission: async function () {
    const res = await fetch("/checkPermission", {
      credentials: "include",
    });
    return res;
  },
};

async function populateElementsName() {
  const usuario = await getCookie("login");
  Dom.setInnerHtml(EL.USUARIO, usuario);
  Dom.setValue(EL.RESP, usuario);
}

function isChecked() {
  const checked = Dom.getChecked(EL.CHK_URGENTE);
  if (checked) return "SIM";
  return "-";
}

function setLs(key, element) {
  localStorage.setItem(key, Dom.getValue(element));
}

function setDataLocalStorage() {
  setLs("numoc", EL.NUM_OC);
  setLs("resp", EL.RESP);
  setLs("tipo", EL.TIPO);
  setLs("data", EL.DATA);
  localStorage.setItem("urgente", isChecked());
}

function isValidType() {
  if (Dom.getValue(EL.TIPO) !== "-") return true;
  return false;
}

function showSpinnerCapa(element, spinner, show) {
  Dom.handleClass(element, "d-none", show ? "add" : "remove");
  Dom.handleClass(spinner, "d-none", show ? "remove" : "add");
}

async function printPageCapa() {
  if (!isValidType()) {
    Modal.showInfo("warning", "Atenção", "Selecione o tipo do Projeto");
    return;
  }
  showSpinnerCapa(EL.LB_CAPA, EL.SPINNER, true);
  setDataLocalStorage();
  await loadData();
  q(EL.IFRAME_IMPRESSAO).contentWindow.location.reload();
  var iframe = q(EL.IFRAME_IMPRESSAO);
  setTimeout(async function () {
    iframe.contentWindow.print();
    showSpinnerCapa(EL.LB_CAPA, EL.SPINNER, false);
    await setType(
      Dom.getValue(EL.NUM_OC),
      Dom.getValue(EL.TIPO),
      Dom.getChecked(EL.CHK_URGENTE)
    );
  }, 500);
}

async function printPageCapaPendencia() {
  showSpinnerCapa(EL.LB_PENDENCIA, EL.SPINNER1, true);
  setDataLocalStorage();
  await loadData();
  q(EL.IFRAME_IMPRESSAO1).contentWindow.location.reload();
  var iframe = q(EL.IFRAME_IMPRESSAO1);
  setTimeout(function () {
    iframe.contentWindow.print();
    showSpinnerCapa(EL.LB_PENDENCIA, EL.SPINNER1, false);
  }, 500);
}

async function confirmLogout() {
  const result = await Modal.showConfirmation(null, "Deseja sair do Sistema ?");
  return result;
}

async function logout() {
  const result = confirmLogout();
  if (result.isConfirmed) {
    await clearDataUsuario();
    localStorage.clear();
    window.location.href = "/";
  }
}

async function loadData() {
  const buyOrder = Dom.getValue(EL.NUM_OC);
  await fillElements(buyOrder);
  await fillTableAcessorios(buyOrder);
}

async function fillElements(buyOrder) {
  if (!buyOrder || buyOrder.trim() === "") {
    console.warn("Ordem de compra inválida ou ausente. Cancelando fetch.");
    return;
  }
  const res = await DB.getDataPendence(buyOrder);

  if (res.status !== 200) {
    const errTExt = await res.data;
    console.error("Erro ao carregar os dados:", errTExt);
  } else {
    localStorage.setItem("project", JSON.stringify(res.data));
  }
}

async function fillTableAcessorios(buyOrder) {
  const res = await DB.getDataAcessories(buyOrder);

  try {
    localStorage.setItem("acessorios", JSON.stringify(res.data));
  } catch (err) {
    Modal.showInfo(
      "error",
      "Erro",
      `Não foi possível carregar os dados. ${err.message}`
    );
  }
}

function payloadClearUser() {
  const payload = {
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
  return payload;
}

async function clearDataUsuario() {
  try {
    const payload = payloadClearUser();
    const response = await API.fetchBody(payload);

    if (response.status !== 200) {
      throw new Error("Erro ao salvar permissões no backend");
    }

    console.log("Dados de usuário enviados com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar dados:", error);
  }
}

async function setType(orderBuy, type, urgent) {
  const res = await DB.setType(orderBuy, type, urgent);

  if (res.status !== 200) {
    Modal.showInfo("error", "ERRO", `${res.data}`);
  }
}

const DASHBOARD_URL = "https://dashboardgd.streamlit.app/";

async function fetchUserPermissions() {
  const response = await DB.getPermission();
  if (!response.ok) throw new Error("Não autenticado");
  return response.json();
}

function getDashboardPermission(permissoes) {
  return Boolean(permissoes?.dashboard);
}

function redirectToDashboard() {
  window.location.href = DASHBOARD_URL;
}

function showNoPermissionMessage() {
  Modal.showInfo("error", "ERRO", "Usuario sem Permissão");
}

function showPermissionError(error) {
  Modal.showInfo("error", "ERRO", `ERRO: ${error.message}`);
}

async function handleDashboardPermissionClick() {
  try {
    const permissoes = await fetchUserPermissions();
    const allowed = getDashboardPermission(permissoes);

    if (allowed) return redirectToDashboard();
    return showNoPermissionMessage();
  } catch (error) {
    return showPermissionError(error);
  }
}

function init() {
  Dom.setValue(EL.DATA, DateTime.today());
  populateElementsName();
  Dom.addEventBySelector("#link_logout", "click", logout);
  Dom.addEventBySelector("#bt_capa", "click", printPageCapa);
  Dom.addEventBySelector("#bt_capa_pendencia", "click", printPageCapaPendencia);
  Dom.addEventBySelector("#dashboard", "click", handleDashboardPermissionClick);
}

document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
