export function enableTableFilterSort(tableId) {
  const table = document.getElementById(tableId);
  const columnFilters = {}; // { colIndex: FilterConfig }
  const sortStates = {}; // { colIndex: 'asc' | 'desc' }

  const popup = document.createElement("div");
  popup.id = "filterPopup";
  popup.className = "card shadow-sm";
  Object.assign(popup.style, {
    display: "none",
    position: "absolute",
    zIndex: 1000,
    whiteSpace: "nowrap",
    width: "auto",
    maxWidth: "none",
    fontSize: "12px",
  });
  document.body.appendChild(popup);

  // =========================
  // Helpers de parsing/detect
  // =========================
  const rx = {
    number: /^-?\s*\d{1,3}(\.\d{3})*(,\d+)?$|^-?\s*\d+(\.\d+)?$/, // 1.234,56 | 1234.56 | -12
    dateBR: /^\d{2}\/\d{2}\/\d{4}$/,
    dateISO: /^\d{4}-\d{2}-\d{2}$/,
    boolean: /^(true|false|verdadeiro|falso|sim|não|nao)$/i,
  };

  function isEmptyStr(s) {
    return s === "" || s === null || s === undefined;
  }

  function parseNumber(str) {
    if (isEmptyStr(str)) return null;
    // aceita "1.234,56" e "1234.56"
    const s = String(str).trim().replace(/\s/g, "");
    const norm = s.match(/,\d{1,}$/)
      ? s.replace(/\./g, "").replace(",", ".")
      : s;
    const n = Number(norm);
    return Number.isFinite(n) ? n : null;
  }

  function parseDate(str, typeHint) {
    if (isEmptyStr(str)) return null;
    const s = String(str).trim();
    if (typeHint === "date-br" || rx.dateBR.test(s)) {
      const [d, m, y] = s.split("/");
      const dt = new Date(`${y}-${m}-${d}T00:00:00`);
      return isNaN(dt) ? null : dt;
    }
    if (typeHint === "date-iso" || rx.dateISO.test(s)) {
      const dt = new Date(`${s}T00:00:00`);
      return isNaN(dt) ? null : dt;
    }
    return null;
  }

  function normalizeBoolean(str) {
    if (isEmptyStr(str)) return null;
    const s = String(str).trim().toLowerCase();
    if (["true", "verdadeiro", "sim"].includes(s)) return true;
    if (["false", "falso", "não", "nao"].includes(s)) return false;
    return null;
  }

  function detectCellType(val) {
    if (isEmptyStr(val)) return "empty";
    const s = String(val).trim();
    if (rx.number.test(s)) return "number";
    if (rx.dateBR.test(s)) return "date-br";
    if (rx.dateISO.test(s)) return "date-iso";
    if (rx.boolean.test(s)) return "boolean";
    return "text";
  }

  // Inferência por amostragem da coluna (mais robusto que 1 célula só)
  function inferColumnType(colIndex) {
    const rows = Array.from(table.tBodies[0].rows);
    const sample = rows.slice(0, 50); // amostra
    const counts = {
      number: 0,
      "date-br": 0,
      "date-iso": 0,
      boolean: 0,
      text: 0,
      empty: 0,
    };

    sample.forEach((row) => {
      const cell = row.cells[colIndex];
      if (!cell) return;
      const t = detectCellType(cell.textContent.trim());
      counts[t] = (counts[t] || 0) + 1;
    });

    // regra: se algum tipo (exceto empty/text) tiver >=50% da amostra, é o tipo
    const total = sample.length || 1;
    const candidates = ["number", "date-br", "date-iso", "boolean"];
    for (const t of candidates) {
      if (counts[t] / total >= 0.5) return t;
    }
    return "text";
  }

  function getColumnValues(colIndex, includeHidden = false) {
    const out = [];
    [...table.tBodies[0].rows].forEach((row) => {
      if (includeHidden || row.style.display !== "none") {
        const v = row.cells[colIndex]?.textContent.trim() ?? "";
        out.push(v === "" ? "(vazio)" : v);
      }
    });
    return out;
  }

  function getUniqueValues(colIndex) {
    const values = new Set(getColumnValues(colIndex, true));
    const unique = Array.from(values);

    // ordenar por tipo
    const type = inferColumnType(colIndex);
    unique.sort((a, b) => {
      if (a === "(vazio)" || b === "(vazio)") return a === "(vazio)" ? -1 : 1;
      let A = a,
        B = b;
      if (type === "number") {
        A = parseNumber(A) ?? -Infinity;
        B = parseNumber(B) ?? -Infinity;
      } else if (type === "date-br") {
        A = parseDate(A, "date-br") ?? new Date(0);
        B = parseDate(B, "date-br") ?? new Date(0);
      } else if (type === "date-iso") {
        A = parseDate(A, "date-iso") ?? new Date(0);
        B = parseDate(B, "date-iso") ?? new Date(0);
      } else if (type === "boolean") {
        A = normalizeBoolean(A);
        B = normalizeBoolean(B);
      } else {
        A = String(A).toLowerCase();
        B = String(B).toLowerCase();
      }
      return A < B ? -1 : A > B ? 1 : 0;
    });

    return unique;
  }

  // ==============
  // Aplicar filtros
  // ==============
  function applyFilters() {
    const rows = [...table.tBodies[0].rows];
    rows.forEach((row) => {
      let visible = true;
      for (const [col, cfg] of Object.entries(columnFilters)) {
        const raw = row.cells[col]?.textContent.trim() ?? "";
        const val = raw === "" ? "(vazio)" : raw;
        if (!passesFilter(val, cfg)) {
          visible = false;
          break;
        }
      }
      row.style.display = visible ? "" : "none";
    });
  }

  function passesFilter(value, cfg) {
    // cfg: { type, mode, ... }
    if (!cfg) return true;

    // sempre considerar seleção de vazios quando disponível
    const isEmpty = value === "(vazio)";

    switch (cfg.type) {
      case "boolean": {
        if (isEmpty) return cfg.includeEmpty ?? false;
        const b = normalizeBoolean(value);
        if (b === null) return false;
        return cfg.values?.includes(String(b)) || false; // "true"/"false"
      }
      case "number": {
        if (isEmpty) return cfg.includeEmpty ?? false;
        const n = parseNumber(value);
        if (n === null) return false;
        const m = cfg.mode;
        if (m === "eq") return n === cfg.a;
        if (m === "ne") return n !== cfg.a;
        if (m === "gt") return n > cfg.a;
        if (m === "ge") return n >= cfg.a;
        if (m === "lt") return n < cfg.a;
        if (m === "le") return n <= cfg.a;
        if (m === "between") {
          const minOk = cfg.a === null || n >= cfg.a;
          const maxOk = cfg.b === null || n <= cfg.b;
          return minOk && maxOk;
        }
        return true;
      }
      case "date-br":
      case "date-iso": {
        if (isEmpty) return cfg.includeEmpty ?? false;
        const d = parseDate(value, cfg.type);
        if (!d) return false;
        const m = cfg.mode;
        const a = cfg.a ? new Date(cfg.a) : null;
        const b = cfg.b ? new Date(cfg.b) : null;
        // zerar hora
        d.setHours(0, 0, 0, 0);
        if (a) a.setHours(0, 0, 0, 0);
        if (b) b.setHours(0, 0, 0, 0);
        if (m === "eq") return a && d.getTime() === a.getTime();
        if (m === "lt") return a && d < a;
        if (m === "gt") return a && d > a;
        if (m === "between") {
          const minOk = a ? d >= a : true;
          const maxOk = b ? d <= b : true;
          return minOk && maxOk;
        }
        return true;
      }
      case "text": {
        if (isEmpty) return cfg.includeEmpty ?? false;
        const needle = cfg.caseSensitive
          ? String(cfg.term)
          : String(cfg.term).toLowerCase();
        const hay = cfg.caseSensitive ? value : value.toLowerCase();
        if (cfg.mode === "equals") return hay === needle;
        if (cfg.mode === "contains") return hay.includes(needle);
        if (cfg.mode === "starts") return hay.startsWith(needle);
        if (cfg.mode === "ends") return hay.endsWith(needle);
        return true;
      }
      case "enum": {
        // checklist de valores
        return (
          cfg.selected?.includes(value) ||
          (isEmpty && cfg.includeEmpty) ||
          false
        );
      }
      default:
        return true;
    }
  }

  // =========
  // Ordenação
  // =========
  function sortTable(colIndex, order) {
    const rows = Array.from(table.tBodies[0].rows);
    const type = inferColumnType(colIndex);

    rows.sort((a, b) => {
      let A = a.cells[colIndex]?.textContent.trim() ?? "";
      let B = b.cells[colIndex]?.textContent.trim() ?? "";

      // vazios ao final (asc) / início (desc)
      const aEmpty = A === "";
      const bEmpty = B === "";
      if (aEmpty || bEmpty) {
        if (aEmpty && bEmpty) return 0;
        return order === "asc" ? (aEmpty ? 1 : -1) : aEmpty ? -1 : 1;
      }

      if (type === "number") {
        A = parseNumber(A) ?? 0;
        B = parseNumber(B) ?? 0;
      } else if (type === "date-br") {
        A = parseDate(A, "date-br") ?? new Date(0);
        B = parseDate(B, "date-br") ?? new Date(0);
      } else if (type === "date-iso") {
        A = parseDate(A, "date-iso") ?? new Date(0);
        B = parseDate(B, "date-iso") ?? new Date(0);
      } else if (type === "boolean") {
        A = normalizeBoolean(A) === true ? 1 : 0;
        B = normalizeBoolean(B) === true ? 1 : 0;
      } else {
        A = A.toLowerCase();
        B = B.toLowerCase();
      }

      if (A < B) return order === "asc" ? -1 : 1;
      if (A > B) return order === "asc" ? 1 : -1;
      return 0;
    });

    const fragment = document.createDocumentFragment();
    rows.forEach((row) => fragment.appendChild(row));
    table.tBodies[0].appendChild(fragment);
  }

  // =====================
  // Popup & UI por tipo
  // =====================
  function buildEnumChecklistHTML(values, colIndex, existing) {
    const checked = new Set(existing?.selected || []);
    const includeEmpty = existing?.includeEmpty || false;

    const items = values
      .map((val, i) => {
        const id = `chk_${colIndex}_${i}`;
        const isChecked = checked.has(val) ? "checked" : "";
        return `
        <div class="form-check">
          <input class="form-check-input filter-enum" type="checkbox" value="${val}" id="${id}" ${isChecked}>
          <label class="form-check-label" for="${id}">${val}</label>
        </div>
      `;
      })
      .join("");

    const emptyId = `chk_${colIndex}_empty`;
    return `
      <button class="btn btn-sm btn-secondary mb-2" id="toggleSelectAll">Marcar/Desmarcar Todos</button>
      <div class="overflow-auto mb-3" style="max-height:200px;">${items}</div>
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="${emptyId}" ${
      includeEmpty ? "checked" : ""
    }>
        <label class="form-check-label" for="${emptyId}">(incluir vazios)</label>
      </div>
    `;
  }

  function buildTextHTML(existing) {
    const modes = [
      ["contains", "Contém"],
      ["equals", "Igual a"],
      ["starts", "Começa com"],
      ["ends", "Termina com"],
    ];
    return `
      <div class="row g-2 mb-3">
        <div class="col">
          <select class="form-select form-select-sm" id="txtMode">
            ${modes
              .map(
                ([v, t]) =>
                  `<option value="${v}" ${
                    existing?.mode === v ? "selected" : ""
                  }>${t}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="col">
          <input type="text" id="txtTerm" class="form-control form-control-sm" placeholder="valor..." value="${
            existing?.term ?? ""
          }">
        </div>
      </div>
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="txtCase" ${
          existing?.caseSensitive ? "checked" : ""
        }>
        <label class="form-check-label" for="txtCase">Case sensitive</label>
      </div>
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="txtEmpty" ${
          existing?.includeEmpty ? "checked" : ""
        }>
        <label class="form-check-label" for="txtEmpty">(incluir vazios)</label>
      </div>
    `;
  }

  function buildNumberHTML(existing) {
    const mode = existing?.mode || "between";
    const a = existing?.a ?? "";
    const b = existing?.b ?? "";
    return `
      <div class="mb-2">
        <select class="form-select form-select-sm mb-2" id="numMode">
          <option value="eq" ${mode === "eq" ? "selected" : ""}>=</option>
          <option value="ne" ${mode === "ne" ? "selected" : ""}>≠</option>
          <option value="gt" ${mode === "gt" ? "selected" : ""}>&gt;</option>
          <option value="ge" ${mode === "ge" ? "selected" : ""}>&gt;=</option>
          <option value="lt" ${mode === "lt" ? "selected" : ""}>&lt;</option>
          <option value="le" ${mode === "le" ? "selected" : ""}>&lt;=</option>
          <option value="between" ${
            mode === "between" ? "selected" : ""
          }>Entre</option>
        </select>
        <div class="row g-2">
          <div class="col"><input type="text" inputmode="decimal" class="form-control form-control-sm" id="numA" placeholder="de/valor" value="${a}"></div>
          <div class="col"><input type="text" inputmode="decimal" class="form-control form-control-sm" id="numB" placeholder="até" value="${b}"></div>
        </div>
      </div>
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="numEmpty" ${
          existing?.includeEmpty ? "checked" : ""
        }>
        <label class="form-check-label" for="numEmpty">(incluir vazios)</label>
      </div>
    `;
  }

  function buildDateHTML(existing, type) {
    const mode = existing?.mode || "between";
    const a = existing?.a ?? "";
    const b = existing?.b ?? "";
    const ph = type === "date-br" ? "dd/mm/aaaa" : "aaaa-mm-dd";
    return `
      <div class="mb-2">
        <select class="form-select form-select-sm mb-2" id="dateMode">
          <option value="eq" ${mode === "eq" ? "selected" : ""}>Igual</option>
          <option value="lt" ${
            mode === "lt" ? "selected" : ""
          }>Antes de</option>
          <option value="gt" ${
            mode === "gt" ? "selected" : ""
          }>Depois de</option>
          <option value="between" ${
            mode === "between" ? "selected" : ""
          }>Entre</option>
        </select>
        <div class="row g-2">
          <div class="col"><input type="text" class="form-control form-control-sm" id="dateA" placeholder="${ph}" value="${a}"></div>
          <div class="col"><input type="text" class="form-control form-control-sm" id="dateB" placeholder="${ph}" value="${b}"></div>
        </div>
      </div>
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="dateEmpty" ${
          existing?.includeEmpty ? "checked" : ""
        }>
        <label class="form-check-label" for="dateEmpty">(incluir vazios)</label>
      </div>
    `;
  }

  function buildBooleanHTML(existing) {
    const selected = new Set(existing?.values || ["true", "false"]);
    return `
      <div class="mb-2">
        <div class="form-check"><input class="form-check-input" type="checkbox" id="boolTrue" ${
          selected.has("true") ? "checked" : ""
        }><label class="form-check-label" for="boolTrue">Verdadeiro</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" id="boolFalse" ${
          selected.has("false") ? "checked" : ""
        }><label class="form-check-label" for="boolFalse">Falso</label></div>
      </div>
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="boolEmpty" ${
          existing?.includeEmpty ? "checked" : ""
        }>
        <label class="form-check-label" for="boolEmpty">(incluir vazios)</label>
      </div>
    `;
  }

  // Fechar ao clicar fora
  document.addEventListener("click", (e) => {
    if (!popup.contains(e.target)) popup.style.display = "none";
  });

  // Cabeçalhos: click => popup
  [...table.tHead.rows[0].cells].forEach((th, colIndex) => {
    th.dataset.originalText = th.textContent.trim();

    th.addEventListener("click", (e) => {
      e.stopPropagation();
      const type = inferColumnType(colIndex);
      const values = getUniqueValues(colIndex);
      const existing = columnFilters[colIndex];

      // Heurística: se for texto mas tiver poucos valores únicos (<=20), vira enum checklist
      const isEnumShort =
        (type === "text" || type === "boolean") &&
        values.length > 0 &&
        values.length <= 20;
      const finalType =
        type === "boolean" ? "boolean" : isEnumShort ? "enum" : type;

      const currentOrder = sortStates[colIndex] || "asc";

      // Monta conteúdo do popup baseado no tipo
      let bodyHTML = "";
      if (finalType === "enum")
        bodyHTML = buildEnumChecklistHTML(values, colIndex, existing);
      else if (finalType === "text") bodyHTML = buildTextHTML(existing);
      else if (finalType === "number") bodyHTML = buildNumberHTML(existing);
      else if (finalType === "date-br" || finalType === "date-iso")
        bodyHTML = buildDateHTML(existing, finalType);
      else if (finalType === "boolean") bodyHTML = buildBooleanHTML(existing);
      else bodyHTML = buildTextHTML(existing);

      popup.innerHTML = `
        <div class="card-body p-3">
          <h6 class="card-title mb-2">Filtrar coluna (${finalType})</h6>
          ${
            finalType === "enum"
              ? `
            <input type="text" id="searchInput" autocomplete="off" class="form-control form-control-sm mb-3" placeholder="Buscar nos valores...">
          `
              : ""
          }
          ${bodyHTML}
          <div class="d-flex justify-content-between">
            <button class="btn btn-sm btn-secondary" id="sortAlpha" data-sort="${currentOrder}">
              Ordenar ${currentOrder === "asc" ? "↓" : "↑"}
            </button>
            <div class="ms-auto">
              <button class="btn btn-sm btn-primary me-2" id="applyFilter">Aplicar</button>
              <button class="btn btn-sm btn-danger" id="clearFilter">Limpar</button>
            </div>
          </div>
        </div>
      `;

      // Posicionamento
      popup.style.visibility = "hidden";
      popup.style.display = "block";
      popup.style.left = "0px";
      const thRect = th.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      let left = thRect.left + window.scrollX;
      let top = thRect.bottom + window.scrollY;
      if (left + popupRect.width > window.innerWidth)
        left = Math.max(0, window.innerWidth - popupRect.width - 15);
      popup.style.top = `${top}px`;
      popup.style.left = `${left}px`;
      popup.style.visibility = "";

      // Search nos valores (enum)
      if (finalType === "enum") {
        const search = popup.querySelector("#searchInput");
        search?.addEventListener("input", function () {
          const val = this.value.toLowerCase();
          popup.querySelectorAll(".form-check").forEach((div) => {
            const lab =
              div.querySelector("label")?.textContent.toLowerCase() || "";
            if (div.querySelector(".filter-enum"))
              div.style.display = lab.includes(val) ? "" : "none";
          });
        });

        const toggleBtn = popup.querySelector("#toggleSelectAll");
        toggleBtn?.addEventListener("click", () => {
          const cbs = [...popup.querySelectorAll(".filter-enum")];
          const allChecked = cbs.every((cb) => cb.checked);
          cbs.forEach((cb) => (cb.checked = !allChecked));
        });
      }

      // Aplicar
      popup.querySelector("#applyFilter").addEventListener("click", () => {
        let cfg = null;
        if (finalType === "enum") {
          const selected = [
            ...popup.querySelectorAll(".filter-enum:checked"),
          ].map((cb) => cb.value);
          const includeEmpty =
            popup.querySelector(`#chk_${colIndex}_empty`)?.checked || false;
          if (selected.length || includeEmpty) {
            cfg = { type: "enum", selected, includeEmpty };
          }
        } else if (finalType === "text") {
          const mode = popup.querySelector("#txtMode").value;
          const term = popup.querySelector("#txtTerm").value || "";
          const caseSensitive = popup.querySelector("#txtCase").checked;
          const includeEmpty = popup.querySelector("#txtEmpty").checked;
          if (term || includeEmpty)
            cfg = { type: "text", mode, term, caseSensitive, includeEmpty };
        } else if (finalType === "number") {
          const mode = popup.querySelector("#numMode").value;
          const aRaw = popup.querySelector("#numA").value.trim();
          const bRaw = popup.querySelector("#numB").value.trim();
          const includeEmpty = popup.querySelector("#numEmpty").checked;
          const a = aRaw ? parseNumber(aRaw) : null;
          const b = bRaw ? parseNumber(bRaw) : null;
          // validação leve: se não tem nada e não quer vazio, não cria filtro
          if (
            includeEmpty ||
            a !== null ||
            (mode === "between" && b !== null)
          ) {
            cfg = { type: "number", mode, a, b, includeEmpty };
          }
        } else if (finalType === "date-br" || finalType === "date-iso") {
          const mode = popup.querySelector("#dateMode").value;
          const a = popup.querySelector("#dateA").value.trim();
          const b = popup.querySelector("#dateB").value.trim();
          const includeEmpty = popup.querySelector("#dateEmpty").checked;
          if (includeEmpty || a || (mode === "between" && b)) {
            cfg = { type: finalType, mode, a, b, includeEmpty };
          }
        } else if (finalType === "boolean") {
          const t = popup.querySelector("#boolTrue").checked;
          const f = popup.querySelector("#boolFalse").checked;
          const includeEmpty = popup.querySelector("#boolEmpty").checked;
          const values = [];
          if (t) values.push("true");
          if (f) values.push("false");
          if (values.length || includeEmpty)
            cfg = { type: "boolean", values, includeEmpty };
        }

        if (cfg) {
          columnFilters[colIndex] = cfg;
          th.innerHTML = `${th.dataset.originalText} <span style="color:red">*</span>`;
        } else {
          delete columnFilters[colIndex];
          th.textContent = th.dataset.originalText;
        }

        applyFilters();
        popup.style.display = "none";
      });

      // Limpar
      popup.querySelector("#clearFilter").addEventListener("click", () => {
        delete columnFilters[colIndex];
        th.textContent = th.dataset.originalText;
        applyFilters();
        popup.style.display = "none";
      });

      // Ordenar
      popup.querySelector("#sortAlpha").addEventListener("click", function () {
        const newOrder = this.dataset.sort === "asc" ? "desc" : "asc";
        sortStates[colIndex] = newOrder;
        sortTable(colIndex, newOrder);
        this.dataset.sort = newOrder;
        popup.style.display = "none";
      });
    });
  });
}
