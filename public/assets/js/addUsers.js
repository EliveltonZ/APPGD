import {
  Dom,
  loadPage,
  allUpperCase,
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

async function insertUser() {
  const result = await messageQuestion(
    "Confirmar",
    `Deseja adicionar ${Dom.getValue("txt_login")} ?`
  );

  if (result.isConfirmed) {
    const data = {
      p_id: Dom.getValue("txt_id"),
      p_login: Dom.getValue("txt_login"),
      p_senha: "123456",
      p_setor: Dom.getValue("txt_setor"),
      p_camiseta: Dom.getValue("txt_camiseta"),
      p_calca: Dom.getValue("txt_calca"),
      p_sapato: Dom.getValue("txt_sapato"),
      p_local: Dom.getValue("txt_local"),
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
        `Usuário ${Dom.getValue("txt_login")} inserido com sucesso !!!`
      );
    }
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("adicionar_usuarios", "usuarios.html");
  Dom.allUpperCase();
  getMaxId();
  Dom.setFocus("txt_login");
});

Dom.addEventBySelector("#bt_adicionar", "click", insertUser);
