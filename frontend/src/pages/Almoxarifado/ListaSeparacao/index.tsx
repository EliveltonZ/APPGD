import { useEffect, useState } from "react";
import { fetchListaSeparacao } from "../../../services/estoque";
import type { ListaSeparacao } from "../../../services/estoque";
import { localDateStr, fmtDate } from "../../../utils/dateUtils";
import logo from "../../../assets/gd-color.png";
import "./index.css";

const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

function fmtQtd(v: number): string {
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

export function ListaSeparacaoPage() {
  const params = new URLSearchParams(window.location.search);
  const ordemdecompra = params.get("ordemdecompra") ?? "";
  const preview = params.get("preview") === "1";

  const [data, setData] = useState<ListaSeparacao | null>(null);
  const [loading, setLoading] = useState(!!ordemdecompra);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ordemdecompra) return;
    fetchListaSeparacao(ordemdecompra)
      .then((d) => {
        if (d.itens.length === 0) {
          setError("Nenhum item pendente de separação pra esse pedido.");
        } else {
          setData(d);
        }
      })
      .catch(() => setError("Pedido não encontrado."))
      .finally(() => setLoading(false));
  }, [ordemdecompra]);

  useEffect(() => {
    if (!data || preview) return;
    // dá um instante pro layout assentar antes de abrir o diálogo de impressão.
    // Quando carregado dentro do iframe invisível (fluxo normal, disparado a
    // partir da fila de Baixas), avisa o pai em vez de imprimir a si mesmo —
    // é o pai que efetivamente chama print() no conteúdo do iframe. Só
    // imprime diretamente quando aberto standalone (fora do iframe).
    const t = setTimeout(() => {
      if (window.parent !== window) {
        window.parent.postMessage("lista-separacao-ready", "*");
      } else {
        window.print();
      }
    }, 150);
    return () => clearTimeout(t);
  }, [data, preview]);

  if (!ordemdecompra) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#888", fontFamily: "Arial, sans-serif" }}>
        Nenhum pedido informado.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "Arial, sans-serif" }}>
        Carregando...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#c00", fontFamily: "Arial, sans-serif" }}>
        {error || "Erro ao carregar."}
      </div>
    );
  }

  return (
    <>
      <div className="ls-toolbar no-print">
        <button className="ls-toolbar__btn" onClick={() => window.print()}>Imprimir</button>
        <button className="ls-toolbar__btn ls-toolbar__btn--ghost" onClick={() => window.history.back()}>Voltar</button>
      </div>

      <div className="ls-wrapper">
        <div className="ls-header">
          <div className="ls-header__title-wrap">
            <img src={logo} alt="GD" className="ls-header__logo" />
            <h1 className="ls-header__title">Lista de Separação</h1>
          </div>
          <span className="ls-header__data">Impresso em {fmtDate(localDateStr())}</span>
        </div>

        <div className="ls-info">
          <div>
            <span className="ls-info__label">Contrato</span>
            <span className="ls-info__value">{data.contrato}</span>
          </div>
          <div>
            <span className="ls-info__label">Pedido</span>
            <span className="ls-info__value">{data.pedido ?? "—"}</span>
          </div>
          <div>
            <span className="ls-info__label">Cliente</span>
            <span className="ls-info__value">{data.cliente ?? "—"}</span>
          </div>
          <div>
            <span className="ls-info__label">Ambiente</span>
            <span className="ls-info__value">{data.ambiente}</span>
          </div>
        </div>

        <table className="ls-table">
          <thead>
            <tr>
              <th className="ls-table__check"></th>
              <th>Código</th>
              <th>Descrição</th>
              <th>Qtd</th>
              <th>Localização</th>
            </tr>
          </thead>
          <tbody>
            {data.itens.map((item) => (
              <tr key={item.id}>
                <td className="ls-table__check"><span className="ls-checkbox" /></td>
                <td>{item.codigoInterno}</td>
                <td>{item.descricao}</td>
                <td className="ls-table__qtd">
                  {fmtQtd(item.quantidade)} {UNIDADE_LABEL[item.unidade] ?? item.unidade}
                </td>
                <td>
                  {item.localizacoes.length === 0 ? (
                    <span className="ls-sem-local">sem estoque</span>
                  ) : (
                    item.localizacoes.map((l) => (
                      <span key={l.codigo} className={`ls-local${l.padraoRecebimento ? " ls-local--recebimento" : ""}`}>
                        {l.codigo}
                      </span>
                    ))
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
