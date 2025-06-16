import {
  getChecked,
  getText,
  setData,
  messageInformation,
  messageQuestion,
  addEventBySelector,
} from "./utils.js";

async function exibirNome() {
  const usuario = await getValue("login");
  document.getElementById("txt_usuario").innerText = usuario;
  document.getElementById("txt_resp").value = usuario;
}

function exitSistem() {
  localStorage.clear();
  document.location.href = "index.html";
}

function checkUrgente() {
  const checked = document.getElementById("chk_urgente").checked;
  if (checked) {
    return "SIM";
  } else {
    return "-";
  }
}

async function getValue(accessKey) {
  const response = await fetch("/checkPermission", {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Não autenticado");

  const permissoes = await response.json();
  return permissoes[accessKey];
}

async function findBuyOrder() {
  localStorage.setItem("numoc", document.getElementById("txt_numoc").value);
  localStorage.setItem("resp", document.getElementById("txt_resp").value);
  localStorage.setItem("tipo", document.getElementById("txt_tipo").value);
  localStorage.setItem("urgente", checkUrgente());
  localStorage.setItem("data", document.getElementById("txt_data").value);
  document.getElementById("iframeImpressao").contentWindow.location.reload();
}

function printPage() {
  var iframe = document.getElementById("iframeImpressao");
  setTimeout(function () {
    iframe.contentWindow.print();
  }, 1500);
}

async function clickPrint() {
  findBuyOrder();
  printPage();
}

async function logout() {
  const result = await messageQuestion(null, "Deseja sair do Sistema ?");
  if (result.isConfirmed) {
    localStorage.clear();
    document.location.href = "index.html";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setData("txt_data");
  exibirNome();
});

addEventBySelector("#link_logout", "click", logout);
addEventBySelector("#bt_capa", "click", clickPrint);
