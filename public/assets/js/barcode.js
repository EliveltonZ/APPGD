import { modalBarCode, detectarDispositivo, getName } from "./utils.js";

import { Dom, q } from "./UI/interface.js";
import { API } from "./service/api.js";
import { Modal } from "./utils/modal.js";
import { DateTime } from "./utils/time.js";

/* =========================================================
   SELECTORS / ELEMENTS
========================================================= */
const SELECTORS = {
  inputs: {
    scan: "#txt_scan",
    pedido: "#txt_pedido",

    numoc: "#txt_numoc",
    cliente: "#txt_cliente",
    contrato: "#txt_contrato",
    codcc: "#txt_codcc",
    ambiente: "#txt_ambiente",
    numproj: "#txt_numproj",
    lote: "#txt_lote",
    chegoufabrica: "#txt_chegoufabrica",
    dataentrega: "#txt_dataentrega",
    previsao: "#txt_previsao",
    observacoes: "#txt_observacoes",

    // campos por setor
    corteInicio: "#txt_corteinicio",
    corteFim: "#txt_cortefim",
    corteId: "#txt_corteid",
    corteResp: "#txt_corteresp",

    customInicio: "#txt_customizacaoinicio",
    customFim: "#txt_customizacaofim",
    customId: "#txt_customizacaoid",
    customResp: "#txt_customizacaoresp",

    coladeiraInicio: "#txt_coladeirainicio",
    coladeiraFim: "#txt_coladeirafim",
    coladeiraId: "#txt_coladeiraid",
    coladeiraResp: "#txt_coladeiraresp",

    usinagemInicio: "#txt_usinageminicio",
    usinagemFim: "#txt_usinagemfim",
    usinagemId: "#txt_usinagemid",
    usinagemResp: "#txt_usinagemresp",

    montagemInicio: "#txt_montageminicio",
    montagemFim: "#txt_montagemfim",
    montagemId: "#txt_montagemid",
    montagemResp: "#txt_montagemresp",

    paineisInicio: "#txt_paineisinicio",
    paineisFim: "#txt_paineisfim",
    paineisId: "#txt_paineisid",
    paineisResp: "#txt_paineisresp",

    acabamentoInicio: "#txt_acabamentoinicio",
    acabamentoFim: "#txt_acabamentofim",
    acabamentoId: "#txt_acabamentoid",
    acabamentoResp: "#txt_acabamentoresp",

    embalagemInicio: "#txt_embalageminicio",
    embalagemFim: "#txt_embalagemfim",
    embalagemId: "#txt_embalagemid",
    embalagemResp: "#txt_embalagemresp",
  },
  checks: {
    cortePausa: "#chk_corte",
    customPausa: "#chk_customizacao",
    coladeiraPausa: "#chk_coladeira",
    usinagemPausa: "#chk_usinagem",
    montagemPausa: "#chk_montagem",
    paineisPausa: "#chk_paineis",
    acabamentoPausa: "#chk_acabamento",
    embalagemPausa: "#chk_embalagem",

    // checks auxiliares (reset no carregamento)
    corteInicio: "#chk_corteinicio",
    corteFim: "#chk_cortefim",
    customInicio: "#chk_customizacaoinicio",
    customFim: "#chk_customizacaofim",
    coladeiraInicio: "#chk_coladeirainicio",
    coladeiraFim: "#chk_coladeirafim",
    usinagemInicio: "#chk_usinageminicio",
    usinagemFim: "#chk_usinagemfim",
    montagemInicio: "#chk_montageminicio",
    montagemFim: "#chk_montagemfim",
    paineisInicio: "#chk_paineisinicio",
    paineisFim: "#chk_paineisfim",
    acabamentoInicio: "#chk_acabamentoinicio",
    acabamentoFim: "#chk_acabamentofim",
    embalagemInicio: "#chk_embalageminicio",
    embalagemFim: "#chk_embalagemfim",
  },
  buttons: {
    salvar: "#bt_salvar",
    scan: "#bt_scan",
  },
};

