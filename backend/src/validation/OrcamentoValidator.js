const BaseValidator = require('./BaseValidator');

// Orçamento: só a lista de itens (material + quantidade) — sem fornecedor
// ainda. Cada item precisa de material identificado e quantidade válida
// antes de disparar; o primeiro problema encontrado é reportado em
// `itens` (addError só guarda a primeira mensagem por campo).
class OrcamentoValidator extends BaseValidator {
  rules() {
    const itens = this.data.itens;
    if (!Array.isArray(itens) || itens.length === 0) {
      this.addError('itens', 'Selecione ao menos um item pra orçar.');
      return;
    }
    itens.forEach((item, i) => {
      const posicao = i + 1;
      if (!item || !item.materialId) {
        this.addError('itens', `Item ${posicao}: material não identificado.`);
        return;
      }
      this.isPositive(item.quantidade, 'itens', `Item ${posicao}: quantidade`);
    });
  }
}

module.exports = OrcamentoValidator;
