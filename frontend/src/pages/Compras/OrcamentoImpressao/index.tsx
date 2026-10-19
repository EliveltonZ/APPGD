import { useEffect, useState } from "react";
import { fetchSolicitacao } from "../../../services/solicitacaoCompras";
import type { SolicitacaoDetalhe } from "../../../services/solicitacaoCompras";
import { localDateStr, fmtDate } from "../../../utils/dateUtils";
import logo from "../../../assets/gd-color.png";
import "./index.css";

const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

function fmtQtd(v: number): string {
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

export function OrcamentoImpressaoPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") ?? "";
  const preview = params.get("preview") === "1";

  const [data, setData] = useState<SolicitacaoDetalhe | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchSolicitacao(Number(id))
      .then((d) => {
        if (d.itens.length === 0) {
          setError("Nenhum item encontrado pra este orçamento.");
        } else {
          setData(d);
        }
      })
      .catch(() => setError("Orçamento não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!data || preview) return;
    const t = setTimeout(() => {
      if (window.parent !== window) {
        window.parent.postMessage("orcamento-impressao-ready", "*");
      } else {
        window.print();
      }
    }, 150);
    return () => clearTimeout(t);
  }, [data, preview]);

  if (!id) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#888", fontFamily: "Arial, sans-serif" }}>
        Nenhum orçamento informado.
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

  const fornecedorNome = data.itens.find((i) => i.fornecedor_nome)?.fornecedor_nome ?? null;
  const titulo = fornecedorNome ? "Pedido de Compra" : "Orçamento de Compra";

  return (
    <>
      <div className="oi-toolbar no-print">
        <button className="oi-toolbar__btn" onClick={() => window.print()}>Imprimir</button>
        <button className="oi-toolbar__btn oi-toolbar__btn--ghost" onClick={() => window.history.back()}>Voltar</button>
      </div>

      <div className="oi-wrapper">
        <div className="oi-header">
          <div className="oi-header__title-wrap">
            <img src={logo} alt="GD" className="oi-header__logo" />
            <h1 className="oi-header__title">{titulo}</h1>
          </div>
          <span className="oi-header__data">Impresso em {fmtDate(localDateStr())}</span>
        </div>

        <div className="oi-info">
          <div>
            <span className="oi-info__label">Nº</span>
            <span className="oi-info__value">{data.id}</span>
          </div>
          <div>
            <span className="oi-info__label">Data</span>
            <span className="oi-info__value">{fmtDate(data.data_solicitacao)}</span>
          </div>
          <div>
            <span className="oi-info__label">Solicitante</span>
            <span className="oi-info__value">{data.solicitante_login}</span>
          </div>
          {fornecedorNome && (
            <div>
              <span className="oi-info__label">Fornecedor</span>
              <span className="oi-info__value">{fornecedorNome}</span>
            </div>
          )}
        </div>

        {data.observacoes && (
          <p className="oi-obs">
            <strong>Observações:</strong> {data.observacoes}
          </p>
        )}

        <table className="oi-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Quantidade</th>
              <th>Preço Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.itens.map((item) => (
              <tr key={item.id}>
                <td>{item.codigo_interno}</td>
                <td>{item.material_descricao}</td>
                <td className="oi-table__qtd">
                  {fmtQtd(item.quantidade)} {UNIDADE_LABEL[item.unidade_base] ?? item.unidade_base}
                </td>
                <td className="oi-table__preencher"></td>
                <td className="oi-table__preencher"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {!fornecedorNome && (
          <p className="oi-rodape">
            Favor preencher preço unitário e total e retornar — essa é uma solicitação de orçamento, não um
            pedido de compra confirmado.
          </p>
        )}
      </div>
    </>
  );
}
