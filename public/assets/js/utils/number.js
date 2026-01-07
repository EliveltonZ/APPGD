export class Numbers {
  static checkValue(value) {
    if (value) {
      return value;
    } else {
      return 0;
    }
  }

  static currency(value) {
    if (value === null || value === undefined) return;

    let r = String(value).replace(/\D/g, "");
    r = (r / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

    return r;
  }

  static decimal(valorInput) {
    if (valorInput) {
      const valorFormatado = valorInput.replace(/[^0-9,]/g, "");
      const resultado = valorFormatado.replace(",", ".");
      return resultado;
    } else {
      return 0;
    }
  }

  static percent(value) {
    if (!value) return;
    let r = Number(value).toFixed(2);
    return String(r) + "%";
  }

  static dateMask(value) {
    value = value.replace(/\D/g, "");

    if (value.length <= 2) {
      return value;
    } else if (value.length <= 4) {
      return value.replace(/(\d{2})(\d{2})/, "$1/$2");
    } else {
      return value.substring(0, 4).replace(/(\d{2})(\d{2})/, "$1/$2");
    }
  }
}
