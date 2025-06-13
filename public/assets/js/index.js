import Swal from "./sweetalert2.esm.all.min.js";
import {
  setFocus,
  enableEnterAsTab,
  getText,
  addEventBySelector,
  messageInformation,
  messageQuestion,
  criarSpinnerGlobal,
} from "./utils.js";

async function find_id() {
  const txtId = document.getElementById("txt_id");
  const txtLogin = document.getElementById("txt_login");
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
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Número de ID não encontrado na base de dados!",
    }).then(() => {
      txtId.value = "";
      txtId.focus();
    });
  }
}

async function passwordValidation(event) {
  const dict = {
    p_id: getText("txt_id"),
    p_senha: getText("password"),
  };

  const response = await fetch("/passwordValidation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dict),
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  const data = await response.json();

  const hasData = Array.isArray(data)
    ? data.length > 0
    : data && Object.keys(data).length > 0;

  if (hasData) {
    setDataUsuario(data[0]);
    window.location.href = "menu.html";
  } else {
    const pwdInput = document.getElementById("password");
    pwdInput.value = "";
    pwdInput.focus();
    messageInformation("error", "Erro", "Senha digitada é inválida !");
  }
}

function setDataUsuario(data) {
  localStorage.setItem("id", data.id);
  localStorage.setItem("usuario", data.login);
  localStorage.setItem("adicionar_projetos", data.adicionar_projetos);
  localStorage.setItem("producao", data.producao);
  localStorage.setItem("expedicao", data.expedicao);
  localStorage.setItem("adicionar_usuarios", data.adicionar_usuarios);
  localStorage.setItem("acesso", data.acesso);
  localStorage.setItem("definicoes", data.definicoes);
  localStorage.setItem("pcp", data.pcp);
  localStorage.setItem("previsao", data.previsao);
  localStorage.setItem("compras", data.compras);
  localStorage.setItem("ativo", data.ativo);
  localStorage.setItem("producao_assistencia", data.producao_assistencia);
  localStorage.setItem("solicitar_assistencia", data.solicitar_assistencia);
  localStorage.setItem("valores", data.valores);
  localStorage.setItem("logistica", data.logistica);
}

window.addEventListener("DOMContentLoaded", () => {
  setFocus("txt_id");
  document.getElementById("txt_id").value = "";
  enableEnterAsTab();
  criarSpinnerGlobal();
});

addEventBySelector("#bt_login", "click", passwordValidation);
addEventBySelector("#txt_id", "blur", find_id);
