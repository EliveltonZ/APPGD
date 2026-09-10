export function CoresObservacoes({ observacoes }: { observacoes?: string }) {
  return (
    <div style={{ minHeight: 75, marginTop: 8, border: "0.25pt solid #000" }}>
      <div className="cp-title cp-bg-blue">CORES DO PROJETO + OBSERVAÇÕES</div>
      <div
        className="cp-font"
        style={{
          borderTop: "0.25pt solid #000",
          minHeight: 51,
          padding: "2px 4px",
          whiteSpace: "pre-wrap",
        }}
      >
        {observacoes}
      </div>
    </div>
  );
}
