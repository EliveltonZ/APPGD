import { Dom } from "./UI/interface.js";
import { DateTime } from "./utils/time.js";
import { Modal } from "./utils/modal.js";

const EL = {
  CONTRATO: "#lb_contrato",
  CONTRATO1: "#lb_contrato-1",
  Q_PROJ: "#lb_qproj",
  NUM_PROJ: "#lb_numproj",
  CLIENTE: "#lb_cliente",
  CLIENTE1: "#lb_cliente-1",
  AMBIENTE: "#lb_ambiente",
  AMBIENTE1: "#lb_ambiente-1",
  VENDEDOR: "#lb_vendedor",
  DATA_ENTREGA: "#lb_dataentrega",
  ENTREGA: "#lb_entrega",
  PRONTO: "#lb_pronto",
  LIBERADOR: "#lb_liberador",
  NUM_OC: "#lb_numoc",
  OBSERVACOES: "#lb_observacoes",
  CORTE: "#lb_corte",
  LOTE: "#lb_lote",
  PEDIDO: "#lb_pedido",
  CORTE_INICIO: "#lb_corte_inicio",
  CORTE_FIM: "#lb_corte_fim",
  CORTE_RESP: "#lb_corte_resp",
  CORTE_PAUSA: "#lb_pausa_corte",
  CUSTOM_INICIO: "#lb_customizacao_inicio",
  CUSTOM_FIM: "#lb_customizacao_fim",
  CUSTOM_RESP: "#lb_custom_resp",
  CUSTOM_PAUSA: "#lb_pausa_custom",
  COLADEIRA_INCIO: "#lb_coladeira_inicio",
  COLADEIRA_FIM: "#lb_coladeira_fim",
  COLADEIRA_RESP: "#lb_coladeira_resp",
  COLADEIRA_PAUSA: "#lb_pausa_coladeira",
  USINAGEM_INICIO: "#lb_usinagem_inicio",
  USINAGEM_FIM: "#lb_usinagem_fim",
  USINAGEM_RESP: "#lb_usinagem_resp",
  USINAGEM_PAUSA: "#lb_pausa_usinagem",
  PAINEIS_INICIO: "#lb_paineis_inicio",
  PAINEIS_FIM: "#lb_paineis_fim",
  PAINEIS_RESP: "#lb_paineis_resp",
  PAINEIS_PAUSA: "#lb_pausa_paineis",
  MONTAGEM_INICIO: "#lb_montagem_inicio",
  MONTAGEM_FIM: "#lb_montagem_fim",
  MONTAGEM_RESP: "#lb_montagem_resp",
  MONTAGEM_PAUSA: "#lb_pausa_montagem",
  ACABAMENTO_INICIO: "#lb_acabamento_inicio",
  ACABAMENTO_FIM: "#lb_acabamento_fim",
  ACABAMENTO_RESP: "#lb_acabamento_resp",
  ACABAMENTO_PAUSA: "#lb_pausa_acabamento",
  EMBALAGEM_INICIO: "#lb_embalagem_inicio",
  EMBALAGEM_FIM: "#lb_embalagem_fim",
  EMBALAGEM_RESP: "#lb_embalagem_resp",
  EMBALAGEM_PAUSA: "#lb_pausa_embalagem",
  RESPONSAVEL: "#lb_responsavel",
  DATA: "#lb_data",
  TIPO: "#lb_tipo",
  URGENTE: "#lb_urgente",
  Q_AVULSO: "#lb_avulsoq",
  L_AVULSO: "#lb_avulsol",
  Q_PAINEIS: "#lb_paineisq",
  L_PAINEIS: "#lb_paineisl",
  Q_PORTA_ALUMINIO: "#lb_portaaluminioq",
  L_PORTA_ALUMINIO: "#lb_portaaluminiol",
  Q_VIDROS: "#lb_vidrosq",
  L_VIDROS: "#lb_vidrosl",
  Q_PECAS_PINTADAS: "#lb_pecaspintadasq",
  L_PECAS_PINTADAS: "#lb_pecaspintadasl",
  Q_TAPECARIA: "#lb_tapecariaq",
  L_TAPECARIA: "#lb_tapecarial",
  Q_SERRALHERIA: "#lb_serralheriaq",
  L_SERRALHERIA: "#lb_serralherial",
  Q_CABIDE: "#lb_cabideq",
  L_CABIDE: "#lb_cabidel",
  Q_TRILHO: "#lb_trilhoq",
  L_TRILHO: "#lb_trilhol",
  Q_MODULOS: "#lb_modulosq",
  L_MODULOS: "#lb_modulosl",
  MOTORISTA: "#lb_motorista",
  CONFERIDO: "#lb_conferido",
  TOTAL_VOLUMES: "#lb_totalvolumes",
  DIV_URGENTE: "#div_urgente",
  LB_URGENTE: "#lb_urgente",
};

