import Swal from "./sweetalert2.esm.all.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";

export class Dom {
  static getValue(element) {
    const value = document.getElementById(element).value.toUpperCase();
    return value === "" ? null : value;
  }

  static setValue(element, value) {
    document.getElementById(element).value = value;
  }

  static setInnerHtml(element, value) {
    document.getElementById(element).innerHTML = value;
  }

  static getChecked(element) {
    let value = document.getElementById(element).checked;
    return value === "" ? null : value;
  }

  static setChecked(element, boolean) {
    document.getElementById(element).checked = boolean;
  }

  static setFocus(elememt) {
    document.getElementById(elememt).focus();
  }

  static setData(elememt) {
    var campoDataHora = document.getElementById(elememt);
    var dataAtual = new Date();
    var ano = dataAtual.getFullYear();
    var mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    var dia = String(dataAtual.getDate()).padStart(2, "0");
    var dataHoraFormatada = `${ano}-${mes}-${dia}`;
    campoDataHora.value = dataHoraFormatada;
  }

  static clearInputFields(exceptionsIds = []) {
    // Seleciona todos os campos de entrada, incluindo text, checkbox, select e date
    const allFields = document.querySelectorAll(
      'input[type="text"], input[type="checkbox"], select, input[type="date"]'
    );

    allFields.forEach((field) => {
      // Verificar se o campo não está na lista de exceções pelos IDs
      if (!exceptionsIds.includes(field.id)) {
        if (field.type === "text") {
          field.value = "";
        } else if (field.type === "checkbox") {
          field.checked = false;
        } else if (field.tagName.toLowerCase() === "select") {
          field.value = "";
        } else if (field.type === "date") {
          field.value = "";
        }
      }
    });
  }

  static addEventBySelector(element, event, _function) {
    const elements = document.querySelectorAll(element);
    if (elements.length) {
      elements.forEach((el) => {
        el.addEventListener(event, _function);
      });
    } else {
      console.warn(
        `Nenhum elemento com o seletor "${element}" foi encontrado.`
      );
    }
  }

  static handleClass(element, nameClass, type) {
    // Obtém o elemento pelo ID
    const item = document.getElementById(element);

    // Verifica se o item existe
    if (!item) {
      console.error(`Elemento com ID "${element}" não encontrado.`);
      return;
    }

    // Verifica se o nome da classe é válido
    if (!nameClass || typeof nameClass !== "string") {
      console.error("O nome da classe não é válido.");
      return;
    }

    // Verifica o tipo de operação e executa
    if (type.toLowerCase() === "add") {
      item.classList.add(nameClass);
      return;
    }
    if (type.toLowerCase() === "remove") {
      item.classList.remove(nameClass);
      return;
    }

    // Caso o tipo não seja reconhecido
    console.error(`Tipo de operação "${type}" não identificado.`);
  }

  static allUpperCase() {
    document.querySelectorAll('input[type="text"]').forEach((input) => {
      input.addEventListener("input", function () {
        setUpperCase(input);
      });
    });
  }
}

