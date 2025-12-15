import Swal from "./sweetalert2.esm.all.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
import { Service } from "./service/api.js";
import { q } from "./UI/interface.js";
import { DateTime } from "./utils/time.js";
import { Modal } from "./utils/modal.js";
import { Dom } from "./UI/interface.js";
import { Numbers } from "./utils/number.js";

export function ajustarTamanhoModal() {
  const modalDialog = document.querySelector(".modal-dialog");

  if (window.innerWidth < 1200) {
    modalDialog.classList.remove("modal-xl");
  }

  if (window.innerWidth >= 1200) {
    modalDialog.classList.add("modal-xl");
  }
}

export async function getGroupedData(route, id_element, index_name) {
  const response = await fetch(`/${route}`);

  if (!response.ok) {
    const errText = await response.text();
    console.log(errText);
  } else {
    const data = await response.json();
    const element = document.querySelector(id_element);
    element.innerHTML = '<option value="">-</option>';

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

export async function loadPage(accessKey, page) {
  try {
    const response = await fetch("/checkPermission", {
      credentials: "same-origin", // se for mesmo domínio, prefira same-origin
      cache: "no-store", // Safari às vezes cacheia agressivamente
    });

    if (!response.ok) throw new Error("Não autenticado");

    const permissoes = await response.json();
    const valorPermissao = permissoes?.[accessKey];

    const current = normalizePage(window.location.pathname);
    const targetAllowed = "/" + normalizeFile(page); // ex.: "/previsoes.html"
    const targetDenied = "/erro.html";
    const targetIndex = "/index.html";

    if (typeof valorPermissao === "boolean") {
      if (valorPermissao) {
        if (current !== targetAllowed) location.replace(targetAllowed);
      } else {
        if (current !== targetDenied) location.replace(targetDenied);
      }
    } else {
      if (current !== targetIndex) location.replace(targetIndex);
    }
  } catch (err) {
    console.error("Erro ao verificar permissão:", err);
    const current = normalizePage(window.location.pathname);
    const targetIndex = "/index.html";
    if (current !== targetIndex) location.replace(targetIndex);
  }
}

function normalizePage(pathname) {
  // garante leading slash, e que "/" e "/foo/" virem "/index.html" e "/foo/index.html"
  let p = pathname || "/";
  if (!p.startsWith("/")) p = "/" + p;
  if (p === "/" || p.endsWith("/")) p = p + "index.html";
  return p.toLowerCase();
}

function normalizeFile(file) {
  // só baixa pra comparar sem erros de maiúsculas
  return (file || "").replace(/^\//, "").toLowerCase();
}

export function checkPrevisao(firtItem, secondItem) {
  if (firtItem != secondItem) {
    return "color: rgba(242, 164, 38, 1)";
  }
}

export function applyDateMask(e) {
  const input = e.target;
  input.value = Numbers.dateMask(input.value);
}

export async function getUsuario(id, campo) {
  const response = await fetch(`/getUsuario?p_id=${id}`);
  if (!response.ok) {
    Modal.show("error", "ERRO", "Não foi possivel buscar Usuario");
    return;
  }
  const data = await response.json();
  const nome = data[0].nome;
  document.querySelector(campo).value = nome;
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
      Modal.show("error", "ERRO", "Não foi possivel enviar o E-mail");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error; // Opcional: relançar o erro para ser tratado em outro lugar
  }
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

export async function getName(element) {
  const id = q(element).value;
  const res = await Service.getUser(id);
  return res;
}

export async function confirmDateInsertion(checkbox, element) {
  const response = await Modal.showConfirmation(null, "Preencher data ?");
  if (!response.isConfirmed) return;
  const cb = checkIsTrue(checkbox);
  if (!cb) q(checkbox).checked = false;
  setDateElement(element);
}

function checkIsTrue(checkbox) {
  const cb = q(checkbox);
  if (cb.checked) return true;
  return false;
}

function setDateElement(campoDataHora) {
  const el = q(campoDataHora);
  el.value = DateTime.Now();
}

export async function handleElementsUser(elements) {
  elements.forEach((item) => {
    Dom.addEventBySelector(item[0], "blur", async () =>
      Dom.setValue(item[1], await getName(item[0]))
    );
  });
}
