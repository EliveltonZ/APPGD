import { loadPage } from "./utils.js";
import { Dom, Table, Style, q, qa, ce } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";
import { API } from "./service/api.js";
import { DateTime } from "./utils/time.js";
import { Numbers } from "./utils/number.js";
import { Excel } from "./utils/excel.js";

/*========================================
  HELPERS DOM
========================================*/
const EL = {
  CONTRATO: "#txt_contrato",
  CLIENTE: "#txt_cliente",
  CHK_URGENTE: "#chk_urgente",
  COD_CC: "#txt_codcc",
  AMBIENTE: "#txt_ambiente",
  NUM_PROJ: "#txt_numproj",
  LOTE: "#txt_lote",
  PEDIDO: "#txt_pedido",
  CHEGADA: "#txt_chegada",
  ENTREGA: "#txt_entrega",
  TIPO: "#txt_tipo",
  PECAS: "#txt_pecas",
  AREA: "#txt_area",
  DATA: "#txt_data",
  INICIAR_LOTE: "#txt_loteiniciar",
  GERAR_LOTE: "#txt_gerar_lote",
  NUM_OC: "#txt_numoc",
  INCIO: "#txt_inicio",
  FIM: "#txt_fim",
  BT_SALVAR: "#bt_salvar",
  BT_INICIAR_LOTE: "#bt_startlote",
  BT_EXPORTAR: "#bt_export",
  BT_GERAR_LOTE: "#bt_gerar_lote",
  BT_MODAL_LOTE: "#bt_modal_lote",
};

/*========================================
  HELPERS API
========================================*/
const DB = {
  startLote: async function (payload) {
    return await API.fetchBody("/setStartLote", "PUT", payload);
  },

  getProjetoByOc: async function (orderBy) {
    const url = `/getProjetoPcp?p_ordemdecompra=${orderBy}`;
    return await API.fetchQuery(url);
  },

  getProjetosParaLote: async function () {
    return await API.fetchQuery("/getProjetosLote");
  },

  updateProjetoPcp: async function (payload) {
    return await API.fetchBody("/setProjetoPcp", "PUT", payload);
  },

  getLastLoteNumber: async function () {
    return await API.fetchQuery("/getLastLote");
  },

  exportLoteData: async function (start, end) {
    const url = `/exportarDados?data_inicio=${start}&data_fim=${end}`;
    return await API.fetchQuery(url);
  },

  setLoteForOc: async function (payload) {
    return await API.fetchBody("/setLote", "PUT", payload);
  },
};

/*========================================
  PAYLOAD BUILDERS
========================================*/
function buildStartLotePayload() {
  return {
    p_iniciado: Dom.getValue(EL.DATA),
    p_lote: Dom.getValue(EL.INICIAR_LOTE),
  };
}

function buildProjetoUpdatePayload() {
  return {
    p_ordemdecompra: Dom.getValue(EL.NUM_OC),
    p_urgente: Dom.getChecked(EL.CHK_URGENTE),
    p_codcc: Dom.getValue(EL.COD_CC),
    p_lote: Dom.getValue(EL.LOTE),
    p_pedido: Dom.getValue(EL.PEDIDO),
    p_tipo: Dom.getValue(EL.TIPO),
    p_pecas: Dom.getValue(EL.PECAS),
    p_area: Numbers.decimal(Dom.getValue(EL.AREA)),
  };
}

function buildLotePayload(ordemdecompra, lote) {
  return {
    p_ordemdecompra: ordemdecompra,
    p_lote: lote,
  };
}

/*========================================
  UI HELPERS
========================================*/
function normalizeEmptyValue(value) {
  if (!value) return null;
  return value;
}

