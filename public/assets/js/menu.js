import {
  Dom,
  messageInformation,
  messageQuestion,
  getCookie,
} from "./utils.js";

async function exibirNome() {
  const usuario = await getCookie("login");
  document.getElementById("txt_usuario").innerText = usuario;
  document.getElementById("txt_resp").value = usuario;
}

function checkUrgente() {
  const checked = document.getElementById("chk_urgente").checked;
  if (checked) {
    return "SIM";
  } else {
    return "-";
  }
}

function findBuyOrder() {
  localStorage.setItem("numoc", document.getElementById("txt_numoc").value);
  localStorage.setItem("resp", document.getElementById("txt_resp").value);
  localStorage.setItem("tipo", document.getElementById("txt_tipo").value);
  localStorage.setItem("urgente", checkUrgente());
  localStorage.setItem("data", document.getElementById("txt_data").value);
}

async function printPageCapa() {
  if (Dom.getValue("txt_tipo") == "-") {
    messageInformation("warning", "Atenção", "Selecione o tipo do Projeto");
    return;
  }

  Dom.handleClass("lb_capa", "d-none", "add");
  Dom.handleClass("spinner", "d-none", "remove");
  findBuyOrder();
  await loadData();
  document.getElementById("iframeImpressao").contentWindow.location.reload();
  var iframe = document.getElementById("iframeImpressao");
  setTimeout(async function () {
    iframe.contentWindow.print();
    Dom.handleClass("lb_capa", "d-none", "remove");
    Dom.handleClass("spinner", "d-none", "add");
    await setType(
      Dom.getValue("txt_numoc"),
      Dom.getValue("txt_tipo"),
      Dom.getChecked("chk_urgente")
    );
  }, 500);
}

async function printPageCapaPendencia() {
  Dom.handleClass("lb_pendencias", "d-none", "add");
  Dom.handleClass("spinner-1", "d-none", "remove");
  findBuyOrder();
  await loadData();
  document.getElementById("iframeImpressao1").contentWindow.location.reload();
  var iframe = document.getElementById("iframeImpressao1");
  setTimeout(function () {
    iframe.contentWindow.print();
    Dom.handleClass("lb_pendencias", "d-none", "remove");
    Dom.handleClass("spinner-1", "d-none", "add");
  }, 500);
}

async function logout() {
  const result = await messageQuestion(null, "Deseja sair do Sistema ?");
  if (result.isConfirmed) {
    await clearDataUsuario();
    localStorage.clear();
    window.location.href = "/";
  }
}

async function loadData() {
  const buyOrder = Dom.getValue("txt_numoc");
  await fillElements(buyOrder);
  await fillTableAcessorios(buyOrder);
}

async function fillElements(buyOrder) {
  if (!buyOrder || buyOrder.trim() === "") {
    console.warn("Ordem de compra inválida ou ausente. Cancelando fetch.");
    return;
  }

  const response = await fetch(`/fillElements?p_ordemdecompra=${buyOrder}`);

  if (!response.ok) {
    const errTExt = await response.text();
    console.error("Erro ao carregar os dados:", errTExt);
  } else {
    const numoc = `${buyOrder.slice(0, 8)}-${buyOrder.slice(-2)}`;
    const data = await response.json();
    localStorage.setItem("project", JSON.stringify(data[0]));
  }
}

async function fillTableAcessorios(buyOrder) {
  const response = await fetch(
    `/fillTableAcessorios?p_ordemdecompra=${buyOrder}`
  );

  try {
    const data = await response.json();
    localStorage.setItem("acessorios", JSON.stringify(data));
  } catch (err) {
    messageInformation(
      "error",
      "Erro",
      `Não foi possível carregar os dados. ${err.message}`
    );
  }
}

async function clearDataUsuario() {
  try {
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

async function setType(p_ordemdecompra, p_tipo, p_urgente) {
  const response = await fetch(
    `/setTipo?p_ordemdecompra=${p_ordemdecompra}&p_tipo=${p_tipo}&p_urgente=${p_urgente}`
  );

  if (!response.ok) {
    const result = await response.json();
    messageInformation("error", "ERRO", `${result}`);
  }
}

async function dashboardPermission() {
  const element = document.getElementById("dashboard");
  try {
    const response = await fetch("/checkPermission", {
      credentials: "include",
    });

    if (!response.ok) throw new Error("Não autenticado");

    const permissoes = await response.json();
    const valorPermissao = permissoes["dashboard"];

    if (valorPermissao) {
      window.location.href = "https://dashboardgd.streamlit.app/";
    } else {
      messageInformation("error", "ERRO", "Usuario sem Permissão");
    }
  } catch {}
}

document.addEventListener("DOMContentLoaded", (event) => {
  Dom.setData("txt_data");
  exibirNome();
});

Dom.addEventBySelector("#link_logout", "click", logout);
Dom.addEventBySelector("#bt_capa", "click", printPageCapa);
Dom.addEventBySelector("#bt_capa_pendencia", "click", printPageCapaPendencia);
Dom.addEventBySelector("#dashboard", "click", dashboardPermission);
