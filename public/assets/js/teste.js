function toFixed2(value) {
  try {
    let n = String(value)
      .replace(/[^\d,]/g, "") // remove tudo que não for número ou vírgula
      .replace(",", "."); // troca vírgula por ponto

    return n;
  } catch (err) {
    console.warn(err);
  }
}

const teste = "R$ 5.001,55";
const result = toFixed2(teste);

console.log(result); // "5001.55"
