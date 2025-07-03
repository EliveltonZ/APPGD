import { convertDataBr, checkValue, messageInformation } from "./utils.js";

function setInnerText(element, value) {
  document.getElementById(element).innerText = value;
}

function getLocalStorageItem(item) {
  return localStorage.getItem(item);
}

function colorUrgente(value) {
  if (value === "SIM") {
    const div = document.getElementById("div_urgente");
    div.style.background = "red";
    const label = document.getElementById("lb_urgente");
    label.style.color = "white";
  }
}

function checkBoolean(value) {
  if (value == true) {
    return "SIM";
  }
  return "NÃO";
}

function fillElements(ordemdecompra) {
  const data = JSON.parse(localStorage.getItem("project"));
  const numoc = `${ordemdecompra.slice(0, 8)}-${ordemdecompra.slice(-2)}`;
  setInnerText("lb_contrato", data.p_contrato);
  setInnerText("lb_qproj", Number(data.p_numproj.slice(-2)));
  setInnerText("lb_numproj", data.p_numproj);
  setInnerText("lb_cliente", data.p_cliente);
  setInnerText("lb_ambiente", data.p_ambiente);
  setInnerText("lb_vendedor", data.p_vendedor);
  setInnerText("lb_dataentrega", convertDataBr(data.p_dataentrega));
  setInnerText("lb_entrega", convertDataBr(data.p_entrega));
  setInnerText("lb_pronto", convertDataBr(data.p_pronto));
  setInnerText("lb_liberador", data.p_liberador);
  setInnerText("lb_numoc", numoc);
  setInnerText("lb_observacoes", data.p_observacoes);
  setInnerText("lb_corte", data.p_codcc);
  setInnerText("lb_lote", data.p_lote);
  setInnerText("lb_pedido", data.p_pedido);
  colorUrgente(getLocalStorageItem("urgente"));

  setInnerText("lb_corte_inicio", convertDataBr(data.p_corteinicio));
  setInnerText("lb_corte_fim", convertDataBr(data.p_cortefim));
  setInnerText("lb_corte_resp", data.p_corte_resp);
  setInnerText("lb_pausa_corte", checkBoolean(data.p_cortepausa));

  setInnerText(
    "lb_customizacao_inicio",
    convertDataBr(data.p_customizacaoinicio)
  );
  setInnerText("lb_customizacao_fim", convertDataBr(data.p_customizacaofim));
  setInnerText("lb_custom_resp", data.p_customizacao_resp);
  setInnerText("lb_pausa_custom", checkBoolean(data.p_customizacaopausa));

  setInnerText("lb_coladeira_inicio", convertDataBr(data.p_coladeirainicio));
  setInnerText("lb_coladeira_fim", convertDataBr(data.p_coladeirafim));
  setInnerText("lb_coladeira_resp", data.p_coladeira_resp);
  setInnerText("lb_pausa_coladeira", checkBoolean(data.p_coladeirapausa));

  setInnerText("lb_usinagem_inicio", convertDataBr(data.p_usinageminicio));
  setInnerText("lb_usinagem_fim", convertDataBr(data.p_usinagemfim));
  setInnerText("lb_usinagem_resp", data.p_usinagem_resp);
  setInnerText("lb_pausa_usinagem", checkBoolean(data.p_usinagempausa));

  setInnerText("lb_paineis_inicio", convertDataBr(data.p_paineisinicio));
  setInnerText("lb_paineis_fim", convertDataBr(data.p_paineisfim));
  setInnerText("lb_paineis_resp", data.p_paineis_resp);
  setInnerText("lb_pausa_paineis", checkBoolean(data.p_paineispausa));

  setInnerText("lb_montagem_inicio", convertDataBr(data.p_montageminicio));
  setInnerText("lb_montagem_fim", convertDataBr(data.p_montagemfim));
  setInnerText("lb_montagem_resp", data.p_montagem_resp);
  setInnerText("lb_pausa_montagem", checkBoolean(data.p_montagempausa));

  setInnerText("lb_embalagem_inicio", convertDataBr(data.p_embalageminicio));
  setInnerText("lb_embalagem_fim", convertDataBr(data.p_embalagemfim));
  setInnerText("lb_embalagem_resp", data.p_embalagem_resp);
  setInnerText("lb_pausa_embalagem", checkBoolean(data.p_embalagempausa));

  setInnerText("lb_responsavel", getLocalStorageItem("resp"));
  setInnerText("lb_data", convertDataBr(getLocalStorageItem("data")));
  setInnerText("lb_tipo", getLocalStorageItem("tipo"));
  setInnerText("lb_urgente", getLocalStorageItem("urgente"));

  setInnerText("lb_avulsoq", data.p_avulsoq);
  setInnerText("lb_avulsol", data.p_avulsol);

  setInnerText("lb_paineisq", data.p_paineisq);
  setInnerText("lb_paineisl", data.p_paineisl);

  setInnerText("lb_portaaluminioq", data.p_portaaluminioq);
  setInnerText("lb_portaaluminiol", data.p_portaaluminiol);

  setInnerText("lb_vidrosq", data.p_vidrosq);
  setInnerText("lb_vidrosl", data.p_vidrosl);

  setInnerText("lb_pecaspintadasq", data.p_pecaspintadasq);
  setInnerText("lb_pecaspintadasl", data.p_pecaspintadasl);

  setInnerText("lb_tapecariaq", data.p_tapecariaq);
  setInnerText("lb_tapecarial", data.p_tapecarial);

  setInnerText("lb_serralheriaq", data.p_serralheriaq);
  setInnerText("lb_serralherial", data.p_serralherial);

  setInnerText("lb_cabideq", data.p_cabideq);
  setInnerText("lb_cabidel", data.p_cabidel);

  setInnerText("lb_trilhoq", data.p_trilhoq);
  setInnerText("lb_trilhol", data.p_trilhol);

  setInnerText("lb_modulosq", data.p_modulosq);
  setInnerText("lb_modulosl", data.p_modulosl);

  setInnerText("lb_motorista", data.p_motorista_resp);
  setInnerText("lb_conferido", data.p_conferido_resp);

  setInnerText("lb_totalvolumes", data.p_totalvolumes);
}

function fillTableAcessorios(ordemdecompra) {
  try {
    const data = JSON.parse(localStorage.getItem("acessorios"));
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

function loadData() {
  const ordemdecompra = localStorage.getItem("numoc");
  fillElements(ordemdecompra);
  // fillTableAcessorios(ordemdecompra);
}

document.addEventListener("DOMContentLoaded", (event) => {
  loadData();
});
