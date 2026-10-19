const BaseValidator = require('./BaseValidator');

// Lançamento de nota fiscal: cabeçalho (fornecedor, número, data de
// entrada) + lista de itens — cada item precisa de material, quantidades
// e unidade válidos antes de gravar estoque.
class NotaFiscalValidator extends BaseValidator {
  rules() {
    this.required(this.data.fornecedorId, 'fornecedorId', 'Fornecedor');
    this.required(this.data.numeroNota, 'numeroNota', 'Número da nota');
    this.required(this.data.dataEntrada, 'dataEntrada', 'Data de entrada');

    const itens = this.data.itens;
    if (!Array.isArray(itens) || itens.length === 0) {
      this.addError('itens', 'Adicione ao menos um item.');
      return;
    }

    itens.forEach((item, i) => {
      const posicao = i + 1;
      if (!item || !item.materialId) {
        this.addError('itens', `Item ${posicao}: material não identificado.`);
        return;
      }
      if (!this.isPositive(item.qtdNf, 'itens', `Item ${posicao}: quantidade (NF)`)) return;
      if (!this.isPositive(item.qtdUn, 'itens', `Item ${posicao}: quantidade (UN)`)) return;
      if (!item.unidadeCompra || !String(item.unidadeCompra).trim()) {
        this.addError('itens', `Item ${posicao}: informe a unidade de compra.`);
        return;
      }
      if (item.precoNf != null && !Number.isFinite(Number(item.precoNf))) {
        this.addError('itens', `Item ${posicao}: preço (NF) inválido.`);
        return;
      }
      if (item.precoUn != null && !Number.isFinite(Number(item.precoUn))) {
        this.addError('itens', `Item ${posicao}: preço (UN) inválido.`);
      }
    });
  }
}

module.exports = NotaFiscalValidator;