/* =========================================================
   API LAYER
========================================================= */
const ProducaoAPI = {
  getProductionBarcode(pedido6) {
    const url = `/getProducaoBarcode?p_pedido=${encodeURIComponent(pedido6)}`;
    return API.fetchQuery(url);
  },
  setStage(payload) {
    return API.fetchBody("/setEtapa", "PUT", payload);
  },
  setDataProduction(payload) {
    return API.fetchBody("/setDataProducao", "PUT", payload);
  },
  getBarcode(pedido) {
    const url = `/getCodigoBarras?p_pedido=${encodeURIComponent(pedido)}`;
    return API.fetchQuery(url);
  },
};

/* =========================================================
   FIELD ACCESS (READ/WRITE)
========================================================= */
const Fields = {
  get(selector) {
    return Dom.getValue(selector);
  },
  set(selector, value) {
    Dom.setValue(selector, value ?? "");
  },
  getChecked(selector) {
    return Dom.getChecked(selector);
  },
  setChecked(selector, value) {
    Dom.setChecked(selector, Boolean(value));
  },
  focus(selector) {
    q(selector)?.focus?.();
  },
};

/* =========================================================
   UI MESSAGES
========================================================= */
function showError(message) {
  return Modal.showInfo("error", "ERRO", message);
}

function showSuccess(message) {
  return Modal.showInfo("success", "Sucesso", message);
}

function showHttpError(status) {
  return Modal.showInfo("error", "ERRO", `ERRO: HTTP ${status}`);
}

function confirmUpdate() {
  return Modal.showConfirmation(null, "Deseja confirmar Alterações?");
}

/* =========================================================
   HELPERS / PARSERS
========================================================= */
function parseBarcode(barcode) {
  const raw = String(barcode ?? "").trim();
  const pedido = Number(raw.slice(0, 6));
  const codigo = Number(raw.slice(6, 9));
  const codigoStr = String(raw.slice(6, 9));
  return { raw, pedido, codigo, codigoStr };
}

function orderBuy(value) {
  return String(value ?? "")
    .trim()
    .slice(0, 6);
}

function getEtapaName(value) {
  const dataMap = {
    2: "Corte",
    3: "Customização",
    4: "Coladeira",
    5: "Usinagem",
    6: "Montagem",
    7: "Paineis",
    8: "Embalagem",
  };
  return dataMap[value];
}

function getAcaoName(value) {
  const dataMap = { 1: "Iniciar", 2: "Finalizar" };
  return dataMap[value];
}

function getSectorKey(value) {
  const dataMap = {
    2: "corte",
    3: "customizacao",
    4: "coladeira",
    5: "usinagem",
    6: "montagem",
    7: "paineis",
    8: "embalagem",
  };
  return dataMap[value];
}

function getOperationKey(value) {
  const dataMap = { 1: "inicio", 2: "fim" };
  return dataMap[value];
}

/* =========================================================
   DEVICE UI
========================================================= */
function configureDeviceUi() {
  const dispositivo = detectarDispositivo();

  if (dispositivo === "Android") {
    const botao = q(SELECTORS.buttons.scan);
    botao?.classList?.remove("d-none");
    botao?.classList?.add("d-flex");
  }

  if (dispositivo === "Windows") {
    const input = q(SELECTORS.inputs.scan);
    input?.classList?.remove("d-none");
    input?.classList?.add("d-flex");
  }
}