export function formatValueDecimal(valorInput) {
  if (valorInput) {
    const valorFormatado = valorInput.replace(/[^0-9,]/g, "");
    const resultado = valorFormatado.replace(",", ".");
    return resultado;
  } else {
    return 0;
  }
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

export function checkValue(value) {
  if (value) {
    return value;
  } else {
    return "-";
  }
}

export function convertDataBr(date) {
  if (date === "-" || !date) {
    return "-";
  }

  const [data, hora] = date.split("T");
  const [ano, mes, dia] = data.split("-");

  let dataFormatada = `${dia}/${mes}/${ano}`;
  if (hora) {
    dataFormatada += ` ${hora}`;
  }
  return dataFormatada;
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

export function clearInputFields(exceptionsIds = []) {
  // Seleciona todos os campos de entrada, incluindo text, checkbox, select e date
  const allFields = document.querySelectorAll(
    'input[type="text"], input[type="checkbox"], select, input[type="date"]'
  );

  allFields.forEach((field) => {
    // Verificar se o campo não está na lista de exceções pelos IDs
    if (!exceptionsIds.includes(field.id)) {
      if (field.type === "text") {
        field.value = "";
      } else if (field.type === "checkbox") {
        field.checked = false;
      } else if (field.tagName.toLowerCase() === "select") {
        field.value = "";
      } else if (field.type === "date") {
        field.value = "";
      }
    }
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
    window.location.href = "error.html";
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

export function dateTimeNow() {
  var dataAtual = new Date();
  var ano = dataAtual.getFullYear();
  var mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
  var dia = String(dataAtual.getDate()).padStart(2, "0");
  var hora = String(dataAtual.getHours()).padStart(2, "0");
  var minuto = String(dataAtual.getMinutes()).padStart(2, "0");
  var dataHoraFormatada = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
  return dataHoraFormatada;
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
  const colors = {
    ATRASADO: "color: rgb(255, 0, 0)",
    INICIADO: "color: rgb(194, 184, 6)",
    "A VENCER": "color: rgb(226, 109, 0)",
    PENDENCIA: "color: rgb(186, 2, 227)",
    URGENTE: "color: rgb(59, 186, 255)",
    PRONTO: "color: rgb(81, 154, 2)",
    ENTREGUE: "color: rgb(93, 90, 245)",
    PARCEADO: "color: rgb(2, 188, 188)",
  };

  return colors[item] || "";
}

export function checkPrevisao(firtItem, secondItem) {
  if (firtItem != secondItem) {
    return "color: rgba(242, 164, 38, 1)";
  }
}

export function colorAcessorios(item) {
  if (item > 0) {
    return "color:rgb(255, 242, 0)";
  } else {
    return "color: rgb(70, 136, 0)";
  }
}

export function applyDateMask(event) {
  let input = event.target;
  let value = input.value.replace(/\D/g, ""); // Remove qualquer caractere não numérico

  // Aplica a máscara MM/YY
  if (value.length <= 2) {
    input.value = value.replace(/(\d{2})/, "$1");
  } else if (value.length <= 4) {
    input.value = value.replace(/(\d{2})(\d{2})/, "$1/$2");
  } else {
    input.value = value.substring(0, 4).replace(/(\d{2})(\d{2})/, "$1/$2");
  }
}

export function messageInformation(icon, title, message) {
  const dialog = Swal.fire({
    icon: icon,
    title: title,
    html: message,
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
    html: message,
    showDenyButton: true,
    denyButtonText: cancelButtonText,
    confirmButtonText: confirmButtonText,
  });
  return result;
}

export async function getUsuario(id, campo) {
  const response = await fetch(`/getUsuario?p_id=${id}`);
  if (!response.ok) {
    messageInformation("error", "ERRO", "Não foi possivel buscar Usuario");
    return;
  }
  const data = await response.json();
  const nome = data[0].nome;
  document.getElementById(campo).value = nome;
}

export async function getOperadores() {
  const response = await fetch("/getOperadores");
  const data = await response.json();
  return data;
}

export async function getConfig(params) {
  const response = await fetch(`/getDate?p_id=${params}`);
  const data = await response.json();
  return data;
}

export async function setConfig(params) {
  const response = await fetch("/setDate", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function getCookie(key) {
  const response = await fetch("/checkPermission", {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Não autenticado");

  const cookie = await response.json();
  return cookie[key];
}

export async function sendMail(data) {
  try {
    const response = await fetch("/sendMail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      messageInformation("error", "ERRO", "Não foi possivel enviar o E-mail");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error; // Opcional: relançar o erro para ser tratado em outro lugar
  }
}

export function getIndexColumnValue(td, index) {
  const row = td.parentNode;
  return row.cells[index].innerText;
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

export async function modalBarCode() {
  const width = 80;
  const height = 30;

  return await new Promise((resolve, reject) => {
    Swal.fire({
      html: `
        <style>
          .swal2-popup.full-modal {
            width: 100% !important;
            height: 90vh !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
            overflow: hidden;
          }

          #swal2-html-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .drawingBuffer {
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
              reject(err);
              return;
            }
            Quagga.start();
          }
        );

        Quagga.onDetected((data) => {
          const codigo = data.codeResult.code;

          const regexPadrao = /^(?:\d{6}|\d{9})$/;
          if (!regexPadrao.test(codigo)) {
            alert("Código de barras inválido");
            return;
          }

          Swal.close();
          Quagga.stop();
          Quagga.offDetected();

          resolve(codigo);
        });
      },
      willClose: () => {
        Quagga.stop();
        Quagga.offDetected();
      },
    });
  });
}

function limitRead(value) {
  return (100 - value) / 2;
}

export function criarSpinnerGlobal() {
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

const urlsIgnoradas = ["/fillElements", "/fillTableAcessorios", "/sendMail"];

function deveMostrarSpinner(url) {
  return !urlsIgnoradas.some((ignorada) => url.includes(ignorada));
}

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

export function detectarDispositivo() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "iOS";
  }

  if (/Win/.test(userAgent)) {
    return "Windows";
  }

  if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
    return "MacOS";
  }

  if (/Linux/.test(userAgent)) {
    return "Linux";
  }

  return "Desconhecido";
}
