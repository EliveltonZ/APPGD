export class DateTime {
  static today() {
    var dataAtual = new Date();
    var ano = dataAtual.getFullYear();
    var mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    var dia = String(dataAtual.getDate()).padStart(2, "0");
    var dataHoraFormatada = `${ano}-${mes}-${dia}`;
    return dataHoraFormatada;
  }

  static now() {
    var dataAtual = new Date();
    var ano = dataAtual.getFullYear();
    var mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    var dia = String(dataAtual.getDate()).padStart(2, "0");
    var hora = String(dataAtual.getHours()).padStart(2, "0");
    var minuto = String(dataAtual.getMinutes()).padStart(2, "0");
    var dataHoraFormatada = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    return dataHoraFormatada;
  }

  static checkValue(value) {
    if (value) {
      return value;
    } else {
      return "-";
    }
  }

  static forBr(date) {
    if (DateTime.checkValue(date) === "-" || !date) {
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

  static forISO(date) {
    if (DateTime.checkValue(date) == "-") {
      return "-";
    } else {
      const parse_date = date.split("/");
      const format_date = `${parse_date[2]}-${parse_date[1]}-${parse_date[0]}`;
      return format_date;
    }
  }

  static isDateInFuture(date) {
    const today = new Date();
    const inputDate = new Date(date);
    return inputDate > today;
  }

  static isEndBeforeStart(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end < start;
  }
}
