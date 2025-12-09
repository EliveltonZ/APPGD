export class Numbers {
  static checkValue(value) {
    if (value) {
      return value;
    } else {
      return 0;
    }
  }

  static changeFormatCurrency1(e) {
    let r = e.value.replace(/\D/g, "");
    (r = (r / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    })),
      (e.value = r);
  }

  static FormatCurrency(value) {
    if (!value) return;
    let r = value.replace(/\D/g, "");
    r = (r / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
    return r;
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

  static formatDateMask(value) {
    // Remove qualquer caractere não numérico
    value = value.replace(/\D/g, "");

    // Aplica MM/YY
    if (value.length <= 2) {
      return value;
    } else if (value.length <= 4) {
      return value.replace(/(\d{2})(\d{2})/, "$1/$2");
    } else {
      return value.substring(0, 4).replace(/(\d{2})(\d{2})/, "$1/$2");
    }
  }
}