function fillElements(ordemdecompra) {
  if (ordemdecompra) {
    const res = JSON.parse(localStorage.getItem("project"));
    const data = res[0];
    const numoc = `${ordemdecompra.slice(0, 8)}-${ordemdecompra.slice(-2)}`;
    Dom.setInnerHtml(EL.CONTRATO, data.p_contrato);
    Dom.setInnerHtml(EL.CONTRATO1, data.p_contrato);
    Dom.setInnerHtml(EL.Q_PROJ, Number(data.p_numproj.slice(-2)));
    Dom.setInnerHtml(EL.NUM_PROJ, data.p_numproj);
    Dom.setInnerHtml(EL.CLIENTE, data.p_cliente);
    Dom.setInnerHtml(EL.AMBIENTE, data.p_ambiente);
    Dom.setInnerHtml(EL.CLIENTE1, data.p_cliente);
    Dom.setInnerHtml(EL.AMBIENTE1, data.p_ambiente);
    Dom.setInnerHtml(EL.VENDEDOR, data.p_vendedor);
    Dom.setInnerHtml(EL.DATA_ENTREGA, DateTime.forBr(data.p_dataentrega));
    Dom.setInnerHtml(EL.LIBERADOR, data.p_liberador);
    Dom.setInnerHtml(EL.NUM_OC, numoc);
    Dom.setInnerHtml(EL.CORTE, data.p_codcc);
    Dom.setInnerHtml(EL.LOTE, data.p_lote);
    Dom.setInnerHtml(EL.PEDIDO, data.p_pedido);
    colorUrgente(getLocalStorageItem("urgente"));
    Dom.setInnerHtml(EL.URGENTE, getLocalStorageItem("urgente"));
    buildGridVols(data.p_totalvolumes);
  }
}

function getLocalStorageItem(item) {
  return localStorage.getItem(item);
}

function colorUrgente(value) {
  if (value === "SIM") {
    const div = document.getElementById(EL.DIV_URGENTE);
    div.style.background = "red";
    const label = document.getElementById(EL.LB_URGENTE);
    label.style.color = "white";
  }
}

function isBool(value) {
  if (value == true) {
    return "SIM";
  }
  return "NÃO";
}

function fillTableAcessorios(ordemdecompra) {
  try {
    const data = JSON.parse(localStorage.getItem("acessorios"));
    const tbody = document.querySelectorAll("table tbody")[0];
    const td = "td";
    const font9 = "font-size: 9px; ";
    const fCenter = "text-align: center;";
    tbody.innerHTML = "";

    data.forEach((item) => {
      const tr = document.createElement("tr");
      tr.append(Dom.createElement(td, item.categoria, font9));
      tr.append(Dom.createElement(td, item.descricao, font9));
      tr.append(Dom.createElement(td, item.medida, font9 + fCenter));
      tr.append(Dom.createElement(td, item.qtd, font9 + fCenter));
      tbody.appendChild(tr);
    });
  } catch (err) {
    Modal.showInfo(
      "error",
      "Erro",
      `Não foi possível carregar os dados. ${err.message}`,
    );
  }
}

function buildGridVols(values) {
  const container = document.getElementById("checkboxes");

  for (let i = 1; i <= values; i++) {
    const item = document.createElement("div");
    item.className = "item";
    item.style = "margin-left: 30px";
    item.innerHTML = `<input type="checkbox"> <span>${i}</span>`;
    container.appendChild(item);
  }
}

function loadData() {
  const ordemdecompra = localStorage.getItem("numoc");
  fillElements(ordemdecompra);
}

document.addEventListener("DOMContentLoaded", (event) => {
  loadData();
});
