import * as XLSX from "xlsx";

export interface LoteExportRow {
  "C.C.": string;
  Pedido: string;
  Ambiente: string;
  Cliente: string;
  Entrega: string;
  Lote: string;
}

function fmtEntrega(val: string): string {
  if (!val) return "—";
  const [y, m, d] = val.split("-");
  if (!d) return val;
  return `${d}/${m}/${y}`;
}

export async function exportLoteExcel(
  rows: LoteExportRow[],
  lote: string,
): Promise<void> {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Lote ${lote}`);

  const buffer: ArrayBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lote_${lote}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export { fmtEntrega };