function fillProjectForm(element) {
  Dom.setValue(EL.CONTRATO, element.p_contrato);
  Dom.setValue(EL.CLIENTE, element.p_cliente);
  Dom.setChecked(EL.CHK_URGENTE, element.p_urgente);
  Dom.setValue(EL.COD_CC, element.p_codcc);
  Dom.setValue(EL.AMBIENTE, element.p_ambiente);
  Dom.setValue(EL.NUM_PROJ, element.p_numproj);
  Dom.setValue(EL.LOTE, element.p_lote);
  Dom.setValue(EL.PEDIDO, normalizeEmptyValue(element.p_pedido));
  Dom.setValue(EL.CHEGADA, DateTime.forBr(element.p_chegoufabrica));
  Dom.setValue(EL.ENTREGA, DateTime.forBr(element.p_dataentrega));
  Dom.setValue(EL.TIPO, element.p_tipo);
  Dom.setValue(EL.PECAS, normalizeEmptyValue(element.p_peças));
  Dom.setValue(EL.AREA, normalizeEmptyValue(element.p_area));
}

function fillNextLoteNumber(res) {
  q(EL.GERAR_LOTE).value = (res?.data?.[0]?.p_lote ?? 0) + 1;
}

/*========================================
  ACTIONS
========================================*/
async function confirmAndStartLote() {
  const result = await Modal.showConfirmation(
    "question",
    "LOTE",
    "Iniciar Lote ?"
  );

  if (result.isConfirmed) {
    const data = buildStartLotePayload();
    const res = await DB.startLote(data);

    if (res.status !== 200) {
      const errText = await res.data;
      Modal.showInfo(
        "error",
        "ERRO",
        `Não foi possivel iniciar o lote ${errText}`
      );
    } else {
      Modal.showInfo("success", "Successo", "Lote iniciado com sucesso !!!");
    }
  }
}

async function fetchProjetoPcpByOc() {
  const oc = Dom.getValue(EL.NUM_OC);

  if (!oc) {
    Dom.clearInputFields();
    return;
  }

  const res = await DB.getProjetoByOc(oc);

  if (res.status !== 200) {
    const errText = await res.data;
    Modal.showInfo("error", "ERRO", "Erro ao buscar ordem de compra" + errText);
    Dom.clearInputFields();
    return;
  }

  res.data.forEach((element) => fillProjectForm(element));
}

async function confirmAndUpdateProjetoPcp() {
  const result = await Modal.showConfirmation(null, "Salvar alterações ?");

  if (!result.isConfirmed) return;

  const data = buildProjetoUpdatePayload();
  const res = await DB.updateProjetoPcp(data);

  if (res.status !== 200) {
    const errText = await res.data;
    Modal.showInfo(
      "error",
      "Erro",
      `Não foi possível salvar alterações: ${errText}`
    );
  } else {
    Modal.showInfo("success", "Sucesso", `Alterações salvas com sucesso !!!`);
  }
}

async function fetchLastLoteNumber() {
  const res = await DB.getLastLoteNumber();

  if (res.status !== 200) {
    Modal.showInfo("error", "ERRO", "Erro ao buscar projetos na base");
    return;
  }

  fillNextLoteNumber(res);
}

function createTableRow(value, style) {
  return Dom.createElement("td", value, style);
}

async function fetchProjetosForLoteModal() {
  const response = await fetch("/getProjetosLote");

  if (!response.ok) {
    Modal.showInfo("error", "ERRO", "Erro ao buscar projetos na base");
    return;
  }

  const config = "text-align: center;";
  const tbody = q("tbody");
  tbody.innerHTML = "";

  const data = await response.json();

  data.forEach((item) => {
    const tr = ce("tr");
    tr.append(createTableRow(item.p_ordemdecompra, config));
    tr.append(createTableRow(item.p_pedido, config));
    tr.append(createTableRow(item.p_codcc, config));
    tr.append(createTableRow(item.p_cliente));
    tr.append(createTableRow(item.p_ambiente));
    tr.append(createTableRow(DateTime.forBr(item.p_dataentrega), config));
    tr.innerHTML += "<input type='checkbox'/>";
    tbody.appendChild(tr);
  });
}

async function openLoteModal() {
  await fetchLastLoteNumber();
  await fetchProjetosForLoteModal();
  Modal.show("modal-3");
}

