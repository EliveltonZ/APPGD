// `observacoes` só é passado pela Capa de Pendências — nesse caso vira uma
// linha única (sem a divisão que existe na Capa normal, que continua com
// duas linhas em branco pra preencher à mão).
export function CoresObservacoes({ observacoes }: { observacoes?: string } = {}) {
  if (observacoes !== undefined) {
    return (
      <div style={{ height: 75, marginTop: 8, border: "0.25pt solid #000" }}>
        <div className="cp-title cp-bg-blue">CORES DO PROJETO + OBSERVAÇÕES</div>
        <div style={{ borderTop: "0.25pt solid #000", height: "calc(66.6% - 1px)", padding: "2px 4px", fontSize: 9, overflow: "hidden" }}>
          {observacoes || ""}
        </div>
      </div>
    );
  }
  return (
    <div style={{ height: 75, marginTop: 8, border: "0.25pt solid #000" }}>
      <div className="cp-title cp-bg-blue">CORES DO PROJETO + OBSERVAÇÕES</div>
      <div style={{ borderTop: "0.25pt solid #000", height: "calc(33.3% - 1px)", padding: "2px 4px" }} />
      <div style={{ borderTop: "0.25pt solid #000", height: "33.3%" }} />
    </div>
  );
}
