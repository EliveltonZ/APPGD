import { convertDataBr, checkValue, messageInformation, Dom } from "./utils.js";

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
  Dom.setInnerText("lb_contrato", data.p_contrato);
  Dom.setInnerText("lb_qproj", Number(data.p_numproj.slice(-2)));
  Dom.setInnerText("lb_numproj", data.p_numproj);
  Dom.setInnerText("lb_cliente", data.p_cliente);
  Dom.setInnerText("lb_ambiente", data.p_ambiente);
  Dom.setInnerText("lb_vendedor", data.p_vendedor);
  Dom.setInnerText("lb_dataentrega", convertDataBr(data.p_dataentrega));
  Dom.setInnerText("lb_entrega", convertDataBr(data.p_entrega));
  Dom.setInnerText("lb_pronto", convertDataBr(data.p_pronto));
  Dom.setInnerText("lb_liberador", data.p_liberador);
  Dom.setInnerText("lb_numoc", numoc);
  Dom.setInnerText("lb_observacoes", data.p_observacoes);
  Dom.setInnerText("lb_corte", data.p_codcc);
  Dom.setInnerText("lb_lote", data.p_lote);
  Dom.setInnerText("lb_pedido", data.p_pedido);
  colorUrgente(getLocalStorageItem("urgente"));

  Dom.setInnerText("lb_corte_inicio", convertDataBr(data.p_corteinicio));
  Dom.setInnerText("lb_corte_fim", convertDataBr(data.p_cortefim));
  Dom.setInnerText("lb_corte_resp", data.p_corte_resp);
  Dom.setInnerText("lb_pausa_corte", checkBoolean(data.p_cortepausa));

  Dom.setInnerText(
    "lb_customizacao_inicio",
    convertDataBr(data.p_customizacaoinicio)
  );
  Dom.setInnerText(
    "lb_customizacao_fim",
    convertDataBr(data.p_customizacaofim)
  );
  Dom.setInnerText("lb_custom_resp", data.p_customizacao_resp);
  Dom.setInnerText("lb_pausa_custom", checkBoolean(data.p_customizacaopausa));

  Dom.setInnerText(
    "lb_coladeira_inicio",
    convertDataBr(data.p_coladeirainicio)
  );
  Dom.setInnerText("lb_coladeira_fim", convertDataBr(data.p_coladeirafim));
  Dom.setInnerText("lb_coladeira_resp", data.p_coladeira_resp);
  Dom.setInnerText("lb_pausa_coladeira", checkBoolean(data.p_coladeirapausa));

  Dom.setInnerText("lb_usinagem_inicio", convertDataBr(data.p_usinageminicio));
  Dom.setInnerText("lb_usinagem_fim", convertDataBr(data.p_usinagemfim));
  Dom.setInnerText("lb_usinagem_resp", data.p_usinagem_resp);
  Dom.setInnerText("lb_pausa_usinagem", checkBoolean(data.p_usinagempausa));

  Dom.setInnerText("lb_paineis_inicio", convertDataBr(data.p_paineisinicio));
  Dom.setInnerText("lb_paineis_fim", convertDataBr(data.p_paineisfim));
  Dom.setInnerText("lb_paineis_resp", data.p_paineis_resp);
  Dom.setInnerText("lb_pausa_paineis", checkBoolean(data.p_paineispausa));

  Dom.setInnerText("lb_montagem_inicio", convertDataBr(data.p_montageminicio));
  Dom.setInnerText("lb_montagem_fim", convertDataBr(data.p_montagemfim));
  Dom.setInnerText("lb_montagem_resp", data.p_montagem_resp);
  Dom.setInnerText("lb_pausa_montagem", checkBoolean(data.p_montagempausa));

  Dom.setInnerText(
    "lb_acabamento_inicio",
    convertDataBr(data.p_acabamentoinicio)
  );
  Dom.setInnerText("lb_acabamento_fim", convertDataBr(data.p_acabamentofim));
  Dom.setInnerText("lb_acabamento_resp", data.p_acabamento_resp);
  Dom.setInnerText("lb_pausa_acabamento", checkBoolean(data.p_acabamentopausa));

  Dom.setInnerText(
    "lb_embalagem_inicio",
    convertDataBr(data.p_embalageminicio)
  );
  Dom.setInnerText("lb_embalagem_fim", convertDataBr(data.p_embalagemfim));
  Dom.setInnerText("lb_embalagem_resp", data.p_embalagem_resp);
  Dom.setInnerText("lb_pausa_embalagem", checkBoolean(data.p_embalagempausa));

  Dom.setInnerText("lb_responsavel", getLocalStorageItem("resp"));
  Dom.setInnerText("lb_data", convertDataBr(getLocalStorageItem("data")));
  Dom.setInnerText("lb_tipo", getLocalStorageItem("tipo"));
  Dom.setInnerText("lb_urgente", getLocalStorageItem("urgente"));

  Dom.setInnerText("lb_avulsoq", data.p_avulsoq);
  Dom.setInnerText("lb_avulsol", data.p_avulsol);

  Dom.setInnerText("lb_paineisq", data.p_paineisq);
  Dom.setInnerText("lb_paineisl", data.p_paineisl);

  Dom.setInnerText("lb_portaaluminioq", data.p_portaaluminioq);
  Dom.setInnerText("lb_portaaluminiol", data.p_portaaluminiol);

  Dom.setInnerText("lb_vidrosq", data.p_vidrosq);
  Dom.setInnerText("lb_vidrosl", data.p_vidrosl);

  Dom.setInnerText("lb_pecaspintadasq", data.p_pecaspintadasq);
  Dom.setInnerText("lb_pecaspintadasl", data.p_pecaspintadasl);

  Dom.setInnerText("lb_tapecariaq", data.p_tapecariaq);
  Dom.setInnerText("lb_tapecarial", data.p_tapecarial);

  Dom.setInnerText("lb_serralheriaq", data.p_serralheriaq);
  Dom.setInnerText("lb_serralherial", data.p_serralherial);

  Dom.setInnerText("lb_cabideq", data.p_cabideq);
  Dom.setInnerText("lb_cabidel", data.p_cabidel);

  Dom.setInnerText("lb_trilhoq", data.p_trilhoq);
  Dom.setInnerText("lb_trilhol", data.p_trilhol);

  Dom.setInnerText("lb_modulosq", data.p_modulosq);
  Dom.setInnerText("lb_modulosl", data.p_modulosl);

  Dom.setInnerText("lb_motorista", data.p_motorista_resp);
  Dom.setInnerText("lb_conferido", data.p_conferido_resp);

  Dom.setInnerText("lb_totalvolumes", data.p_totalvolumes);
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
