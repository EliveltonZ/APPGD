export class MyNumber {
  static formatCoin(value) {
    const number = MyNumber.checkValue(value);
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  static checkValue(value) {
    if (value) {
      return value;
    } else {
      return 0;
    }
  }

  static changeFormatCurrency(e) {
    let r = e.value.replace(/\D/g, "");
    (r = (r / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    })),
      (e.value = r);
  }

  static formatValueDecimal(valorInput) {
    if (valorInput) {
      const valorFormatado = valorInput.replace(/[^0-9,]/g, "");
      const resultado = valorFormatado.replace(",", ".");
      return resultado;
    } else {
      return 0;
    }
  }
}
