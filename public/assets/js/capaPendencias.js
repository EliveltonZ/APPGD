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
  Dom.setInnerHtml("lb_contrato", data.p_contrato);
  Dom.setInnerHtml("lb_qproj", Number(data.p_numproj.slice(-2)));
  Dom.setInnerHtml("lb_numproj", data.p_numproj);
  Dom.setInnerHtml("lb_cliente", data.p_cliente);
  Dom.setInnerHtml("lb_ambiente", data.p_ambiente);
  Dom.setInnerHtml("lb_vendedor", data.p_vendedor);
  Dom.setInnerHtml("lb_dataentrega", convertDataBr(data.p_dataentrega));
  Dom.setInnerHtml("lb_entrega", convertDataBr(data.p_entrega));
  Dom.setInnerHtml("lb_pronto", convertDataBr(data.p_pronto));
  Dom.setInnerHtml("lb_liberador", data.p_liberador);
  Dom.setInnerHtml("lb_numoc", numoc);
  Dom.setInnerHtml("lb_observacoes", data.p_observacoes);
  Dom.setInnerHtml("lb_corte", data.p_codcc);
  Dom.setInnerHtml("lb_lote", data.p_lote);
  Dom.setInnerHtml("lb_pedido", data.p_pedido);
  colorUrgente(getLocalStorageItem("urgente"));

  Dom.setInnerHtml("lb_corte_inicio", convertDataBr(data.p_corteinicio));
  Dom.setInnerHtml("lb_corte_fim", convertDataBr(data.p_cortefim));
  Dom.setInnerHtml("lb_corte_resp", data.p_corte_resp);
  Dom.setInnerHtml("lb_pausa_corte", checkBoolean(data.p_cortepausa));

  Dom.setInnerHtml(
    "lb_customizacao_inicio",
    convertDataBr(data.p_customizacaoinicio)
  );
  Dom.setInnerHtml(
    "lb_customizacao_fim",
    convertDataBr(data.p_customizacaofim)
  );
  Dom.setInnerHtml("lb_custom_resp", data.p_customizacao_resp);
  Dom.setInnerHtml("lb_pausa_custom", checkBoolean(data.p_customizacaopausa));

  Dom.setInnerHtml(
    "lb_coladeira_inicio",
    convertDataBr(data.p_coladeirainicio)
  );
  Dom.setInnerHtml("lb_coladeira_fim", convertDataBr(data.p_coladeirafim));
  Dom.setInnerHtml("lb_coladeira_resp", data.p_coladeira_resp);
  Dom.setInnerHtml("lb_pausa_coladeira", checkBoolean(data.p_coladeirapausa));

  Dom.setInnerHtml("lb_usinagem_inicio", convertDataBr(data.p_usinageminicio));
  Dom.setInnerHtml("lb_usinagem_fim", convertDataBr(data.p_usinagemfim));
  Dom.setInnerHtml("lb_usinagem_resp", data.p_usinagem_resp);
  Dom.setInnerHtml("lb_pausa_usinagem", checkBoolean(data.p_usinagempausa));

  Dom.setInnerHtml("lb_paineis_inicio", convertDataBr(data.p_paineisinicio));
  Dom.setInnerHtml("lb_paineis_fim", convertDataBr(data.p_paineisfim));
  Dom.setInnerHtml("lb_paineis_resp", data.p_paineis_resp);
  Dom.setInnerHtml("lb_pausa_paineis", checkBoolean(data.p_paineispausa));

  Dom.setInnerHtml("lb_montagem_inicio", convertDataBr(data.p_montageminicio));
  Dom.setInnerHtml("lb_montagem_fim", convertDataBr(data.p_montagemfim));
  Dom.setInnerHtml("lb_montagem_resp", data.p_montagem_resp);
  Dom.setInnerHtml("lb_pausa_montagem", checkBoolean(data.p_montagempausa));

  Dom.setInnerHtml(
    "lb_acabamento_inicio",
    convertDataBr(data.p_acabamentoinicio)
  );
  Dom.setInnerHtml("lb_acabamento_fim", convertDataBr(data.p_acabamentofim));
  Dom.setInnerHtml("lb_acabamento_resp", data.p_acabamento_resp);
  Dom.setInnerHtml("lb_pausa_acabamento", checkBoolean(data.p_acabamentopausa));

  Dom.setInnerHtml(
    "lb_embalagem_inicio",
    convertDataBr(data.p_embalageminicio)
  );
  Dom.setInnerHtml("lb_embalagem_fim", convertDataBr(data.p_embalagemfim));
  Dom.setInnerHtml("lb_embalagem_resp", data.p_embalagem_resp);
  Dom.setInnerHtml("lb_pausa_embalagem", checkBoolean(data.p_embalagempausa));

  Dom.setInnerHtml("lb_responsavel", getLocalStorageItem("resp"));
  Dom.setInnerHtml("lb_data", convertDataBr(getLocalStorageItem("data")));
  Dom.setInnerHtml("lb_tipo", getLocalStorageItem("tipo"));
  Dom.setInnerHtml("lb_urgente", getLocalStorageItem("urgente"));

  Dom.setInnerHtml("lb_avulsoq", data.p_avulsoq);
  Dom.setInnerHtml("lb_avulsol", data.p_avulsol);

  Dom.setInnerHtml("lb_paineisq", data.p_paineisq);
  Dom.setInnerHtml("lb_paineisl", data.p_paineisl);

  Dom.setInnerHtml("lb_portaaluminioq", data.p_portaaluminioq);
  Dom.setInnerHtml("lb_portaaluminiol", data.p_portaaluminiol);

  Dom.setInnerHtml("lb_vidrosq", data.p_vidrosq);
  Dom.setInnerHtml("lb_vidrosl", data.p_vidrosl);

  Dom.setInnerHtml("lb_pecaspintadasq", data.p_pecaspintadasq);
  Dom.setInnerHtml("lb_pecaspintadasl", data.p_pecaspintadasl);

  Dom.setInnerHtml("lb_tapecariaq", data.p_tapecariaq);
  Dom.setInnerHtml("lb_tapecarial", data.p_tapecarial);

  Dom.setInnerHtml("lb_serralheriaq", data.p_serralheriaq);
  Dom.setInnerHtml("lb_serralherial", data.p_serralherial);

  Dom.setInnerHtml("lb_cabideq", data.p_cabideq);
  Dom.setInnerHtml("lb_cabidel", data.p_cabidel);

  Dom.setInnerHtml("lb_trilhoq", data.p_trilhoq);
  Dom.setInnerHtml("lb_trilhol", data.p_trilhol);

  Dom.setInnerHtml("lb_modulosq", data.p_modulosq);
  Dom.setInnerHtml("lb_modulosl", data.p_modulosl);

  Dom.setInnerHtml("lb_motorista", data.p_motorista_resp);
  Dom.setInnerHtml("lb_conferido", data.p_conferido_resp);

  Dom.setInnerHtml("lb_totalvolumes", data.p_totalvolumes);
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
