import { loadPage } from "./utils.js";
import { Dom, Table, q, qa, ce } from "./UI/interface.js";
import { Modal } from "./utils/modal.js";
import { API } from "./service/api.js";
import { DateTime } from "./utils/time.js";
import { Numbers } from "./utils/number.js";
import { Excel } from "./utils/excel.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  form: {
    contrato: "#txt_contrato",
    cliente: "#txt_cliente",
    urgente: "#chk_urgente",
    codCc: "#txt_codcc",
    ambiente: "#txt_ambiente",
    numProj: "#txt_numproj",
    lote: "#txt_lote",
    pedido: "#txt_pedido",
    chegada: "#txt_chegada",
    entrega: "#txt_entrega",
    tipo: "#txt_tipo",
    pecas: "#txt_pecas",
    area: "#txt_area",
    data: "#txt_data",
    iniciarLote: "#txt_loteiniciar",
    gerarLote: "#txt_gerar_lote",
    numOc: "#txt_numoc",
    inicioExport: "#txt_inicio",
    fimExport: "#txt_fim",
  },
  buttons: {
    salvar: "#bt_salvar",
    iniciarLote: "#bt_startlote",
    exportar: "#bt_export",
    gerarLote: "#bt_gerar_lote",
    modalLote: "#bt_modal_lote",
  },
  modal: {
    lote: "modal-3",
  },
  table: {
    tbody: "tbody",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const PcpAPI = {
  startLote(payload) {
    return API.fetchBody("/setStartLote", "PUT", payload);
  },

  fetchProjetoByOc(orderNumber) {
    const url = `/getProjetoPcp?p_ordemdecompra=${orderNumber}`;
    return API.fetchQuery(url);
  },

  fetchProjetosParaLote() {
    return API.fetchQuery("/getProjetosLote");
  },

  updateProjetoPcp(payload) {
    return API.fetchBody("/setProjetoPcp", "PUT", payload);
  },

  fetchLastLoteNumber() {
    return API.fetchQuery("/getLastLote");
  },

  exportLoteData(start, end) {
    const url = `/exportarDados?data_inicio=${start}&data_fim=${end}`;
    return API.fetchQuery(url);
  },

  setLoteForOc(payload) {
    return API.fetchBody("/setLote", "PUT", payload);
  },
};

/* =========================================================
   FIELD ACCESS
========================================================= */
const Fields = {
  get(selector) {
    return Dom.getValue(selector);
  },
  set(selector, value) {
    Dom.setValue(selector, value);
  },
  getChecked(selector) {
    return Dom.getChecked(selector);
  },
  setChecked(selector, value) {
    Dom.setChecked(selector, value);
  },
  clear() {
    Dom.clearInputFields();
  },
};

/* =========================================================
   UI MESSAGES
========================================================= */
function showError(message) {
  return Modal.showInfo("error", "Erro", message);
}

function showWarning(message) {
  return Modal.showInfo("warning", "Atenção", message);
}

function showSuccess(message) {
  return Modal.showInfo("success", "Sucesso", message);
}

function confirm(message) {
  return Modal.showConfirmation(null, message);
}

/* =========================================================
   FORMATTERS / NORMALIZERS
========================================================= */
function emptyToNull(value) {
  return value ? value : null;
}

function toDecimal(value) {
  return Numbers.decimal(value);
}

/* =========================================================
   MAPPERS (API -> UI) and (UI -> API)
========================================================= */
function mapProjetoToFormFields(p) {
  return [
    [SELECTORS.form.contrato, p.p_contrato],
    [SELECTORS.form.cliente, p.p_cliente],
    [SELECTORS.form.urgente, p.p_urgente, "check"],
    [SELECTORS.form.codCc, p.p_codcc],
    [SELECTORS.form.ambiente, p.p_ambiente],
    [SELECTORS.form.numProj, p.p_numproj],
    [SELECTORS.form.lote, p.p_lote],
    [SELECTORS.form.pedido, emptyToNull(p.p_pedido)],
    [SELECTORS.form.chegada, DateTime.forBr(p.p_chegoufabrica)],
    [SELECTORS.form.entrega, DateTime.forBr(p.p_dataentrega)],
    [SELECTORS.form.tipo, p.p_tipo],
    // backend tem "p_peças" no seu código (com acento). Mantive leitura defensiva:
    [SELECTORS.form.pecas, emptyToNull(p["p_peças"] ?? p.p_pecas)],
    [SELECTORS.form.area, emptyToNull(p.p_area)],
  ];
}

function applyProjetoToForm(pairs) {
  pairs.forEach(([selector, value, kind]) => {
    if (kind === "check") Fields.setChecked(selector, value);
    else Fields.set(selector, value);
  });
}

function buildStartLotePayload() {
  return {
    p_iniciado: Fields.get(SELECTORS.form.data),
    p_lote: Fields.get(SELECTORS.form.iniciarLote),
  };
}

function buildProjetoUpdatePayload() {
  return {
    p_ordemdecompra: Fields.get(SELECTORS.form.numOc),
    p_urgente: Fields.getChecked(SELECTORS.form.urgente),
    p_codcc: Fields.get(SELECTORS.form.codCc),
    p_lote: Fields.get(SELECTORS.form.lote),
    p_pedido: Fields.get(SELECTORS.form.pedido),
    p_tipo: Fields.get(SELECTORS.form.tipo),
    p_pecas: Fields.get(SELECTORS.form.pecas),
    p_area: toDecimal(Fields.get(SELECTORS.form.area)),
  };
}

function buildLotePayload(ordemdecompra, lote) {
  return { p_ordemdecompra: ordemdecompra, p_lote: lote };
}

/* =========================================================
   USE CASES / FLOWS
========================================================= */
async function loadProjetoByOc() {
  const oc = Fields.get(SELECTORS.form.numOc);

  if (!oc) {
    Fields.clear();
    return;
  }

  const res = await PcpAPI.fetchProjetoByOc(oc);

  if (res.status !== 200) {
    await showError("Erro ao buscar ordem de compra " + (res.data ?? ""));
    Fields.clear();
    return;
  }

  res.data.forEach((p) => applyProjetoToForm(mapProjetoToFormFields(p)));
}

async function startLoteFlow() {
  const result = await Modal.showConfirmation(
    "question",
    "LOTE",
    "Iniciar Lote ?"
  );
  if (!result.isConfirmed) return;

  const payload = buildStartLotePayload();
  const res = await PcpAPI.startLote(payload);

  if (res.status !== 200) {
    await showError(`Não foi possivel iniciar o lote ${res.data}`);
    return;
  }

  await showSuccess("Lote iniciado com sucesso !!!");
}

async function updateProjetoPcpFlow() {
  const result = await confirm("Salvar alterações ?");
  if (!result.isConfirmed) return;

  const payload = buildProjetoUpdatePayload();
  const res = await PcpAPI.updateProjetoPcp(payload);

  if (res.status !== 200) {
    await showError(`Não foi possível salvar alterações: ${res.data}`);
    return;
  }

  await showSuccess("Alterações salvas com sucesso !!!");
}

/* =========================================================
   LOTE MODAL (TABLE)
========================================================= */
function td(value, style) {
  return Dom.createElement("td", value, style);
}

function setNextLoteNumber(res) {
  const last = res?.data?.[0]?.p_lote ?? 0;
  Fields.set(SELECTORS.form.gerarLote, last + 1);
}

async function loadNextLoteNumber() {
  const res = await PcpAPI.fetchLastLoteNumber();

  if (res.status !== 200) {
    await showError("Erro ao buscar projetos na base");
    return;
  }

  setNextLoteNumber(res);
}

function clearModalTable() {
  const tbody = q(SELECTORS.table.tbody);
  if (tbody) tbody.innerHTML = "";
  return tbody;
}

function buildLoteModalRow(item) {
  const config = "text-align: center;";
  const tr = ce("tr");

  tr.append(td(item.p_ordemdecompra, config));
  tr.append(td(item.p_pedido, config));
  tr.append(td(item.p_codcc, config));
  tr.append(td(item.p_cliente));
  tr.append(td(item.p_ambiente));
  tr.append(td(DateTime.forBr(item.p_dataentrega), config));

  // checkbox (evita innerHTML += ...)
  const checkCell = ce("td");
  checkCell.setAttribute("style", config);
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkCell.appendChild(checkbox);
  tr.appendChild(checkCell);

  return tr;
}

async function loadProjetosForLoteModal() {
  const res = await PcpAPI.fetchProjetosParaLote();

  if (res.status !== 200) {
    await showError("Erro ao buscar projetos na base");
    return;
  }

  const tbody = clearModalTable();
  if (!tbody) return;

  res.data.forEach((item) => tbody.appendChild(buildLoteModalRow(item)));
}

async function openLoteModal() {
  await loadNextLoteNumber();
  await loadProjetosForLoteModal();
  Modal.show(SELECTORS.modal.lote);
}

/* =========================================================
   LOTE GENERATION (PERSIST + EXPORT)
========================================================= */
function getCurrentLoteNumber() {
  return Fields.get(SELECTORS.form.gerarLote);
}

async function confirmLoteGeneration(lote) {
  // no seu código original: Modal.confirmation(...)
  // mantendo mas protegendo caso não exista e fallback para showConfirmation
  const fn = Modal.confirmation ?? Modal.showConfirmation;
  const result = await fn.call(Modal, null, `Deseja gerar o Lote ${lote} ?`);
  return !!result?.isConfirmed;
}

function getSelectedModalRows() {
  const rows = qa("tbody tr");
  return Array.from(rows).filter((row) => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    return checkbox?.checked;
  });
}

