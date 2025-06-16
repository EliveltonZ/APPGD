import Swal from "./sweetalert2.esm.all.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";

export function setData(elememt) {
  var campoDataHora = document.getElementById(elememt);
  var dataAtual = new Date();
  var ano = dataAtual.getFullYear();
  var mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
  var dia = String(dataAtual.getDate()).padStart(2, "0");
  var dataHoraFormatada = `${ano}-${mes}-${dia}`;
  campoDataHora.value = dataHoraFormatada;
}

export function getText(element) {
  let value = document.getElementById(element).value.toUpperCase();
  return value === "" ? null : value;
}

export function setText(element, value) {
  document.getElementById(element).value = value;
}

export function getChecked(element) {
  let value = document.getElementById(element).checked;
  return value === "" ? null : value;
}

export function setChecked(element, boolean) {
  document.getElementById(element).checked = boolean;
}

export function formatValueDecimal(valorInput) {
  const valorFormatado = valorInput.replace(/[^0-9,]/g, "");
  const resultado = valorFormatado.replace(",", ".");
  return resultado;
}

export function changeFormatCurrency(e) {
  let r = e.value.replace(/\D/g, "");
  (r = (r / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })),
    (e.value = r);
}

export function formatCurrency(valor) {
  if (valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  } else {
    valor = 0;
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
}

export function setFocus(elememt) {
  document.getElementById(elememt).focus();
}

export function getValue(element) {
  const value = document.getElementById(element).value.toUpperCase();
  return value;
}

export function checkValue(value) {
  if (value) {
    return value;
  } else {
    return "-";
  }
}

export function convertDataBr(date) {
  if (date == "-") {
    return "-";
  } else {
    const parse_date = date.split("-");
    const format_date = `${parse_date[2]}/${parse_date[1]}/${parse_date[0]}`;
    return format_date;
  }
}

export function convertDataISO(date) {
  if (date == "-") {
    return "-";
  } else {
    const parse_date = date.split("/");
    const format_date = `${parse_date[2]}-${parse_date[1]}-${parse_date[0]}`;
    return format_date;
  }
}

export function ajustarTamanhoModal() {
  const modalDialog = document.querySelector(".modal-dialog");

  if (window.innerWidth < 1200) {
    modalDialog.classList.remove("modal-xl");
  }

  if (window.innerWidth >= 1200) {
    modalDialog.classList.add("modal-xl");
  }
}

export function getFirstColumnValue(td, index) {
  const row = td.parentNode;
  return row.cells[index].innerText;
}

export function getColumnValue(td, columIndex) {
  const row = td.parentNode;
  const value = row.cells[columIndex].innerText;
  if (value === "-") {
    return "";
  } else {
    return value;
  }
}

export async function getGroupedData(route, id_element, index_name) {
  const response = await fetch(`/${route}`);

  if (!response.ok) {
    const errText = await response.text();
    console.log(errText);
  } else {
    const data = await response.json();
    const element = document.getElementById(id_element);
    element.innerHTML = '<option value="-">-</option>';

    data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item[index_name];
      option.textContent = item[index_name];
      element.appendChild(option);
    });
  }
}

function setUpperCase(input) {
  input.value = input.value.toUpperCase();
}

export function allUpperCase() {
  document.querySelectorAll('input[type="text"]').forEach((input) => {
    input.addEventListener("input", function () {
      setUpperCase(input);
    });
  });
}

export function clearInputFields() {
  document.querySelectorAll('input[type="text"]').forEach((input) => {
    input.value = "";
  });

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });

  document.querySelectorAll("Select").forEach((input) => {
    input.value = "";
  });

  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.value = "";
  });
}

export function onmouseover(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.warn(`Tabela com ID "${tableId}" não encontrada.`);
    return;
  }

  table.addEventListener("mouseover", (event) => {
    if (event.target.tagName === "TD") {
      event.target.parentElement.classList.add("table-hover-row");
    }
  });

  table.addEventListener("mouseout", (event) => {
    if (event.target.tagName === "TD") {
      event.target.parentElement.classList.remove("table-hover-row");
    }
  });
}

export function onclickHighlightRow(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.warn(`Tabela com ID "${tableId}" não encontrada.`);
    return;
  }

  let selectedRow = null;

  table.addEventListener("click", (event) => {
    if (event.target.tagName === "TD") {
      var clickedRow = event.target.parentElement;

      if (selectedRow && selectedRow !== clickedRow) {
        selectedRow.classList.remove("table-click-row");
      }

      if (selectedRow !== clickedRow) {
        clickedRow.classList.add("table-click-row");
        selectedRow = clickedRow;
      } else {
        clickedRow.classList.remove("table-click-row");
        selectedRow = null;
      }
    } else {
    }
  });
}