/* =========================================================
   MAPPERS (API -> UI) and (UI -> API)
========================================================= */
function mapProducaoToForm(item) {
  return {
    inputs: [
      [SELECTORS.inputs.numoc, item.ordemdecompra],
      [SELECTORS.inputs.cliente, item.cliente],
      [SELECTORS.inputs.contrato, item.contrato],
      [SELECTORS.inputs.codcc, item.codcc],
      [SELECTORS.inputs.ambiente, item.ambiente],
      [SELECTORS.inputs.numproj, item.numproj],
      [SELECTORS.inputs.lote, item.lote],
      [SELECTORS.inputs.chegoufabrica, DateTime.forBr(item.chegoufabrica)],
      [SELECTORS.inputs.dataentrega, DateTime.forBr(item.dataentrega)],
      [SELECTORS.inputs.previsao, item.previsao],

      [SELECTORS.inputs.corteInicio, item.corteinicio],
      [SELECTORS.inputs.corteFim, item.cortefim],
      [SELECTORS.inputs.corteId, item.corteresp],
      [SELECTORS.inputs.corteResp, item.cortename],

      [SELECTORS.inputs.customInicio, item.customizacaoinicio],
      [SELECTORS.inputs.customFim, item.customizacaofim],
      [SELECTORS.inputs.customId, item.customizacaoresp],
      [SELECTORS.inputs.customResp, item.customizacaoname],

      [SELECTORS.inputs.coladeiraInicio, item.coladeirainicio],
      [SELECTORS.inputs.coladeiraFim, item.coladeirafim],
      [SELECTORS.inputs.coladeiraId, item.coladeiraresp],
      [SELECTORS.inputs.coladeiraResp, item.coladeiraname],

      [SELECTORS.inputs.usinagemInicio, item.usinageminicio],
      [SELECTORS.inputs.usinagemFim, item.usinagemfim],
      [SELECTORS.inputs.usinagemId, item.usinagemresp],
      [SELECTORS.inputs.usinagemResp, item.usinagemname],

      [SELECTORS.inputs.montagemInicio, item.montageminicio],
      [SELECTORS.inputs.montagemFim, item.montagemfim],
      [SELECTORS.inputs.montagemId, item.montagemresp],
      [SELECTORS.inputs.montagemResp, item.montagemname],

      [SELECTORS.inputs.paineisInicio, item.paineisinicio],
      [SELECTORS.inputs.paineisFim, item.paineisfim],
      [SELECTORS.inputs.paineisId, item.paineisresp],
      [SELECTORS.inputs.paineisResp, item.paineisname],

      [SELECTORS.inputs.acabamentoInicio, item.acabamentoinicio],
      [SELECTORS.inputs.acabamentoFim, item.acabamentofim],
      [SELECTORS.inputs.acabamentoId, item.acabamentoresp],
      [SELECTORS.inputs.acabamentoResp, item.acabamentoname],

      [SELECTORS.inputs.embalagemInicio, item.embalageminicio],
      [SELECTORS.inputs.embalagemFim, item.embalagemfim],
      [SELECTORS.inputs.embalagemId, item.embalagemresp],
      [SELECTORS.inputs.embalagemResp, item.embalagemname],

      [SELECTORS.inputs.observacoes, item.observacoes],
    ],
    checks: [
      [SELECTORS.checks.cortePausa, item.cortepausa],
      [SELECTORS.checks.customPausa, item.customizacaopausa],
      [SELECTORS.checks.coladeiraPausa, item.coladeirapausa],
      [SELECTORS.checks.usinagemPausa, item.usinagempausa],
      [SELECTORS.checks.montagemPausa, item.montagempausa],
      [SELECTORS.checks.paineisPausa, item.paineispausa],
      [SELECTORS.checks.acabamentoPausa, item.acabamentopausa],
      [SELECTORS.checks.embalagemPausa, item.embalagempausa],
    ],
  };
}

async function applyProductionToForm(mapped) {
  mapped.inputs.forEach(([selector, value]) => Fields.set(selector, value));
  mapped.checks.forEach(([selector, value]) =>
    Fields.setChecked(selector, value),
  );
}

