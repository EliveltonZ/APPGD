import {
  Dom,
  loadPage,
  enableEnterAsTab,
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

    Dom.setValue("txt_login", item.login);
    Dom.setValue("txt_setor", item.setor);
    Dom.setValue("txt_camiseta", item.camiseta);
    Dom.setValue("txt_calca", item.calca);
    Dom.setValue("txt_sapato", item.sapato);
    Dom.setValue("txt_local", item.local);
    Dom.setChecked("chk_ativo", item.ativo);
    Dom.setChecked("chk_projetos", item.projetos);
    Dom.setChecked("chk_producao", item.producao);
    Dom.setChecked("chk_expedicao", item.expedicao);
    Dom.setChecked("chk_usuarios", item.usuarios);
    Dom.setChecked("chk_acessos", item.acessos);
    Dom.setChecked("chk_definicoes", item.definicoes);
    Dom.setChecked("chk_calcular", item.pcp);
    Dom.setChecked("chk_previsoes", item.previsao);
    Dom.setChecked("chk_compras", item.compras);
    Dom.setChecked("chk_solicitacao", item.solicitacao);
    Dom.setChecked("chk_prodass", item.prodass);
    Dom.setChecked("chk_valores", item.valores);
    Dom.setChecked("chk_logistica", item.logistica);
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
  if (Dom.getValue("txt_id") <= 0) return;
  const result = await messageQuestion(null, "Deseja confirmar alterações?");

  if (result.isConfirmed) {
    const data = {
      p_id: Dom.getValue("txt_id"),
      p_login: Dom.getValue("txt_login"),
      p_setor: Dom.getValue("txt_setor"),
      p_camiseta: Dom.getValue("txt_camiseta"),
      p_calca: Dom.getValue("txt_calca"),
      p_sapato: Dom.getValue("txt_sapato"),
      p_local: Dom.getValue("txt_local"),
      p_ativo: Dom.getChecked("chk_ativo"),
      p_projetos: Dom.getChecked("chk_projetos"),
      p_producao: Dom.getChecked("chk_producao"),
      p_expedicao: Dom.getChecked("chk_expedicao"),
      p_usuarios: Dom.getChecked("chk_usuarios"),
      p_acessos: Dom.getChecked("chk_acessos"),
      p_definicoes: Dom.getChecked("chk_definicoes"),
      p_calcular: Dom.getChecked("chk_calcular"),
      p_previsoes: Dom.getChecked("chk_previsoes"),
      p_compras: Dom.getChecked("chk_compras"),
      p_solicitacao: Dom.getChecked("chk_solicitacao"),
      p_prodass: Dom.getChecked("chk_prodass"),
      p_valores: Dom.getChecked("chk_valores"),
      p_logistica: Dom.getChecked("chk_logistica"),
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

Dom.addEventBySelector("#bt_salvar", "click", setUserAccess);
Dom.addEventBySelector("#txt_id", "blur", getUserAccess);
