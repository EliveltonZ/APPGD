import {
  Dom,
  checkValue,
  getColumnValue,
  onmouseover,
  onclickHighlightRow,
  loadPage,
  colorStatus,
  createModal,
  messageInformation,
  messageQuestion,
  getConfig,
  setConfig,
} from "./utils.js";

import { enableTableFilterSort } from "./filtertable.js";

async function getAcessoriosCompras() {
  const tbody = document.querySelector("tbody"); // ajuste para um seletor mais específico se houver várias tabelas
  if (!tbody) return;

  // ===== Helpers =====

  const collator = new Intl.Collator("pt-BR", {
    sensitivity: "base",
    numeric: true,
  });

  // Converte nulos/undefined para string; garante tipo string
  const s = (v) => (v ?? "").toString();

  // Escape simples para evitar XSS ao usar innerHTML
  const esc = (str) =>
    s(str).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );

  // ======== PARSERS/FORMATADORES "TIMEZONE-SAFE" PARA DATAS PURAS ========

  // tenta "YYYY-MM-DD"
  const parseYMD = (str) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || "").trim());
    if (!m) return null;
    const y = +m[1],
      mo = +m[2],
      d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return { y, mo, d };
  };

  // tenta "DD/MM/YYYY"
  const parseDMY = (str) => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(str || "").trim());
    if (!m) return null;
    const d = +m[1],
      mo = +m[2],
      y = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return { y, mo, d };
  };

  // aceita DMY ou YMD
  const parseDateParts = (v) => parseYMD(v) || parseDMY(v) || null;

  // chave numérica YYYYMMDD para ordenar sem usar Date
  const dateKey = (v) => {
    const p = parseDateParts(v);
    return p ? p.y * 10000 + p.mo * 100 + p.d : null;
  };

  // formata em pt-BR (DD/MM/YYYY) sem converter fuso
  const fmtDateBR = (v) => {
    const p = parseDateParts(v);
    if (!p) return "";
    const dd = String(p.d).padStart(2, "0");
    const mm = String(p.mo).padStart(2, "0");
    return `${dd}/${mm}/${p.y}`;
  };

  // converte DD/MM/YYYY -> YYYY-MM-DD (para <input type="date">) sem usar Date
  const toISOFromBR = (dmy) => {
    const p = parseDMY(dmy);
    if (!p) return ""; // mantém vazio se inválido
    const dd = String(p.d).padStart(2, "0");
    const mm = String(p.mo).padStart(2, "0");
    return `${p.y}-${mm}-${dd}`;
  };

  // ===== Comparadores =====
  const compareDate = (a, b) => {
    const ka = dateKey(a);
    const kb = dateKey(b);
    if (ka != null && kb != null) return ka - kb; // mais antiga primeiro
    if (ka != null && kb == null) return -1; // com data vem antes de sem data
    if (ka == null && kb != null) return 1;
    return 0;
  };

  const compareStr = (a, b) => collator.compare(s(a), s(b));

  const compareItem = (a, b) => {
    // 1) dataentrega
    const byDate = compareDate(a.dataentrega, b.dataentrega);
    if (byDate !== 0) return byDate;

    // 2) cliente
    const byCliente = compareStr(a.cliente, b.cliente);
    if (byCliente !== 0) return byCliente;

    // 3) ambiente
    const byAmbiente = compareStr(a.ambiente, b.ambiente);
    if (byAmbiente !== 0) return byAmbiente;

    // 4) categoria
    const byCategoria = compareStr(a.categoria, b.categoria);
    if (byCategoria !== 0) return byCategoria;

    // 5) descricao
    return compareStr(a.descricao, b.descricao);
  };
  // ===== Fim helpers =====

  try {
    const response = await fetch(
      `/getAcessoriosCompras?p_dataentrega=${Dom.getValue("txt_datafilter")}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Formato de resposta inválido");

    const sorted = data.slice().sort(compareItem);

    if (sorted.length === 0) {
      tbody.innerHTML = `<tr><td colspan="16" style="text-align:center">Sem registros</td></tr>`;
      return;
    }

    const rowsHtml = sorted
      .map((item) => {
        const cor_status =
          typeof colorStatus === "function" ? colorStatus(item.status) : "";

        return `
        <tr class="open-modal-row">
          <td style="text-align:center">${esc(item.contrato)}</td>
          <td>${esc(item.cliente)}</td>
          <td>${esc(item.ambiente)}</td>
          <td>${esc(item.descricao)}</td>
          <td style="text-align:center">${checkValue(esc(item.medida))}</td>
          <td style="text-align:center">${checkValue(
            esc(item.parcelamento)
          )}</td>
          <td style="text-align:center">${checkValue(esc(item.numcard))}</td>
          <td style="text-align:center">${esc(item.qtd)}</td>
          <td>${checkValue(esc(item.fornecedor))}</td>
          <td style="text-align:center">${checkValue(
            fmtDateBR(item.dataentrega)
          )}</td>
          <td style="text-align:center">${checkValue(
            fmtDateBR(item.datacompra)
          )}</td>
          <td style="text-align:center">${checkValue(
            fmtDateBR(item.previsao)
          )}</td>
          <td style="text-align:center">${checkValue(
            fmtDateBR(item.recebido)
          )}</td>
          <td style="text-align:center; ${esc(cor_status)}">${esc(
          item.status
        )}</td>
          <td>${esc(item.categoria)}</td>
          <td style="text-align:center; display:none">${esc(item.id)}</td>
        </tr>
      `;
      })
      .join("");

    tbody.innerHTML = rowsHtml;
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="16" style="text-align:center">Erro ao carregar</td></tr>`;
    if (typeof messageInformation === "function") {
      messageInformation(
        "error",
        "ERRO",
        `Não foi possível carregar dados: ${error.message}`
      );
    } else {
      console.error(error);
    }
  }

  // ==== funções internas expostas para outros trechos (fillElement) ====
  // Tornamos helpers acessíveis fora deste escopo, caso o bundler não "suba" os escopos.
  getAcessoriosCompras._fmtDateBR = fmtDateBR;
  getAcessoriosCompras._toISOFromBR = toISOFromBR;
}