function warnNoSelection() {
  return showWarning("Nenhum item foi selecionado para gerar o lote.");
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

async function assignLoteToOc(ordemdecompra, lote) {
  const payload = buildLotePayload(ordemdecompra, lote);
  return PcpAPI.setLoteForOc(payload);
}

async function persistLoteSelection(rows, lote) {
  const lista = [];

  for (const row of rows) {
    const { numOC, item } = mapRowToLoteItem(row, lote);
    lista.push(item);
    await assignLoteToOc(numOC, lote);
  }

  return lista;
}

async function generateLoteFlow() {
  const lote = getCurrentLoteNumber();

  const confirmed = await confirmLoteGeneration(lote);
  if (!confirmed) return;

  const selectedRows = getSelectedModalRows();
  if (selectedRows.length === 0) return warnNoSelection();

  try {
    const lista = await persistLoteSelection(selectedRows, lote);
    Excel.export(lista);
    await showSuccess("Lote gerado com sucesso!");
  } catch (err) {
    await showError("Não foi possível gerar o lote: " + (err?.message || err));
  }
}

/* =========================================================
   EXPORT (PCP DATA)
========================================================= */
async function exportLoteDataFlow() {
  const start = Fields.get(SELECTORS.form.inicioExport);
  const end = Fields.get(SELECTORS.form.fimExport);

  const res = await PcpAPI.exportLoteData(start, end);

  if (res.status !== 200) {
    await showError(
      `Não foi possivel a conexão com banco de dados. ${res.data}`
    );
    return;
  }

  // seu código original chamava exportarParaExcel(res.data) mas não existe aqui
  // então usamos o util já importado: Excel.export
  Excel.export(res.data);
}

/* =========================================================
   EVENTS / INIT
========================================================= */
function bindEvents() {
  Dom.addEventBySelector(SELECTORS.form.numOc, "blur", loadProjetoByOc);
  Dom.addEventBySelector(
    SELECTORS.buttons.salvar,
    "click",
    updateProjetoPcpFlow
  );
  Dom.addEventBySelector(SELECTORS.buttons.iniciarLote, "click", startLoteFlow);
  Dom.addEventBySelector(
    SELECTORS.buttons.exportar,
    "click",
    exportLoteDataFlow
  );
  Dom.addEventBySelector(
    SELECTORS.buttons.gerarLote,
    "click",
    generateLoteFlow
  );
  Dom.addEventBySelector(SELECTORS.buttons.modalLote, "click", openLoteModal);
}

function configureUiDefaults() {
  loadPage("pcp", "pcp.html");
  Fields.set(SELECTORS.form.data, DateTime.today());
  Table.onmouseover("table");
  Dom.enableEnterAsTab();
}

function init() {
  configureUiDefaults();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);
