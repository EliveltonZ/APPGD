import { getCookie } from "./utils.js";
import { Dom } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";
import { API } from "./service/api.js";

/*===========================
  HELPER ELEMENTS
===========================*/
const EL = {
  ID: "#txt_id",
  SENHA_ATUAL: "#txt_senhaatual",
  NOVA_SENHA: "#txt_novasenha",
  CONFIRMAR_SENHA: "#txt_confirmsenha",
  NOME: "#txt_nome",
  BT_SENHA: "#bt_senha",
};

const DB = {
  validatePassword: async function (payload) {
    const res = await API.fetchBody("/passwordValidation", "POST", payload);
    return res;
  },
};

function buildPasswordValidationPayload() {
  return {
    p_id: Dom.getValue(EL.ID),
    p_senha: Dom.getValue(EL.SENHA_ATUAL),
  };
}

async function validateCurrentPassword() {
  const payload = buildPasswordValidationPayload();
  const res = await DB.validatePassword(payload);

  if (res.status !== 200) {
    throw new Error(`Status ${res.status}`);
  }

  return res.data;
}

function hasValidPasswordData(data) {
  return Array.isArray(data)
    ? data.length > 0
    : data && Object.keys(data).length > 0;
}

function isNewPasswordConfirmed() {
  return Dom.getValue(EL.NOVA_SENHA) === Dom.getValue(EL.CONFIRMAR_SENHA);
}

function buildPasswordUpdatePayload() {
  return {
    p_id: Dom.getValue(EL.ID),
    p_senha: Dom.getValue(EL.NOVA_SENHA),
  };
}

async function updateUserPassword() {
  try {
    const payload = buildPasswordUpdatePayload();

    if (!payload.p_id || !payload.p_senha) {
      Modal.showInfo("error", "ERRO", "ID ou senha não podem ser vazios.");
      return;
    }

    const resp = await fetch("/alterarSenha", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      throw new Error(`Erro HTTP: ${resp.status}`);
    }

    Modal.showInfo("success", "Sucesso", "Nova senha definida com Sucesso!!!");
  } catch (error) {
    console.error(error);
    Modal.showInfo(
      "error",
      "ERRO",
      "Houve um erro ao executar alteração de senha"
    );
  }
}

async function handlePasswordUpdate() {
  const data = await validateCurrentPassword();
  const isValid = hasValidPasswordData(data);

  if (!isValid) {
    Modal.showInfo("error", "Erro", "Senha digitada é inválida!");
    return;
  }

  if (!isNewPasswordConfirmed()) {
    Modal.showInfo("warning", "Atenção", "Senhas não conferem!!!");
    return;
  }

  await updateUserPassword();
}

document.addEventListener("DOMContentLoaded", () => {
  Dom.setFocus(EL.SENHA_ATUAL);
  Dom.enableEnterAsTab();
});

// Preenche campos com cookies
Dom.setValue(EL.ID, await getCookie("id"));
Dom.setValue(EL.NOME, await getCookie("login"));

// Evento do botão
Dom.addEventBySelector(EL.BT_SENHA, "click", handlePasswordUpdate);
