const BaseValidator = require('./BaseValidator');

// Solicitação interna: pedido avulso de produção (ferramenta, EPI,
// limpeza, peça de máquina etc.), não ligado a nenhum pedido de venda.
class SolicitacaoInternaValidator extends BaseValidator {
  rules() {
    this.required(this.data.materialId, 'materialId', 'Material');
    this.isPositive(this.data.quantidade, 'quantidade', 'Quantidade');
  }
}

module.exports = SolicitacaoInternaValidator;
