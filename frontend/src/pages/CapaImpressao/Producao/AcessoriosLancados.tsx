import type { AcessorioItem } from "../capaData";

export function AcessoriosLancados({ acessorios }: { acessorios?: AcessorioItem[] }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div className="cp-title cp-bg-blue" style={{ border: "0.25pt solid #000" }}>
        ACESSÓRIOS LANÇADOS
      </div>
      <div style={{ height: 450, border: "0.25pt solid #000", borderTop: "none", overflow: "hidden" }}>
        <table className="cp-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th style={{ textAlign: "center" }}>Medida</th>
              <th style={{ textAlign: "center" }}>Qtd</th>
            </tr>
          </thead>
          <tbody>
            {(acessorios ?? []).map((a, i) => (
              <tr key={i}>
                <td>{a.descricao}</td>
                <td style={{ textAlign: "center" }}>{a.medida ?? ""}</td>
                <td style={{ textAlign: "center" }}>{a.qtd ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
