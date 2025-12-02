export class DateTimer {
  static setToday() {
    var dataAtual = new Date();
    var ano = dataAtual.getFullYear();
    var mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    var dia = String(dataAtual.getDate()).padStart(2, "0");
    var dataHoraFormatada = `${ano}-${mes}-${dia}`;
    return dataHoraFormatada;
  }

  static forBr(date) {
    if (date === "-" || !date) {
      return "-";
    }

    const [data, hora] = date.split("T");
    const [ano, mes, dia] = data.split("-");

    let dataFormatada = `${dia}/${mes}/${ano}`;
    if (hora) {
      dataFormatada += ` ${hora}`;
    }
    return dataFormatada;
  }

  static isDateInFuture(date) {
    const today = new Date();
    const inputDate = new Date(date);
    return inputDate > today;
  }

  // Função para verificar se a data de fim é anterior à de início
  static isEndBeforeStart(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end < start;
  }

  static dateTimeNow() {
    var dataAtual = new Date();
    var ano = dataAtual.getFullYear();
    var mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    var dia = String(dataAtual.getDate()).padStart(2, "0");
    var hora = String(dataAtual.getHours()).padStart(2, "0");
    var minuto = String(dataAtual.getMinutes()).padStart(2, "0");
    var dataHoraFormatada = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    return dataHoraFormatada;
  }
}
