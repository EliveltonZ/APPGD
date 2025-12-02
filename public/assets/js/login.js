import {
  Dom,
  enableEnterAsTab,
  messageInformation,
  messageQuestion,
  criarSpinnerGlobal,
  getCookie,
} from "./utils.js";

/*=============================
  HELPERS Elements
=============================*/

const SEL = {
  ID: "#txt_id",
  PASSWORD: "#txt_senha",
};

/*=============================
  HELPERS DOM
=============================*/

const q = function (element) {
  return document.querySelector(element);
};

const qa = function (element) {
  return document.querySelectorAll(element);
};

const ls = function (key, value) {
  localStorage.setItem(key, value);
};

/*=============================
  HELPERS API
=============================*/

const API = {
  fetchQuery: async function (url) {
    const response = await fetch(url);
    return await response.json();
  },

  fetchBody: async function (url, method, data) {
    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
};

/*=============================
  HELPER CONTROLERS
=============================*/

async function findID() {
  const response = await API.fetchQuery(
    `/getMontador?p_codigo=${Dom.getValue(SEL.ID.slice(1))}`
  );
  Dom.setValue("txt_nome", response[0].p_nome);
}

async function validateCredencials(event) {
  const form = q("form");
  if (form.checkValidity()) {
    event.preventDefault();
    const id = Dom.getValue(SEL.ID.slice(1));
    const password = Dom.getValue(SEL.PASSWORD.slice(1));
    const response = await API.fetchQuery(
      `/validateLogin?p_codigo=${id}&p_senha=${password}`
    );
    if (response.length > 0) {
      console.log(response[0]);
      ls("id_montador", response[0].codigo);
      ls("montador", response[0].nome);
      window.location.href = "/pecas.html";
    } else {
      await messageInformation(
        "error",
        "ATENÇÃO",
        "Usuario ou senha invalidos"
      );
      q(SEL.PASSWORD).value = "";
      q(SEL.PASSWORD).focus();
    }
  }
}

/*============================
  HELPER EVENT's
============================*/

document.addEventListener("DOMContentLoaded", (event) => {
  q(SEL.ID).focus();
});

Dom.addEventBySelector(SEL.ID, "blur", findID);
Dom.addEventBySelector("button", "click", validateCredencials);
