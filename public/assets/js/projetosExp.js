import Swal from "./sweetalert2.esm.all.min.js";
import {
  ajustarTamanhoModal,
  loadPage,
  setDate,
  getName,
  confirmDateInsertion,
  handleElementsUser,
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";
import { Dom, Style, Table, q, ce, qa } from "./UI/interface.js";
import { API, Service } from "./service/api.js";
import { DateTime } from "./utils/time.js";
import { Modal } from "./utils/modal.js";
import { Email } from "./utils/email.js";
import { Numbers } from "./utils/number.js";

const DB = {
  getAcessorios: async function (orderBy) {
    const url = `/fillTableAcessorios?p_ordemdecompra=${orderBy}`;
    const res = await API.fetchQuery(url);
    return res;
  },

  getProjects: async function (date_condition) {
    const url = `/fillTableExp?data_condition=${date_condition}`;
    const res = await API.fetchQuery(url);
    return res;
  },

  getExpedicao: async function (ordemdecompra) {
    const url = `/getExpedicao?p_ordemdecompra=${ordemdecompra}`;
    const res = await API.fetchQuery(url);
    return res;
  },

  setDataExpediao: async function (payload) {
    const res = await API.fetchBody("/setDataExpedicao", "PUT", payload);
    return res;
  },

  getOperadores: async function () {
    const res = await API.fetchQuery("/getOperadores");
    return res;
  },

  getConfig: async function (params) {
    const url = `/getDate?p_id=${params}`;
    const res = await API.fetchQuery(url);
    return res;
  },

  setConfig: async function (params) {
    const res = await API.fetchBody("/setDate", "PUT", params);
    return res;
  },
};

const EL = {
  // PROJETO
  NUM_OC: "#txt_numoc",
  CLIENTE: "#txt_cliente",
  CONTRATO: "#txt_contrato",
  CORTE_CERTO: "#txt_codcc",
  AMBIENTE: "#txt_ambiente",
  NUM_PROJ: "#txt_numproj",
  LOTE: "#txt_lote",
  CHEGOU_FABRICA: "#txt_chegoufabrica",
  DATA_ENTREGA: "#txt_dataentrega",
  PREVISAO: "#txt_previsao",
  OBSERVACOES: "#txt_observacoes",

  //PRODUÇÃO
  PRONTO: "#txt_pronto",
  PRONTO_ID: "#txt_prontoid",
  PRONTO_RESP: "#txt_prontoresp",
  CHK_PRONTO: "#chk_pronto",
  ENTREGA: "#txt_entrega",
  ENTREGA_ID: "#txt_entregaid",
  ENTREGA_RESP: "#txt_entregaresp",
  CHK_ENTREGA: "#chk_entrega",
  CHK_SEPARACAO: "#chk_separacao",
  SEPARACAO: "#txt_separacao",
  CHK_PENDENCIA: "#chk_pendencia",
  CHK_PARCIAL: "#chk_parcial",
  CHK_ETAPAS: "#chk_etapas",
  ETAPA: "#txt_etapas",
  TABLE_ACESSORIOS: "#table_acessorios",

  // EMBALAGEM
  EMBALAGEM_INICIO: "#txt_embalageminicio",
  EMBALAGEM_FIM: "#txt_embalagemfim",
  EMBALAGEM_PAUSA: "#chk_embalagem",
  EMBALAGEM_ID: "#txt_embalagemid",
  EMBALAGEM_C_INICIO: "#chk_embalageminicio",
  EMBALAGEM_C_FIM: "#chk_embalagemfim",
  EMBALAGEM_RESP: "#txt_embalagemresp",

  // ITENS ESPECIAIS LOCAIS E QUANTIDADES
  CHK_ACESSORIOS_AVULSOS: "#chk_acessoriosavulsos",
  Q_ACESSORIOS_AVULSOS: "#txt_acessoriosavulsosq",
  L_ACESSORIOS_AVULSOS: "#txt_acessoriosavulsosl",

  CHK_PAINEIS: "#chk_paineis",
  Q_PAINEIS: "#txt_paineisq",
  L_PAINEIS: "#txt_paineisl",

  CHK_PORTA_ALUMINIO: "#chk_portaaluminio",
  Q_PORTA_ALUMINIO: "#txt_portaaluminioq",
  L_PORTA_ALUMINIO: "#txt_portaaluminiol",

  CHK_VIDRO_ESPELHO: "#chk_vidroespelho",
  Q_VIDRO_ESPELHO: "#txt_vidroespelhoq",
  L_VIDRO_ESPELHO: "#txt_vidroespelhol",

  CHK_PECA_PINTURA: "#chk_pecapintura",
  Q_PECA_PINTURA: "#txt_pecapinturaq",
  L_PECA_PINTURA: "#txt_pecapintural",

  CHK_TAPECARIA: "#chk_tapecaria",
  Q_TAPECARIA: "#txt_tapecariaq",
  L_TAPECARIA: "#txt_tapecarial",

  CHK_SERRALHERIA: "#chk_serralheria",
  Q_SERRALHERIA: "#txt_serralheriaq",
  L_SERRALHERIA: "#txt_serralherial",

  CHK_CABIDE: "#chk_cabide",
  Q_CABIDE: "#txt_cabideq",
  L_CABIDE: "#txt_cabidel",

  CHK_TRILHOS: "#chk_trilhos",
  Q_TRILHOS: "#txt_trilhosq",
  L_TRILHOS: "#txt_trilhosl",

  CHK_VOLUMES_MODULACAO: "#chk_volumesmodulacao",
  Q_VOLUMES_MODULACAO: "#txt_volumesmodulacaoq",
  L_VOLUMES_MODULACAO: "#txt_volumesmodulacaol",

  VOL_MOD: "#txt_volmod",
  TAMANHO: "#txt_tamanho",

  //ELEMENTS UI
  DATA_FILTRO: "#txt_datafilter",
  BT_FUNCIONARIOS: "#bt_funcionarios",
  TABLE: "#table",
  BT_SALVAR: "#bt_salvar",
  TABLE_MODAL: "#modal-1 tbody",
  MODAL: "#modal-1",
};

async function populateTableAcessorios(ordemdecompra) {
  const response = await DB.getAcessorios(ordemdecompra);

  if (response.status !== 200) {
    Modal.showInfo("error", "ERRO", `ERRO: ${response.data}`);
  } else {
    const tbody = q("#modal tbody");
    const td = "td";
    const tCenter = "text-align: center; ";
    const font9 = "font-size: 9px; ";

    tbody.innerHTML = "";
    response.data.forEach((item) => {
      const tr = ce("tr");
      tr.append(Dom.createElement(td, item.id, tCenter + "display: none"));
      tr.append(Dom.createElement(td, item.descricao, tCenter + font9));
      tr.append(Dom.createElement(td, item.medida, tCenter + font9));
      tr.append(Dom.createElement(td, item.qtd, tCenter + font9));
      tr.append(
        Dom.createElement(td, DateTime.forBr(item.datacompra), tCenter + font9)
      );
      tr.append(
        Dom.createElement(td, DateTime.forBr(item.previsao), tCenter + font9)
      );
      tr.append(
        Dom.createElement(td, DateTime.forBr(item.recebido), tCenter + font9)
      );
      tbody.appendChild(tr);
    });
  }
}

async function populateTable() {
  const container = q("#container");
  const scrollPos = container.scrollTop;
  const date_condition = Dom.getValue(EL.DATA_FILTRO);

  if (date_condition) {
    const response = await DB.getProjects(date_condition);
    if (response.status !== 200) {
      Modal.showInfo("error", "Erro", "Não foi possivel carregar os dados");
    } else {
      const tbody = q("tbody");
      const td = "td";
      const tCenter = "text-align: center; ";
      tbody.innerHTML = "";
      let num = 1;

      response.data.forEach((item) => {
        const tr = ce("tr");
        tr.classList.add("open-modal-row");
        tr.classList.add("fw-bold");
        const cor_status = Style.colorStatus(item.status);
        const corA = Style.setColorBool(item.total);

        tr.append(Dom.createElement(td, num, tCenter));
        tr.append(Dom.createElement(td, item.a, corA));
        tr.append(Dom.createElement(td, item.ordemdecompra, tCenter));
        tr.append(Dom.createElement(td, item.pedido, tCenter));
        tr.append(Dom.createElement(td, item.etapa, tCenter));
        tr.append(Dom.createElement(td, item.codcc, tCenter));
        tr.append(Dom.createElement(td, item.cliente));
        tr.append(Dom.createElement(td, item.contrato, tCenter));
        tr.append(Dom.createElement(td, item.numproj, tCenter));
        tr.append(Dom.createElement(td, item.ambiente));
        tr.append(Dom.createElement(td, item.tipo, tCenter));
        tr.append(
          Dom.createElement(td, DateTime.forBr(item.dataentrega), tCenter)
        );
        tr.append(
          Dom.createElement(td, DateTime.forBr(item.chegoufabrica), tCenter)
        );
        tr.append(Dom.createElement(td, item.lote, tCenter));
        tr.append(Dom.createElement(td, item.status, tCenter + cor_status));
        tr.append(
          Dom.createElement(td, DateTime.forBr(item.iniciado), tCenter)
        );
        tr.append(Dom.createElement(td, DateTime.forBr(item.pronto), tCenter));
        tr.append(Dom.createElement(td, DateTime.forBr(item.entrega), tCenter));
        tbody.appendChild(tr);
        num++;
      });
      container.scrollTop = scrollPos;
    }
  }
}

async function handleClickTable(event) {
  Dom.clearInputFields([EL.DATA_FILTRO.slice(1)]);
  const td = event.target;
  const tr = td.closest(".open-modal-row");
  if (!tr || td.tagName !== "TD") return;
  const firstColumnValue = Table.getIndexColumnValue(td, 2);
  const secondColumnValue = Table.getIndexColumnValue(td, 5);
  if (secondColumnValue != "-") {
    await getExpedicao(firstColumnValue);
    await populateTableAcessorios(firstColumnValue);
    Modal.show("modal");
  } else {
    Modal.showInfo("warning", "ATENÇÃO", "Projeto não Calculado");
  }
}

async function getExpedicao(ordemdecompra) {
  const response = await DB.getExpedicao(ordemdecompra);

  if (response.status !== 200) {
    Modal.showInfo("error", "ERRO", `${response.data}`);
  } else {
    populateElements(response.data);
  }
}

async function populateElements(data) {
  for (const item of data) {
    Dom.setValue(EL.NUM_OC, item.ordemdecompra);
    Dom.setValue(EL.CLIENTE, item.cliente);
    Dom.setValue(EL.CONTRATO, item.contrato);
    Dom.setValue(EL.CORTE_CERTO, item.codcc);
    Dom.setValue(EL.AMBIENTE, item.ambiente);
    Dom.setValue(EL.NUM_PROJ, item.numproj);
    Dom.setValue(EL.LOTE, item.lote);
    Dom.setValue(EL.CHEGOU_FABRICA, DateTime.forBr(item.chegoufabrica));
    Dom.setValue(EL.DATA_ENTREGA, DateTime.forBr(item.dataentrega));
    Dom.setValue(EL.PRONTO, item.pronto);
    Dom.setValue(EL.ENTREGA, item.entrega);
    Dom.setChecked(EL.CHK_PENDENCIA, item.pendencia);
    Dom.setChecked(EL.CHK_PARCIAL, item.parcial);
    Dom.setValue(EL.SEPARACAO, item.separacao);
    Dom.setValue(EL.PRONTO_ID, item.conferido);
    Dom.setValue(EL.PRONTO_RESP, await getName(EL.PRONTO_ID));
    Dom.setValue(EL.ENTREGA_ID, item.motorista);
    Dom.setValue(EL.ENTREGA_RESP, await getName(EL.ENTREGA_ID));
    Dom.setValue(EL.EMBALAGEM_INICIO, item.embalageminicio);
    Dom.setValue(EL.EMBALAGEM_FIM, item.embalagemfim);
    Dom.setChecked(EL.EMBALAGEM_PAUSA, item.embalagempausa);
    Dom.setValue(EL.EMBALAGEM_ID, item.embalagemresp);
    Dom.setValue(EL.EMBALAGEM_RESP, await getName(EL.EMBALAGEM_ID));
    Dom.setChecked(EL.CHK_ACESSORIOS_AVULSOS, item.avulso);
    Dom.setValue(EL.L_ACESSORIOS_AVULSOS, item.avulsol);
    Dom.setValue(EL.Q_ACESSORIOS_AVULSOS, item.avulsoq);
    Dom.setChecked(EL.CHK_CABIDE, item.cabide);
    Dom.setValue(EL.L_CABIDE, item.cabidel);
    Dom.setValue(EL.Q_CABIDE, item.cabideq);
    Dom.setChecked(EL.CHK_PAINEIS, item.paineis);
    Dom.setValue(EL.L_PAINEIS, item.paineisl);
    Dom.setValue(EL.Q_PAINEIS, item.paineisq);
    Dom.setChecked(EL.CHK_PECA_PINTURA, item.pecaspintadas);
    Dom.setValue(EL.L_PECA_PINTURA, item.pecaspintadasl);
    Dom.setValue(EL.Q_PECA_PINTURA, item.pecaspintadasq);
    Dom.setChecked(EL.CHK_PORTA_ALUMINIO, item.portaaluminio);
    Dom.setValue(EL.L_PORTA_ALUMINIO, item.portaaluminiol);
    Dom.setValue(EL.Q_PORTA_ALUMINIO, item.portaaluminioq);
    Dom.setChecked(EL.CHK_SERRALHERIA, item.serralheria);
    Dom.setValue(EL.L_SERRALHERIA, item.serralherial);
    Dom.setValue(EL.Q_SERRALHERIA, item.serralheriaq);
    Dom.setChecked(EL.CHK_TAPECARIA, item.tapecaria);
    Dom.setValue(EL.L_TAPECARIA, item.tapecarial);
    Dom.setValue(EL.Q_TAPECARIA, item.tapecariaq);
    Dom.setChecked(EL.CHK_TRILHOS, item.trilho);
    Dom.setValue(EL.L_TRILHOS, item.trilhol);
    Dom.setValue(EL.Q_TRILHOS, item.trilhoq);
    Dom.setChecked(EL.CHK_VIDRO_ESPELHO, item.vidros);
    Dom.setValue(EL.L_VIDRO_ESPELHO, item.vidrosl);
    Dom.setValue(EL.Q_VIDRO_ESPELHO, item.vidrosq);
    Dom.setChecked(EL.CHK_VOLUMES_MODULACAO, item.volmod);
    Dom.setValue(EL.L_VOLUMES_MODULACAO, item.modulosl);
    Dom.setValue(EL.Q_VOLUMES_MODULACAO, item.modulosq);
    Dom.setValue(EL.VOL_MOD, item.totalvolumes);
    Dom.setValue(EL.TAMANHO, item.tamanho);
    Dom.setValue(EL.OBSERVACOES, item.observacoes);
    Dom.setChecked(EL.EMBALAGEM_C_INICIO, false);
    Dom.setChecked(EL.EMBALAGEM_C_FIM, false);
    Dom.setChecked(EL.CHK_ETAPAS, item.etapa);
    Dom.setInnerHtml(EL.ETAPA, setEtapa(item.etapa, EL.ETAPA));
  }
}

function setEtapa(value, element) {
  const item = q(element);
  if (value) {
    item.style.color = "green";
    return "CONCLUIDO";
  }
  item.style.color = "red";
  return "EM ABERTO";
}

function getElementsValues() {
  const data = {
    p_ordemdecompra: Dom.getValue(EL.NUM_OC),
    p_pronto: Dom.getValue(EL.PRONTO),
    p_entrega: Dom.getValue(EL.ENTREGA),
    p_pendencia: Dom.getChecked(EL.CHK_PENDENCIA),
    p_parcial: Dom.getChecked(EL.CHK_PARCIAL),
    p_separacao: Dom.getValue(EL.SEPARACAO),
    p_conferido: Dom.getValue(EL.PRONTO_ID),
    p_motorista: Dom.getValue(EL.ENTREGA_ID),
    p_embalageminicio: Dom.getValue(EL.EMBALAGEM_INICIO),
    p_embalagemfim: Dom.getValue(EL.EMBALAGEM_FIM),
    p_embalagempausa: Dom.getChecked(EL.EMBALAGEM_PAUSA),
    p_embalagemresp: Dom.getValue(EL.EMBALAGEM_ID),
    p_avulso: Dom.getChecked(EL.CHK_ACESSORIOS_AVULSOS),
    p_avulsol: Dom.getValue(EL.L_ACESSORIOS_AVULSOS),
    p_avulsoq: Dom.getValue(EL.Q_ACESSORIOS_AVULSOS),
    p_cabide: Dom.getChecked(EL.CHK_CABIDE),
    p_cabidel: Dom.getValue(EL.L_CABIDE),
    p_cabideq: Dom.getValue(EL.Q_CABIDE),
    p_paineis: Dom.getChecked(EL.CHK_PAINEIS),
    p_paineisl: Dom.getValue(EL.L_PAINEIS),
    p_paineisq: Dom.getValue(EL.Q_PAINEIS),
    p_pecaspintadas: Dom.getChecked(EL.CHK_PECA_PINTURA),
    p_pecaspintadasl: Dom.getValue(EL.L_PECA_PINTURA),
    p_pecaspintadasq: Dom.getValue(EL.Q_PECA_PINTURA),
    p_portaaluminio: Dom.getChecked(EL.CHK_PORTA_ALUMINIO),
    p_portaaluminiol: Dom.getValue(EL.L_PORTA_ALUMINIO),
    p_portaaluminioq: Dom.getValue(EL.Q_PORTA_ALUMINIO),
    p_serralheria: Dom.getChecked(EL.CHK_SERRALHERIA),
    p_serralherial: Dom.getValue(EL.L_SERRALHERIA),
    p_serralheriaq: Dom.getValue(EL.Q_SERRALHERIA),
    p_tapecaria: Dom.getChecked(EL.CHK_TAPECARIA),
    p_tapecarial: Dom.getValue(EL.L_TAPECARIA),
    p_tapecariaq: Dom.getValue(EL.Q_TAPECARIA),
    p_trilho: Dom.getChecked(EL.CHK_TRILHOS),
    p_trilhol: Dom.getValue(EL.L_TRILHOS),
    p_trilhoq: Dom.getValue(EL.Q_TRILHOS),
    p_vidros: Dom.getChecked(EL.CHK_VIDRO_ESPELHO),
    p_vidrosl: Dom.getValue(EL.L_VIDRO_ESPELHO),
    p_vidrosq: Dom.getValue(EL.Q_VIDRO_ESPELHO),
    p_volmod: Dom.getChecked(EL.CHK_VOLUMES_MODULACAO),
    p_modulosl: Dom.getValue(EL.L_VOLUMES_MODULACAO),
    p_modulosq: Dom.getValue(EL.Q_VOLUMES_MODULACAO),
    p_totalvolumes: Dom.getValue(EL.VOL_MOD),
    p_tamanho: Dom.getValue(EL.TAMANHO),
    p_observacoes: Dom.getValue(EL.OBSERVACOES),
  };
  return data;
}

async function confirmInsertionData() {
  const result = await Modal.showConfirmation(null, "Confirmar Alterações ?");
  if (result.isConfirmed) {
    try {
      if (!Dom.getChecked(EL.CHK_ETAPAS)) {
        if (Dom.getValue(EL.PRONTO) || Dom.getValue(EL.ENTREGA)) {
          Modal.showInfo("warning", "ATENÇÃO", "Projeto com etapas em ABERTO");
          return;
        }
      }

      const data = getElementsValues();
      const res = await DB.setDataExpediao(data);

      if (res.status !== 200) {
        Modal.showInfo(
          "error",
          "ERRO",
          `Ocorreu um erro ao salvar os dados! ${res.data}`
        );
      } else {
        await populateTable();
        Modal.showInfo("success", "Sucesso", "Alterações feitas com sucesso!");
      }
    } catch (err) {
      Modal.showInfo("error", "ERRO", `ERRO: ${err.message}`);
    }
  }
}

async function getDataFilterExp() {
  const data = await Service.getConfig(1);
  Dom.setValue(EL.DATA_FILTRO, data[0].p_data);
  populateTable();
}

async function setDataFilterExp() {
  const data = {
    p_id: 1,
    p_date: Dom.getValue(EL.DATA_FILTRO),
  };
  await Service.setConfig(data);
}

function handleClickCheckbox() {
  const operation = ["embalagem"];

  operation.forEach((item) => {
    Dom.addEventBySelector(`#chk_${item}inicio`, "click", () =>
      confirmDateInsertion(`#chk_${item}inicio`, `txt_${item}inicio`)
    );

    Dom.addEventBySelector(`#chk_${item}fim`, "click", () =>
      confirmDateInsertion(`#chk_${item}fim`, `txt_${item}fim`)
    );
  });
}

function getUsuarios() {
  const meuHTML = q("#modal-1").innerHTML;
  Modal.showInfo(null, null, meuHTML);
}

async function filltableUsuarios() {
  const data = await getOperadores();
  const tbody = q("#modal-1 tbody");
  const td = "td";
  tbody.innerHTML = "";
  data.forEach((element) => {
    const tr = ce("tr");
    tr.append(Dom.createElement(td, element.p_id));
    tr.append(Dom.createElement(td, element.p_nome));
    tbody.appendChild(tr);
  });
}

function listElementsUsers() {
  return [
    [EL.PRONTO_ID, EL.PRONTO_RESP],
    [EL.ENTREGA_ID, EL.ENTREGA_RESP],
    [EL.EMBALAGEM_ID, EL.EMBALAGEM_RESP],
  ];
}

function init() {
  loadPage("expedicao", "expedicao.html");
  Table.onclickHighlightRow(EL.TABLE);
  Dom.enableEnterAsTab();
  Table.onmouseover(EL.TABLE);
  Dom.addEventBySelector(EL.TABLE, "dblclick", handleClickTable);
  Dom.addEventBySelector(EL.DATA_FILTRO, "blur", populateTable);
  Dom.addEventBySelector(EL.DATA_FILTRO, "blur", setDataFilterExp);
  Dom.addEventBySelector(EL.BT_SALVAR, "click", confirmInsertionData);
  Dom.addEventBySelector(EL.CHK_PRONTO, "click", () =>
    setDate(EL.CHK_PRONTO, EL.PRONTO)
  );
  Dom.addEventBySelector(EL.ENTREGA_ID, "click", () =>
    setDate(EL.ENTREGA_ID, EL.ENTREGA)
  );
  Dom.addEventBySelector(EL.CHK_SEPARACAO, "click", () =>
    confirmDateInsertion(EL.CHK_SEPARACAO, EL.SEPARACAO)
  );
  Dom.addEventBySelector(EL.BT_FUNCIONARIOS, "click", getUsuarios);
  handleElementsUser(listElementsUsers());
  getDataFilterExp();
  enableTableFilterSort(EL.TABLE.slice(1));
  filltableUsuarios();
  handleClickCheckbox();
  window.addEventListener("resize", ajustarTamanhoModal);
}
document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