export function createModal(modal) {
  const modalEl = document.getElementById(modal);
  const _modal = new bootstrap.Modal(modalEl);
  _modal.show();
}

export async function loadPage(accessKey, page) {
  try {
    const response = await fetch("/checkPermission", {
      credentials: "include",
    });

    if (!response.ok) throw new Error("Não autenticado");

    const permissoes = await response.json();
    const temAcesso = Boolean(permissoes[accessKey]);
    const currentPage = window.location.pathname.split("/").pop();

    if (temAcesso && currentPage !== page) {
      window.location.href = `/${page}`;
    } else if (!temAcesso && currentPage !== "error.html") {
      window.location.href = "error.html";
    }
  } catch (err) {
    console.error("Erro ao verificar permissão:", err);
    window.location.href = "index.html";
  }
}

export function convertDecimal(num) {
  if (num) {
    return `${parseFloat(num.toFixed(2))}%`;
  } else {
    num = 0;
    return `${parseFloat(num.toFixed(2))}%`;
  }
}

export function setDateTime(checkbox, text) {
  var campoDataHora = document.getElementById(text);
  const element = document.querySelector(checkbox);
  if (element.checked) {
    Swal.fire({
      icon: "question",
      confirmButtonText: "Sim",
      showDenyButton: true,
      text: "Preencher data automaticamente ?",
      denyButtonText: "Não",
    }).then((result) => {
      if (result.isConfirmed) {
        var dataAtual = new Date();
        var ano = dataAtual.getFullYear();
        var mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
        var dia = String(dataAtual.getDate()).padStart(2, "0");
        var hora = String(dataAtual.getHours()).padStart(2, "0");
        var minuto = String(dataAtual.getMinutes()).padStart(2, "0");
        var dataHoraFormatada = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
        campoDataHora.value = dataHoraFormatada;
      } else {
        document.getElementById(element.id).checked = false;
      }
    });
  }
}

export function setDate(checkbox, text) {
  var campoDataHora = document.getElementById(text);
  const element = document.querySelector(checkbox);
  if (element.checked) {
    Swal.fire({
      icon: "question",
      confirmButtonText: "Sim",
      showDenyButton: true,
      text: "Preencher data automaticamente ?",
      denyButtonText: "Não",
    }).then((result) => {
      if (result.isConfirmed) {
        var dataAtual = new Date();
        var ano = dataAtual.getFullYear();
        var mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
        var dia = String(dataAtual.getDate()).padStart(2, "0");
        var dataHoraFormatada = `${ano}-${mes}-${dia}`;
        campoDataHora.value = dataHoraFormatada;
      } else {
        document.getElementById(element.id).checked = false;
      }
    });
  }
}

export function enableEnterAsTab() {
  const inputs = document.querySelectorAll("input, select, textarea, button");
  inputs.forEach((input) => {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();

        if (input.tagName === "BUTTON") {
          input.click();
          return;
        }

        let index = Array.from(inputs).indexOf(input);
        let nextElement = inputs[index + 1];

        while (nextElement && nextElement.disabled) {
          index++;
          nextElement = inputs[index + 1];
        }

        if (nextElement) {
          nextElement.focus();
        }
      }
    });
  });
}

export function colorStatus(item) {
  if (item === "ATRASADO") {
    return "color: red;";
  } else if (item === "INICIADO") {
    return "color:rgb(233, 221, 0)";
  } else if (item === "A VENCER") {
    return "color: rgb(226, 109, 0)";
  } else if (item === "PENDENCIA") {
    return "color:rgb(186, 2, 227)";
  } else if (item === "URGENTE") {
    return "color: rgb(40, 114, 224)";
  } else if (item === "PRONTO" || item === "OK") {
    return "color: rgb(70, 136, 0)";
  } else if (item === "ENTREGUE") {
    return "color: rgb(93, 90, 245)";
  }
}

export function colorAcessorios(item) {
  if (item > 0) {
    return "color:rgb(255, 242, 0)";
  } else {
    return "color: rgb(70, 136, 0)";
  }
}

export function messageInformation(icon, title, message) {
  const dialog = Swal.fire({
    icon: icon,
    title: title,
    text: message,
  });
  return dialog;
}

export async function messageQuestion(
  title,
  message,
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar"
) {
  const result = await Swal.fire({
    icon: "question",
    title: title,
    text: message,
    showDenyButton: true,
    denyButtonText: cancelButtonText,
    confirmButtonText: confirmButtonText,
  });
  return result;
}

