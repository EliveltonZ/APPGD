import {
  getText,
  setText,
  getChecked,
  setChecked,
  loadPage,
  enableEnterAsTab,
  addEventBySelector,
  messageQuestion,
  messageInformation,
} from "./utils.js";

async function getUserAccess() {
  const id = document.getElementById("txt_id").value.trim();
  if (!id || id <= 0) {
    messageInformation("error", "ERRO", "ID precisa ser numero maior que 0");
    return;
  }

  try {
    const response = await fetch(
      `/getUserAccess?p_id=${encodeURIComponent(id)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const u = await response.json();
    const item = u[0];

    if (!item) {
      throw new Error("Nenhum dado recebido");
    }

    setText("txt_login", item.login);
    setText("txt_setor", item.setor);
    setText("txt_camiseta", item.camiseta);
    setText("txt_calca", item.calca);
    setText("txt_sapato", item.sapato);
    setText("txt_local", item.local);
    setChecked("chk_ativo", item.ativo);
    setChecked("chk_projetos", item.projetos);
    setChecked("chk_producao", item.producao);
    setChecked("chk_expedicao", item.expedicao);
    setChecked("chk_usuarios", item.usuarios);
    setChecked("chk_acessos", item.acessos);
    setChecked("chk_definicoes", item.definicoes);
    setChecked("chk_calcular", item.pcp);
    setChecked("chk_previsoes", item.previsao);
    setChecked("chk_compras", item.compras);
    setChecked("chk_solicitacao", item.solicitacao);
    setChecked("chk_prodass", item.prodass);
    setChecked("chk_valores", item.valores);
    setChecked("chk_logistica", item.logistica);
  } catch (err) {
    messageInformation(
      "error",
      "Erro",
      `Ocorreu um erro ao buscar dados: ${err.message}`
    );
  }
}

function senhaFocus() {
  document.getElementById("txt_id").focus();
}

async function setUserAccess() {
  if (getText("txt_id") <= 0) return;
  const result = await messageQuestion(null, "Deseja confirmar alterações?");

  if (result.isConfirmed) {
    const data = {
      p_id: getText("txt_id"),
      p_login: getText("txt_login"),
      p_setor: getText("txt_setor"),
      p_camiseta: getText("txt_camiseta"),
      p_calca: getText("txt_calca"),
      p_sapato: getText("txt_sapato"),
      p_local: getText("txt_local"),
      p_ativo: getChecked("chk_ativo"),
      p_projetos: getChecked("chk_projetos"),
      p_producao: getChecked("chk_producao"),
      p_expedicao: getChecked("chk_expedicao"),
      p_usuarios: getChecked("chk_usuarios"),
      p_acessos: getChecked("chk_acessos"),
      p_definicoes: getChecked("chk_definicoes"),
      p_calcular: getChecked("chk_calcular"),
      p_previsoes: getChecked("chk_previsoes"),
      p_compras: getChecked("chk_compras"),
      p_solicitacao: getChecked("chk_solicitacao"),
      p_prodass: getChecked("chk_prodass"),
      p_valores: getChecked("chk_valores"),
      p_logistica: getChecked("chk_logistica"),
    };

    const response = await fetch("/setUserAccess", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    messageInformation("success", "Sucesso", "Dados atualizados com sucesso!");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadPage("acesso", "acessos.html");
  enableEnterAsTab();
  senhaFocus();
});

addEventBySelector("#bt_salvar", "click", setUserAccess);
addEventBySelector("#txt_id", "blur", getUserAccess);
