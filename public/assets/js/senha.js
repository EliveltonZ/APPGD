import {
  setFocus,
  getText,
  setText,
  messageInformation,
  addEventBySelector,
  getCookie,
  enableEnterAsTab,
} from "./utils.js";

function setTextEmpty(element) {
  document.getElementById(element).value = "";
}

async function checkPassword() {
  const dict = {
    p_id: getText("txt_id"),
    p_senha: getText("txt_senhaatual"),
  };

  const response = await fetch("/passwordValidation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dict),
  });

  if (!response.ok) {
    throw new Error(`Status ${response.status}`);
  }
  const data = await response.json();
  return data;
}

async function setPassword() {
  try {
    const _dict = {
      p_id: getText("txt_id"),
      p_senha: getText("txt_novasenha"),
    };

    if (!_dict.p_id || !_dict.p_senha) {
      messageInformation("error", "ERRO", "ID ou senha não podem ser vazios.");
      return;
    }

    const resp = await fetch("/alterarSenha", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(_dict),
    });

    if (!resp.ok) {
      throw new Error(`Erro HTTP: ${resp.status}`);
    }

    messageInformation(
      "success",
      "Sucesso",
      "Nova senha definida com Sucesso!!!"
    );
  } catch (error) {
    console.error(error);
    messageInformation(
      "error",
      "ERRO",
      "Houve um erro ao executar alteração de senha"
    );
  }
}

async function alterarSenha() {
  const data = await checkPassword();
  const hasData = Array.isArray(data)
    ? data.length > 0
    : data && Object.keys(data).length > 0;

  if (hasData) {
    if (getText("txt_novasenha") == getText("txt_confirmsenha")) {
      await setPassword();
    } else {
      messageInformation("warning", "Atenção", "Senhas nao conferem!!!");
    }
  } else {
    messageInformation("error", "Erro", "Senha digitada é inválida!");
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  setFocus("txt_senhaatual");
  enableEnterAsTab();
});

setText("txt_id", await getCookie("id"));
setText("txt_nome", await getCookie("login"));

addEventBySelector("#bt_senha", "click", alterarSenha);