function buildDataProductionPayloadFromForm() {
  return {
    p_ordemdecompra: Fields.get(SELECTORS.inputs.numoc),

    p_corteinicio: Fields.get(SELECTORS.inputs.corteInicio),
    p_cortefim: Fields.get(SELECTORS.inputs.corteFim),
    p_corteresp: Fields.get(SELECTORS.inputs.corteId),
    p_cortepausa: Fields.getChecked(SELECTORS.checks.cortePausa),

    p_customizacaoinicio: Fields.get(SELECTORS.inputs.customInicio),
    p_customizacaofim: Fields.get(SELECTORS.inputs.customFim),
    p_customizacaoresp: Fields.get(SELECTORS.inputs.customId),
    p_customizacaopausa: Fields.getChecked(SELECTORS.checks.customPausa),

    p_coladeirainicio: Fields.get(SELECTORS.inputs.coladeiraInicio),
    p_coladeirafim: Fields.get(SELECTORS.inputs.coladeiraFim),
    p_coladeiraresp: Fields.get(SELECTORS.inputs.coladeiraId),
    p_coladeirapausa: Fields.getChecked(SELECTORS.checks.coladeiraPausa),

    p_usinageminicio: Fields.get(SELECTORS.inputs.usinagemInicio),
    p_usinagemfim: Fields.get(SELECTORS.inputs.usinagemFim),
    p_usinagemresp: Fields.get(SELECTORS.inputs.usinagemId),
    p_usinagempausa: Fields.getChecked(SELECTORS.checks.usinagemPausa),

    p_montageminicio: Fields.get(SELECTORS.inputs.montagemInicio),
    p_montagemfim: Fields.get(SELECTORS.inputs.montagemFim),
    p_montagemresp: Fields.get(SELECTORS.inputs.montagemId),
    p_montagempausa: Fields.getChecked(SELECTORS.checks.montagemPausa),

    p_paineisinicio: Fields.get(SELECTORS.inputs.paineisInicio),
    p_paineisfim: Fields.get(SELECTORS.inputs.paineisFim),
    p_paineisresp: Fields.get(SELECTORS.inputs.paineisId),
    p_paineispausa: Fields.getChecked(SELECTORS.checks.paineisPausa),

    p_acabamentoinicio: Fields.get(SELECTORS.inputs.acabamentoInicio),
    p_acabamentofim: Fields.get(SELECTORS.inputs.acabamentoFim),
    p_acabamentoresp: Fields.get(SELECTORS.inputs.acabamentoId),
    p_acabamentopausa: Fields.getChecked(SELECTORS.checks.acabamentoPausa),

    p_embalageminicio: Fields.get(SELECTORS.inputs.embalagemInicio),
    p_embalagemfim: Fields.get(SELECTORS.inputs.embalagemFim),
    p_embalagemresp: Fields.get(SELECTORS.inputs.embalagemId),
    p_embalagempausa: Fields.getChecked(SELECTORS.checks.embalagemPausa),

    p_observacoes: Fields.get(SELECTORS.inputs.observacoes),
    p_previsao: Fields.get(SELECTORS.inputs.previsao),
  };
}

/* =========================================================
   USE CASES / HANDLERS
========================================================= */
async function handleLoadOrder(pedidoValue) {
  try {
    const p6 = orderBuy(pedidoValue);
    if (!p6) {
      await showError("Pedido inválido.");
      return;
    }

    const res = await ProducaoAPI.getProductionBarcode(p6);

    if (res.status !== 200) {
      await showHttpError(res.status);
      return;
    }

    const item = res?.data?.[0];
    if (!item) {
      await showError("Pedido não encontrado ou retorno vazio.");
      return;
    }

    await applyProductionToForm(mapProducaoToForm(item));
  } catch (err) {
    await showError(`Erro ao buscar dados: ${err}`);
    console.warn(err);
  } finally {
    Fields.focus(SELECTORS.inputs.scan);
  }
}

function getStepsForValidation(payload) {
  return [
    { etapa: "Corte", start: payload.p_corteinicio, end: payload.p_cortefim },
    {
      etapa: "Customização",
      start: payload.p_customizacaoinicio,
      end: payload.p_customizacaofim,
    },
    {
      etapa: "Coladeira",
      start: payload.p_coladeirainicio,
      end: payload.p_coladeirafim,
    },
    {
      etapa: "Usinagem",
      start: payload.p_usinageminicio,
      end: payload.p_usinagemfim,
    },
    {
      etapa: "Montagem",
      start: payload.p_montageminicio,
      end: payload.p_montagemfim,
    },
    {
      etapa: "Paineis",
      start: payload.p_paineisinicio,
      end: payload.p_paineisfim,
    },
    {
      etapa: "Acabamentos",
      start: payload.p_acabamentoinicio,
      end: payload.p_acabamentofim,
    },
    {
      etapa: "Embalagem",
      start: payload.p_embalageminicio,
      end: payload.p_embalagemfim,
    },
  ];
}

