import {
  setFocus,
  loadPage,
  allUpperCase,
  getText,
  addEventById,
  messageInformation,
  messageQuestion,
} from "./utils.js";

async function getMaxId() {
  const response = await fetch("/getMaxId");
  if (!response.ok) {
    const errText = await response.text();

    messageInformation(
      "error",
      "Não foi possivel conectar na base de dados" + errText
    );
  } else {
    const data = await response.json();
    const max_id = data[0].max_id;
    document.getElementById("txt_id").value = max_id;
  }
}

function getValue(element) {
  const value = document.getElementById(element).value.toUpperCase();
  return value;
}

async function insertUser() {
  const result = await messageQuestion(
    "Confirmar",
    `Deseja adicionar ${getText("txt_login")} ?`
  );

  if (result.isConfirmed) {
    const data = {
      p_id: getValue("txt_id"),
      p_login: getValue("txt_login"),
      p_senha: "123456",
      p_setor: getValue("txt_setor"),
      p_camiseta: getValue("txt_camiseta"),
      p_calca: getValue("txt_calca"),
      p_sapato: getValue("txt_sapato"),
      p_local: getValue("txt_local"),
    };

    const response = await fetch("/insertUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errText = await response.text();
      messageInformation(
        "error",
        "ERRO",
        `erro ao inserir novo Usuario ${errText}`
      );
    } else {
      messageInformation(
        "success",
        "Sucesso",
        `Usuário ${getValue("txt_login")} inserido com sucesso !!!`
      );
    }
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("adicionar_usuarios", "add_users.html");
  allUpperCase();
  getMaxId();
  setFocus("txt_login");
});

addEventById("#bt_adicionar", "click", insertUser);
