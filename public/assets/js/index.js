import { criarSpinnerGlobal, getCookie } from "./utils.js";

import { API } from "./service/api.js";
import { q, Dom, Modal } from "./UI/interface.js";

/*===========================
HELPER DE ELEMENTS
===========================*/

const EL = {
  ID: "#txt_id",
  LOGIN: "#txt_login",
  PASSWORD: "#password",
};

async function find_id() {
  const txtId = q(EL.ID);
  const txtLogin = q(EL.LOGIN);
  const id_user = txtId.value.trim();

  if (!id_user) {
    txtLogin.value = "";
    txtId.focus();
    return;
  }

  try {
    const response = await fetch(
      `/getUserAccess?p_id=${encodeURIComponent(id_user)}`
    );

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    const data = await response.json();

    txtLogin.value = data[0].login;
  } catch (err) {
    txtLogin.value = "";
    Modal.showInfo("error", "Erro", "Número de ID não encontrado ").then(() => {
      txtId.value = "";
      txtId.focus();
    });
  }
}

async function passwordValidation(event) {
  const dict = {
    p_id: Dom.getValue(EL.ID),
    p_senha: Dom.getValue(EL.PASSWORD),
  };
  const response = await API.fetchBody("/passwordValidation", "POST", dict);

  if (response.status !== 200) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  const data = await response.data;

  if (response.data.length) {
    setDataUsuario(data[0]);
    window.location.href = "/menu.html";
  } else {
    const pwdInput = q(EL.PASSWORD);
    pwdInput.value = "";
    pwdInput.focus();
    Modal.showInfo("error", "Erro", "Senha digitada é inválida !").then(() => {
      q(EL.PASSWORD).focus();
    });
  }
}

function setPayload(user) {
  const payload = {
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
  return payload;
}

async function setDataUsuario(user) {
  try {
    const payload = setPayload(user);
    const response = await API.fetchBody("/setPermission", "POST", payload);

    if (response.status !== 200) {
      throw new Error(`Erro ao salvar permissões ${response.data}`);
    }
  } catch (error) {
    console.error("Erro ao enviar dados:", error);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  Dom.setFocus(EL.ID);
  q(EL.ID).value = "";
  Dom.enableEnterAsTab();
  criarSpinnerGlobal();
  Dom.addEventBySelector("#bt_login", "click", passwordValidation);
  Dom.addEventBySelector("#txt_id", "blur", find_id);
});