function validateSteps(payload) {
  const steps = getStepsForValidation(payload);

  for (const step of steps) {
    if (step.end && !step.start) {
      return `A data de início da etapa "${step.etapa}" não foi preenchida.`;
    }

    if (
      step.start &&
      step.end &&
      DateTime.isEndBeforeStart(step.start, step.end)
    ) {
      return `A data de fim da etapa "${step.etapa}" não pode ser anterior à data de início.`;
    }

    if (step.start && DateTime.isDateInFuture(step.start)) {
      return `A data de início da etapa "${step.etapa}" não pode ser maior que a data de hoje.`;
    }

    if (step.end && DateTime.isDateInFuture(step.end)) {
      return `A data de fim da etapa "${step.etapa}" não pode ser maior que a data de hoje.`;
    }
  }

  return null;
}

function showWarning(message) {
  return Modal.showInfo("warning", "ATENÇÃO", message);
}

async function handleSaveClick() {
  const confirm = await confirmUpdate();
  if (!confirm.isConfirmed) return;

  try {
    const payload = buildDataProductionPayloadFromForm();
    const error = validateSteps(payload);

    if (error) {
      await showWarning(error);
      return;
    }

    const res = await ProducaoAPI.setDataProduction(payload);

    if (res.status === 200) {
      await showSuccess("Alterações confirmadas com sucesso!");
      return;
    }

    await showHttpError(res.status);
  } catch (err) {
    await showError(
      `Falha na comunicação com o servidor: ${err?.message || err}`,
    );
  }
}

async function handleReadBarcode(barcode) {
  const { pedido, codigo } = parseBarcode(barcode);

  if (!Number.isFinite(pedido) || !Number.isFinite(codigo)) {
    await showError("Código de barras inválido.");
    return;
  }

  try {
    const payload = { p_pedido: pedido, p_codigo: codigo };
    const res = await ProducaoAPI.setStage(payload);

    if (res.status !== 200) {
      await showHttpError(res.status);
      return;
    }

    await showSuccess("Processo atualizado com sucesso!");
  } catch (err) {
    await showError(`Erro ao atualizar processo: ${err?.message || err}`);
  } finally {
    Fields.set(SELECTORS.inputs.scan, "");
  }
}

function styleField(element) {
  const el = q(element);
  el.classList.add("mark-field");
}

function setDateTimeSetorFromBarcode(barcode) {
  const { codigoStr } = parseBarcode(barcode);
  const etapaKey = getSectorKey(codigoStr?.[1]);
  const actionKey = getOperationKey(codigoStr?.[2]);

  if (!etapaKey || !actionKey) {
    showError("Etapa/Operação inválida no código de barras.");
    return;
  }

  const element = `#txt_${etapaKey}${actionKey}`;
  try {
    styleField(element);
    Dom.setValue(element, DateTime.now());
    Fields.set(SELECTORS.inputs.scan, "");
  } catch (erro) {
    showError(String(erro));
  }
}

async function handleScanButtonClick() {
  try {
    const result = await modalBarCode();
    const { pedido, raw } = parseBarcode(result);

    Fields.set(SELECTORS.inputs.pedido, pedido);
    await handleLoadOrder(raw);
    setDateTimeSetorFromBarcode(raw);
  } catch (erro) {
    await showError(`ERRO: ${erro?.message || erro}`);
  }
}

async function handleScanInputChange() {
  const barcode = Fields.get(SELECTORS.inputs.scan);
  setDateTimeSetorFromBarcode(barcode);
}

