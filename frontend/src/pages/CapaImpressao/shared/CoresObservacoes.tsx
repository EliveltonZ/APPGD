// `observacoes` só é passado pela Capa de Pendências — na Capa normal a
// segunda linha continua em branco, pra preencher à mão (pedido explícito:
// observação impressa só na de Pendências).
export function CoresObservacoes({ observacoes }: { observacoes?: string } = {}) {
  return (
    <div style={{ height: 75, marginTop: 8, border: "0.25pt solid #000" }}>
      <div className="cp-title cp-bg-blue">CORES DO PROJETO + OBSERVAÇÕES</div>
      <div style={{ borderTop: "0.25pt solid #000", height: "calc(33.3% - 1px)", padding: "2px 4px" }} />
      <div style={{ borderTop: "0.25pt solid #000", height: "33.3%", padding: "2px 4px", fontSize: 9, overflow: "hidden" }}>
        {observacoes || ""}
      </div>
    </div>
  );
}
