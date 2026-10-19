const BaseValidator = require('./BaseValidator');

// Confirmação de compra: vários itens de orçamento de uma vez, com um
// único fornecedor — formam um pedido só. Cada item precisa apontar pra
// um item de orçamento real (itemId) com quantidade válida.
class ConfirmarPedidoValidator extends BaseValidator {
  rules() {
    this.required(this.data.fornecedorId, 'fornecedorId', 'Fornecedor');

    const itens = this.data.itens;
    if (!Array.isArray(itens) || itens.length === 0) {
      this.addError('itens', 'Selecione ao menos um item pra confirmar.');
      return;
    }
    itens.forEach((item, i) => {
      const posicao = i + 1;
      if (!item || !item.itemId) {
        this.addError('itens', `Item ${posicao}: item de orçamento não identificado.`);
        return;
      }
      this.isPositive(item.quantidade, 'itens', `Item ${posicao}: quantidade`);
    });
  }
}

module.exports = ConfirmarPedidoValidator;
