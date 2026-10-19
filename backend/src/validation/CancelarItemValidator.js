const BaseValidator = require('./BaseValidator');

// Cancelamento de um item de orçamento ou de pedido — só exige saber qual
// item (as regras de negócio sobre SE pode cancelar — nf_item_id já
// vinculado, etc. — moram no repository, que conhece o estado real do
// registro; aqui é só a forma do pedido).
class CancelarItemValidator extends BaseValidator {
  rules() {
    this.required(this.data.itemId, 'itemId', 'Item');
  }
}

module.exports = CancelarItemValidator;
