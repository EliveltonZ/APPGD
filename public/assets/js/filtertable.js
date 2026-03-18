export function enableTableFilterSort(tableId) {
  const table = document.getElementById(tableId);
  const columnFilters = {};
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

  function detectType(val) {
    const num = /^-?\d+(?:\.\d{3})*(?:,\d+)?$|^-?\d+(?:\.\d+)?$/; // pt-BR e padrão
    const dateBR = /^\d{2}\/\d{2}\/\d{4}$/;
    const dateISO = /^\d{4}-\d{2}-\d{2}$/;

    const cleaned = val.replace(/\s/g, "");
    if (num.test(cleaned)) return "number";
    if (dateBR.test(val)) return "date-br";
    if (dateISO.test(val)) return "date-iso";
    return "text";
  }

  function getUniqueValues(colIndex) {
    const values = new Set();
    [...table.tBodies[0].rows].forEach((row) => {
      if (row.style.display !== "none") {
        const val = row.cells[colIndex].textContent.trim();
        values.add(val);
      }
    });
    const uniqueArray = Array.from(values);
    const type = detectType(uniqueArray[0] || "");

    uniqueArray.sort((a, b) => {
      let A = a,
        B = b;
      if (type === "number") {
        A = parseFloat(A.replace(/\./g, "").replace(",", ".")) || 0;
        B = parseFloat(B.replace(/\./g, "").replace(",", ".")) || 0;
      } else if (type === "date-br") {
        const [dA, mA, yA] = (A || "").split("/");
        const [dB, mB, yB] = (B || "").split("/");
        A = new Date(`${yA}-${mA}-${dA}`);
        B = new Date(`${yB}-${mB}-${dB}`);
      } else if (type === "date-iso") {
        A = new Date(A);
        B = new Date(B);
      } else {
        A = String(A).toLowerCase();
        B = String(B).toLowerCase();
      }
      return A < B ? -1 : A > B ? 1 : 0;
    });

    return uniqueArray;
  }

  function applyFilters() {
    [...table.tBodies[0].rows].forEach((row) => {
      let visible = true;
      for (const col in columnFilters) {
        const cellValue = row.cells[col].textContent.trim();
        if (!columnFilters[col].includes(cellValue)) {
          visible = false;
          break;
        }
      }
      row.style.display = visible ? "" : "none";
    });
  }

  function sortTable(colIndex, order) {
    const rows = Array.from(table.tBodies[0].rows);
    const type = detectType(rows[0]?.cells[colIndex]?.textContent.trim() || "");

    rows.sort((a, b) => {
      let A = a.cells[colIndex].textContent.trim();
      let B = b.cells[colIndex].textContent.trim();

      if (type === "number") {
        A = parseFloat(A.replace(/\./g, "").replace(",", ".")) || 0;
        B = parseFloat(B.replace(/\./g, "").replace(",", ".")) || 0;
      } else if (type === "date-br") {
        const [dA, mA, yA] = A.split("/");
        const [dB, mB, yB] = B.split("/");
        A = new Date(`${yA}-${mA}-${dA}`);
        B = new Date(`${yB}-${mB}-${dB}`);
      } else if (type === "date-iso") {
        A = new Date(A);
        B = new Date(B);
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

  // Fecha popup ao clicar fora
  document.addEventListener("click", (e) => {
    if (!popup.contains(e.target)) popup.style.display = "none";
  });

  [...table.tHead.rows[0].cells].forEach((th, colIndex) => {
    th.dataset.originalText = th.textContent.trim();

    th.addEventListener("click", (e) => {
      e.stopPropagation();

      const offset = th.getBoundingClientRect();
      const uniqueValues = getUniqueValues(colIndex);
      const currentOrder = sortStates[colIndex] || "asc";

      popup.innerHTML = `
        <div class="card-body p-3">
          <h6 class="card-title mb-2">Filtrar coluna</h6>
          <input type="text" id="searchInput" autocomplete="off" class="form-control form-control-sm mb-3" placeholder="Buscar...">
          <button class="btn btn-sm btn-secondary mb-2 w-100" id="toggleSelectAll">Marcar/Desmarcar Todos</button>
          <div class="overflow-auto mb-3" style="max-height:200px;">
            ${uniqueValues
              .map(
                (val, i) => `
              <div class="form-check">
                <input class="form-check-input filter-checkbox" type="checkbox" data-col="${colIndex}" value="${val}" id="chk_${colIndex}_${i}">
                <label class="form-check-label text-truncate" style="max-width: 380px;" for="chk_${colIndex}_${i}">${val}</label>
              </div>`
              )
              .join("")}
          </div>
          <div class="d-flex gap-2 justify-content-between">
            <button class="btn btn-sm btn-secondary flex-fill" id="sortAlpha" data-sort="${currentOrder}">
              Ordenar ${currentOrder === "asc" ? "↓" : "↑"}
            </button>
            <button class="btn btn-sm btn-primary flex-fill" id="applyFilter">Aplicar</button>
            <button class="btn btn-sm btn-danger flex-fill" id="clearFilter">Limpar</button>
          </div>
        </div>
      `;

      // Posicionamento do popup
      popup.style.visibility = "hidden";
      popup.style.display = "block";
      popup.style.left = "0px";
      const popupRect = popup.getBoundingClientRect();
      const popupWidth = popupRect.width;
      let left = offset.left + window.scrollX;
      let top = offset.bottom + window.scrollY;
      if (left + popupWidth > window.innerWidth) {
        left = window.innerWidth - popupWidth - 15;
      }
      left = Math.max(left, 0);
      popup.style.top = `${top}px`;
      popup.style.left = `${left}px`;
      popup.style.visibility = "";

      // ======= INICIALIZAÇÃO DOS CHECKBOXES =======
      const currentFilter = columnFilters[colIndex]; // array ou undefined
      popup.querySelectorAll(".filter-checkbox").forEach((cb) => {
        // Se houver filtro salvo, marca só os que pertencem ao filtro; caso contrário, todos começam DESMARCADOS
        cb.checked = Array.isArray(currentFilter)
          ? currentFilter.includes(cb.value)
          : false;
      });

      // Utilitários de visibilidade
      const getVisibleCheckboxes = () =>
        [...popup.querySelectorAll(".form-check")]
          .filter((div) => div.style.display !== "none")
          .map((div) => div.querySelector(".filter-checkbox"));

      const toggleBtn = popup.querySelector("#toggleSelectAll");
      function updateToggleLabel() {
        const visibleChecks = getVisibleCheckboxes();
        const allVisibleChecked =
          visibleChecks.length > 0 && visibleChecks.every((cb) => cb.checked);
        toggleBtn.textContent = allVisibleChecked
          ? "Desmarcar Todos (visíveis)"
          : "Marcar Todos (visíveis)";
      }

      const searchInput = popup.querySelector("#searchInput");
      searchInput.addEventListener("input", function () {
        const val = this.value.toLowerCase();
        popup.querySelectorAll(".form-check").forEach((div) => {
          const label = div.querySelector("label").textContent.toLowerCase();
          div.style.display = label.includes(val) ? "" : "none";
        });
        updateToggleLabel();
      });

      // Toggle apenas itens visíveis
      toggleBtn.addEventListener("click", () => {
        const visibleChecks = getVisibleCheckboxes();
        const allVisibleChecked =
          visibleChecks.length > 0 && visibleChecks.every((cb) => cb.checked);
        visibleChecks.forEach((cb) => (cb.checked = !allVisibleChecked));
        updateToggleLabel();
      });

      // Aplicar filtro
      popup.querySelector("#applyFilter").addEventListener("click", () => {
        const selected = [...popup.querySelectorAll(".filter-checkbox")]
          .filter((cb) => cb.checked)
          .map((cb) => cb.value);

        if (selected.length > 0) {
          columnFilters[colIndex] = selected;
          th.innerHTML = `${th.dataset.originalText} <span style="color:red">*</span>`;
        } else {
          delete columnFilters[colIndex];
          th.textContent = th.dataset.originalText;
        }

        applyFilters();
        popup.style.display = "none";
      });

      // Limpar filtro
      popup.querySelector("#clearFilter").addEventListener("click", () => {
        delete columnFilters[colIndex];
        th.textContent = th.dataset.originalText;
        applyFilters();
        popup.style.display = "none";
      });

      // Ordenação
      popup.querySelector("#sortAlpha").addEventListener("click", function () {
        const newOrder = this.dataset.sort === "asc" ? "desc" : "asc";
        sortStates[colIndex] = newOrder;
        sortTable(colIndex, newOrder);
        this.dataset.sort = newOrder;
        popup.style.display = "none";
      });

      // Inicializa rótulo com estado atual (todos desmarcados por padrão)
      updateToggleLabel();
    });
  });
}