async function assignLoteToOc(ordemdecompra, lote) {
  const data = buildLotePayload(ordemdecompra, lote);
  return await DB.setLoteForOc(data);
}

function getCurrentLoteNumber() {
  return Dom.getValue(EL.GERAR_LOTE);
}

async function confirmLoteGeneration(lote) {
  const result = await Modal.confirmation(
    null,
    `Deseja gerar o Lote ${lote} ?`
  );
  return !!result?.isConfirmed;
}

function getSelectedRowsFromTableBody() {
  const rows = qa("tbody tr");
  return Array.from(rows).filter((row) => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    return checkbox && checkbox.checked;
  });
}

function warnNoRowsSelected() {
  Modal.showInfo(
    "warning",
    "Atenção",
    "Nenhum item foi selecionado para gerar o lote."
  );
}

function mapRowToLoteItem(row, lote) {
  const cols = row.querySelectorAll("td");

  const numOC = cols[0]?.textContent?.trim();
  const pedido = cols[1]?.textContent?.trim();
  const codCC = cols[2]?.textContent?.trim();
  const cliente = cols[3]?.textContent?.trim();
  const ambiente = cols[4]?.textContent?.trim();
  const entrega = cols[5]?.textContent?.trim();

  return {
    numOC,
    item: { codCC, pedido, ambiente, cliente, entrega, lote },
  };
}

async function persistSelectedRowsLote(rows, lote) {
  const lista = [];

  for (const row of rows) {
    const { numOC, item } = mapRowToLoteItem(row, lote);
    lista.push(item);
    await assignLoteToOc(numOC, lote);
  }

  return lista;
}

function exportLoteSheet(data) {
  Excel.export(data);
}

function showLoteSuccess() {
  Modal.showInfo("success", "Sucesso", "Lote gerado com sucesso!");
}

function showLoteError(err) {
  Modal.showInfo(
    "error",
    "Erro",
    "Não foi possível gerar o lote: " + (err?.message || err)
  );
}

async function confirmAndGenerateLote() {
  const lote = getCurrentLoteNumber();

  const confirmed = await confirmLoteGeneration(lote);
  if (!confirmed) return;

  const selectedRows = getSelectedRowsFromTableBody();
  if (selectedRows.length === 0) {
    warnNoRowsSelected();
    return;
  }

  try {
    const lista = await persistSelectedRowsLote(selectedRows, lote);
    exportLoteSheet(lista);
    showLoteSuccess();
  } catch (err) {
    showLoteError(err);
  }
}

async function exportLoteData() {
  const start = Dom.getValue(EL.INCIO);
  const end = Dom.getValue(EL.FIM);

  const res = await DB.exportLoteData(start, end);

  if (res.status !== 200) {
    Modal.showInfo(
      "error",
      "ERRO",
      `Não foi possivel a conexão com banco de dados. ${res.data}`
    );
    return;
  }

  exportarParaExcel(res.data);
}

/*========================================
  EVENTS
========================================*/

function events() {
  Dom.addEventBySelector(EL.NUM_OC, "blur", fetchProjetoPcpByOc);
  Dom.addEventBySelector(EL.BT_SALVAR, "click", confirmAndUpdateProjetoPcp);
  Dom.addEventBySelector(EL.BT_INICIAR_LOTE, "click", confirmAndStartLote);
  Dom.addEventBySelector(EL.BT_EXPORTAR, "click", exportLoteData);
  Dom.addEventBySelector(EL.BT_GERAR_LOTE, "click", confirmAndGenerateLote);
  Dom.addEventBySelector(EL.BT_MODAL_LOTE, "click", openLoteModal);
}

function init() {
  loadPage("pcp", "pcp.html");
  Table.onmouseover("table");
  Dom.enableEnterAsTab();
  events();
}

/*========================================
  INIT
========================================*/
document.addEventListener("DOMContentLoaded", () => {
  init();
});