/* =========================================================
   (Opcional) CONFIRMAR ETAPA PELO CÓDIGO DE BARRAS
   - mantido no padrão, caso você use esta função em algum lugar
========================================================= */
async function confirmStageFromBarcode(barcode) {
  const { pedido, codigoStr } = parseBarcode(barcode);

  try {
    const res = await ProducaoAPI.getBarcode(pedido);

    if (res.status !== 200) {
      await showHttpError(res.status);
      return;
    }

    const data = res?.data?.[0];
    if (!data) {
      await showError("Retorno vazio para o código de barras.");
      return;
    }

    const etapa = codigoStr;
    const question = await Modal.showConfirmation(
      "Codigo de Barras",
      `${getAcaoName(etapa[1])} ${getEtapaName(etapa[0])} ? <br> ${
        data.p_contrato
      } <br> ${data.p_cliente} <br> ${data.p_ambiente}`,
      "Sim",
      "Não",
    );

    if (question.isConfirmed) {
      await handleReadBarcode(barcode);
    }
  } catch (err) {
    await showError(`Erro ao confirmar etapa: ${err?.message || err}`);
  } finally {
    Fields.set(SELECTORS.inputs.scan, "");
  }
}

/* =========================================================
   BINDINGS
========================================================= */
function bindUsuarioLookups() {
  Dom.addEventBySelector(SELECTORS.inputs.corteId, "change", async () => {
    Fields.set(
      SELECTORS.inputs.corteResp,
      await getName(SELECTORS.inputs.corteId),
    );
  });

  Dom.addEventBySelector(SELECTORS.inputs.customId, "change", async () => {
    Fields.set(
      SELECTORS.inputs.customResp,
      await getName(SELECTORS.inputs.customId),
    );
  });

  Dom.addEventBySelector(SELECTORS.inputs.coladeiraId, "change", async () => {
    Fields.set(
      SELECTORS.inputs.coladeiraResp,
      await getName(SELECTORS.inputs.coladeiraId),
    );
  });

  Dom.addEventBySelector(SELECTORS.inputs.usinagemId, "change", async () => {
    Fields.set(
      SELECTORS.inputs.usinagemResp,
      await getName(SELECTORS.inputs.usinagemId),
    );
  });

  Dom.addEventBySelector(SELECTORS.inputs.montagemId, "change", async () => {
    Fields.set(
      SELECTORS.inputs.montagemResp,
      await getName(SELECTORS.inputs.montagemId),
    );
  });

  Dom.addEventBySelector(SELECTORS.inputs.paineisId, "change", async () => {
    Fields.set(
      SELECTORS.inputs.paineisResp,
      await getName(SELECTORS.inputs.paineisId),
    );
  });

  Dom.addEventBySelector(SELECTORS.inputs.acabamentoId, "change", async () => {
    Fields.set(
      SELECTORS.inputs.acabamentoResp,
      await getName(SELECTORS.inputs.acabamentoId),
    );
  });

  Dom.addEventBySelector(SELECTORS.inputs.embalagemId, "change", async () => {
    Fields.set(
      SELECTORS.inputs.embalagemResp,
      await getName(SELECTORS.inputs.embalagemId),
    );
  });
}

function bindEvents() {
  Dom.addEventBySelector(SELECTORS.buttons.salvar, "click", handleSaveClick);

  Dom.addEventBySelector(SELECTORS.inputs.pedido, "change", () =>
    handleLoadOrder(Fields.get(SELECTORS.inputs.pedido)),
  );

  Dom.addEventBySelector(
    SELECTORS.buttons.scan,
    "click",
    handleScanButtonClick,
  );
  Dom.addEventBySelector(
    SELECTORS.inputs.scan,
    "change",
    handleScanInputChange,
  );

  bindUsuarioLookups();
}

/* =========================================================
   PAGE SETUP (INIT)
========================================================= */
function configureUiDefaults() {
  configureDeviceUi();
  Fields.focus(SELECTORS.inputs.pedido);
}

function initProducaoPage() {
  configureUiDefaults();
  bindEvents();
}

window.addEventListener("DOMContentLoaded", initProducaoPage);
