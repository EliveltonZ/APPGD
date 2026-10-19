const BaseValidator = require('./BaseValidator');

// Edição de quantidade de um item ainda em orçamento.
class AtualizarQuantidadeOrcamentoValidator extends BaseValidator {
  rules() {
    this.required(this.data.itemId, 'itemId', 'Item');
    this.isPositive(this.data.quantidade, 'quantidade', 'Quantidade');
  }
}

module.exports = AtualizarQuantidadeOrcamentoValidator;
