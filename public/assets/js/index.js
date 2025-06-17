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
    window.location.href = "/menu.html";
  } else {
    const pwdInput = document.getElementById("password");
    pwdInput.value = "";
    pwdInput.focus();
    messageInformation("error", "Erro", "Senha digitada é inválida !");
  }
}

async function setDataUsuario(user) {
  try {
    const payload = {
      user: user.id,
      nome: user.nome,
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
      logistica: user.logistica,
    };

    const response = await fetch("/setPermission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar permissões no backend");
    }

    console.log("Dados de usuário enviados com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar dados:", error);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setFocus("txt_id");
  document.getElementById("txt_id").value = "";
  enableEnterAsTab();
  criarSpinnerGlobal();
});

addEventBySelector("#bt_login", "click", passwordValidation);
addEventBySelector("#txt_id", "blur", find_id);