export function exportarParaExcel(
  data,
  nomeArquivo = "Projetos.xlsx",
  nomeAba = "ConPlanejamentoProd"
) {
  if (!Array.isArray(data) || data.length === 0) {
    Swal.fire({
      icon: "error",
      text: "Não foi retornado dados ou filtros invalidos.",
    });
    return;
  }
  const planilha = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, planilha, nomeAba);
  XLSX.writeFile(workbook, nomeArquivo);
}

export function modalBarCode() {
  const width = 80;
  const height = 30;

  Swal.fire({
    html: `
         <style>
          .swal2-popup.full-modal {
            width: 100% !important;
            height: 90vh !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
            overflow: hidden
          }
  
          #swal2-html-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
  
          .drawingBuffer{
          display: none;
          }
  
        </style>
        <div id="camera-popup" style="
          width: 100%;
          max-width: 100%;
          height: 80vh;
          margin: 0;
          padding: 0;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        ">
          <!-- Overlay para alinhar o código de barras -->
          <div id="overlay-frame" style="
            position: absolute;
            width: ${width}%;
            height: ${height}%;
            border: 3px dashed rgb(243, 247, 0);
            box-sizing: border-box;
            z-index: 10;
          "></div>
        </div>
      `,
    customClass: {
      popup: "full-modal",
    },
    showConfirmButton: false,
    showCloseButton: true,
    backdrop: false,
    allowOutsideClick: false,
    didOpen: () => {
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.getElementById("camera-popup"),
            constraints: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
              advanced: [{ focusMode: "continuous" }],
            },
            area: {
              top: `${limitRead(height)}%`,
              right: `${limitRead(width)}%`,
              left: `${limitRead(width)}%`,
              bottom: `${limitRead(height)}%`,
            },
          },
          locator: {
            patchSize: "large",
            halfSample: false,
          },
          locate: true,
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader",
              "upc_reader",
              "upc_e_reader",
              "code_39_reader",
              "code_93_reader",
            ],
          },
        },
        (err) => {
          if (err) {
            console.error("Erro ao iniciar Quagga:", err);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected((data) => {
        const codigo = data.codeResult.code;

        const regexPadrao = /^(?:\d{6}|\d{9})$/;
        if (!regexPadrao.test(codigo)) {
          alert(`Código de barras invalido`);
          return;
        }

        alert(`Código lido: ${codigo}`);
        Swal.close();
        Quagga.stop();
        Quagga.offDetected();

        document.getElementById(
          "codigoLido"
        ).textContent = `Código Lido: ${codigo}`;
      });
    },
    willClose: () => {
      Quagga.stop();
      Quagga.offDetected();
    },
  });
}

function limitRead(value) {
  return (100 - value) / 2;
}

export function addEventBySelector(element, event, _function) {
  const el = document.querySelector(element);
  if (el) {
    el.addEventListener(event, _function);
  } else {
    console.warn(`Elemento com Selector "${element}" não encontrado.`);
  }
}

export function criarSpinnerGlobal() {
  // Verifica se o spinner já foi criado
  if (document.getElementById("spinner-global")) return;

  const spinnerDiv = document.createElement("div");
  spinnerDiv.id = "spinner-global";
  spinnerDiv.style.cssText = `
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    padding: 10px;
  `;

  const loader = document.createElement("div");
  loader.style.cssText = `
    border: 6px solid #eee;
    border-top: 6px solid #333;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  `;

  spinnerDiv.appendChild(loader);
  document.body.appendChild(spinnerDiv);

  if (!document.getElementById("spinner-style")) {
    const style = document.createElement("style");
    style.id = "spinner-style";
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Define URLs que não devem exibir o spinner
const urlsIgnoradas = ["/fillElements", "/fillTableAcessorios"];

// Verifica se a URL deve ou não exibir o spinner
function deveMostrarSpinner(url) {
  return !urlsIgnoradas.some((ignorada) => url.includes(ignorada));
}

// Substitui o fetch global com controle de spinner
(function () {
  criarSpinnerGlobal();

  const originalFetch = window.fetch;

  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : input.url;
    const mostrarSpinner = deveMostrarSpinner(url);
    const spinner = document.getElementById("spinner-global");

    if (mostrarSpinner && spinner) spinner.style.display = "block";

    try {
      const response = await originalFetch(input, init);
      return response;
    } catch (error) {
      alert("Erro de conexão. Verifique sua internet ou o servidor.");
      throw error;
    } finally {
      if (mostrarSpinner && spinner) spinner.style.display = "none";
    }
  };
})();
