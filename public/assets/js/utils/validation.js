export class Validate {
  static isNumber(value) {
    return !!Number(value);
  }
  static len(param, value) {
    return param.length >= value;
  }

  static isDate(date) {
    let dia, mes, ano;
    if (date.includes("/")) {
      [dia, mes, ano] = date.split("/").map(Number);
    } else {
      [dia, mes, ano] = date.split("-").map(Number);
    }
    return new Date(ano, mes - 1, dia);
  }
}

const d = Validate;
console.log(d.isNumber(1));
console.log(d.len("as", 10));
console.log(d.isDate("27/0a2/2025"));
