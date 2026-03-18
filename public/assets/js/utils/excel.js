import "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";

export class Excel {
  static async export(
    data,
    nomeArquivo = "Projetos.xlsx",
    nomeAba = "ConPlanejamentoProd"
  ) {
    if (!Array.isArray(data) || data.length === 0) {
      Swal.fire({
        icon: "error",
        text: "Não foi retornado dados ou filtros invalidos.",
      });
      return;
    }
    const planilha = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, planilha, nomeAba);
    XLSX.writeFile(workbook, nomeArquivo);
  }
}
