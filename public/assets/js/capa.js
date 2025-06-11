import { convertDataBr, checkValue, messageInformation } from "./utils.js";

function setInnerText(element, value) {
  document.getElementById(element).innerText = value;
}

function getLocalStorageItem(item) {
  return localStorage.getItem(item);
}

async function fillElements() {
  const ordemdecompra = localStorage.getItem("numoc");

  if (!ordemdecompra || ordemdecompra.trim() === "") {
    console.warn("Ordem de compra inválida ou ausente. Cancelando fetch.");
    return;
  }

  const response = await fetch(
    `/fillElements?p_ordemdecompra=${ordemdecompra}`
  );

  if (!response.ok) {
    const errTExt = await response.text();
    console.error("Erro ao carregar os dados:", errTExt);
  } else {
    const numoc = `${getLocalStorageItem("numoc").slice(
      0,
      8
    )}-${getLocalStorageItem("numoc").slice(-2)}`;

    const data = await response.json();
    data.forEach((element) => {
      setInnerText("lb_contrato", element.p_contrato);
      setInnerText("lb_qproj", element.p_numproj);
      setInnerText("lb_numproj", element.p_numproj.slice(-2));
      setInnerText("lb_cliente", element.p_cliente);
      setInnerText("lb_ambiente", element.p_ambiente);
      setInnerText("lb_vendedor", element.p_vendedor);
      setInnerText("lb_entrega", convertDataBr(element.p_dataentrega));
      setInnerText("lb_liberador", element.p_liberador);
      setInnerText("lb_numoc", numoc);
      setInnerText("lb_responsavel", getLocalStorageItem("resp"));
      setInnerText("lb_data", convertDataBr(getLocalStorageItem("data")));
      setInnerText("lb_tipo", getLocalStorageItem("tipo"));
      setInnerText("lb_urgente", getLocalStorageItem("urgente"));
      colorUrgente(getLocalStorageItem("urgente"));
    });
    fillTableAcessorios(ordemdecompra);
  }
}

async function fillTableAcessorios(ordemdecompra) {
  const response = await fetch(
    `/fillTableAcessorios?p_ordemdecompra=${ordemdecompra}`
  );

  try {
    const data = await response.json();

    const tbody = document.querySelectorAll("table tbody")[0];
    tbody.innerHTML = "";

    data.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
            <td style="font-size: 9px; ">${item.categoria}</td>
            <td style="font-size: 9px;">${item.descricao}</td>
            <td style="font-size: 9px; text-align: center;">${checkValue(
              item.medida
            )}</td>
            <td style="font-size: 9px; text-align: center;">${checkValue(
              item.qtd
            )}</td>
            `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    messageInformation(
      "error",
      "Erro",
      `Não foi possível carregar os dados. ${err.message}`
    );
  }
}

function colorUrgente(value) {
  if (value === "SIM") {
    const element = document.getElementById("lb_urgente");
    element.style.color = "white";
    element.style.background = "red";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  fillElements();
});