// Atualiza os campos do modal com os valores da linha clicada
function fillElement(element) {
  // se os helpers foram anexados em getAcessoriosCompras(), usamos daqui
  const toISOFromBR =
    (getAcessoriosCompras && getAcessoriosCompras._toISOFromBR) ||
    ((d) => {
      // fallback local (repete a lógica caso ainda não exista)
      const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(d || "").trim());
      if (!m) return "";
      const dd = m[1],
        mm = m[2],
        y = m[3];
      return `${y}-${mm}-${dd}`;
    });

  const id = getColumnValue(element, 15);
  const contrato = getColumnValue(element, 0);
  const cliente = getColumnValue(element, 1);
  const ambiente = getColumnValue(element, 2);
  const descricao = getColumnValue(element, 3);
  const medida = getColumnValue(element, 4);
  const parcelamento = getColumnValue(element, 5);
  const cartao = getColumnValue(element, 6);
  const quantidade = getColumnValue(element, 7);
  const fornecedor = getColumnValue(element, 8);

  const compra = toISOFromBR(getColumnValue(element, 10));
  const previsao = toISOFromBR(getColumnValue(element, 11));
  const recebido = toISOFromBR(getColumnValue(element, 12));

  Dom.setValue("txt_id", id);
  Dom.setValue("txt_contrato", contrato);
  Dom.setValue("txt_cliente", cliente);
  Dom.setValue("txt_ambiente", ambiente);
  Dom.setValue("txt_descricao", descricao);
  Dom.setValue("txt_medida", medida);
  Dom.setValue("txt_parcelamento", parcelamento);
  Dom.setValue("txt_cartao", cartao);
  Dom.setValue("txt_quantidade", quantidade);
  Dom.setValue("txt_fornecedor", fornecedor);
  Dom.setValue("txt_compra", compra);
  Dom.setValue("txt_previsao", previsao);
  Dom.setValue("txt_recebido", recebido);
}

document
  .getElementById("table")
  .addEventListener("dblclick", async function (event) {
    const td = event.target;
    const tr = td.closest(".open-modal-row");

    if (!tr || td.tagName !== "TD") return;
    fillElement(td);
    createModal("modal");
  });

async function setAcessorios() {
  const data = {
    p_id: Dom.getValue("txt_id"),
    p_descricao: Dom.getValue("txt_descricao"),
    p_medida: Dom.getValue("txt_medida"),
    p_parcelamento: Dom.getValue("txt_parcelamento"),
    p_numcard: Dom.getValue("txt_cartao"),
    p_qtd: Dom.getValue("txt_quantidade"),
    p_fornecedor: Dom.getValue("txt_fornecedor"),
    p_datacompra: Dom.getValue("txt_compra"),
    p_previsao: Dom.getValue("txt_previsao"),
    p_recebido: Dom.getValue("txt_recebido"),
  };

  const response = await fetch("/setAcessorios", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errText = await response.text();
    messageInformation("error", "ERRO", `erro ao salvar alterações ${errText}`);
  } else {
    messageInformation(
      "success",
      "Sucesso",
      "alterações salvas com Sucesso !!!"
    );
  }
}

async function getDataFilterBuy() {
  const data = await getConfig(3);
  Dom.setValue("txt_datafilter", data[0].p_data);
  getAcessoriosCompras();
}

async function setDataFilterExp() {
  const data = {
    p_id: 3,
    p_date: Dom.getValue("txt_datafilter"),
  };
  await setConfig(data);
}

function setarDataHora(checkbox, text) {
  setDateTime(checkbox, text);
}

document.addEventListener("DOMContentLoaded", (event) => {
  loadPage("compras", "compras.html");
  getDataFilterBuy();
  onmouseover("table");
  onclickHighlightRow("table");
  enableTableFilterSort("table");
  Dom.allUpperCase();
});

// atualiza lista e salva filtro ao sair do campo de data
Dom.addEventBySelector("#txt_datafilter", "blur", getAcessoriosCompras);
Dom.addEventBySelector("#txt_datafilter", "blur", setDataFilterExp);
Dom.addEventBySelector("#bt_update", "click", setAcessorios);
