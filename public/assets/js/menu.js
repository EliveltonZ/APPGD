import {
  getChecked,
  getText,
  setData,
  messageInformation,
  messageQuestion,
  addEventBySelector,
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
  findBuyOrder();
  await loadData();
  document.getElementById("iframeImpressao").contentWindow.location.reload();
  var iframe = document.getElementById("iframeImpressao");
  setTimeout(function () {
    iframe.contentWindow.print();
  }, 500);
}

async function printPageCapaPendencia() {
  findBuyOrder();
  await loadData();
  document.getElementById("iframeImpressao1").contentWindow.location.reload();
  var iframe = document.getElementById("iframeImpressao1");
  setTimeout(function () {
    iframe.contentWindow.print();
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
  const buyOrder = getText("txt_numoc");
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
      permissoes: false,
      login: "Não Logado",
      adicionar_projetos: false,
      producao: false,
      expedicao: false,
      adicionar_usuarios: false,
      acesso: false,
      definicoes: false,
      pcp: false,
      previsao: false,
      compras: false,
      ativo: false,
      producao_assistencia: false,
      solicitar_assistencia: false,
      valores: false,
      logistica: false,
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

document.addEventListener("DOMContentLoaded", (event) => {
  setData("txt_data");
  exibirNome();
});

addEventBySelector("#link_logout", "click", logout);
addEventBySelector("#bt_capa", "click", printPageCapa);
addEventBySelector("#bt_capa_pendencia", "click", printPageCapaPendencia);
