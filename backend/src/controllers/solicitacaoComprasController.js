'use strict';
const service = require('../services/solicitacaoComprasService');

module.exports = {
  async postOrcamento(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      const { observacoes, itens } = req.body;
      const resultado = await service.criarOrcamento({
        observacoes,
        itens: Array.isArray(itens)
          ? itens.map((i) => ({ materialId: i.material_id, quantidade: i.quantidade }))
          : [],
        usuarioId,
      });
      res.json(resultado);
    } catch (err) { next(err); }
  },

  async getItensAbertos(req, res, next) {
    try {
      const itens = await service.listarItensAbertos();
      res.json(itens);
    } catch (err) { next(err); }
  },

  async putItem(req, res, next) {
    try {
      const itemId = Number(req.params.itemId);
      const { quantidade } = req.body;
      const resultado = await service.atualizarQuantidadeItem({ itemId, quantidade });
      res.json(resultado);
    } catch (err) { next(err); }
  },

  async deleteItem(req, res, next) {
    try {
      const itemId = Number(req.params.itemId);
      const resultado = await service.cancelarItem({ itemId });
      res.json(resultado);
    } catch (err) { next(err); }
  },

  async postConfirmar(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      const { fornecedor_id, observacoes, itens } = req.body;
      const resultado = await service.confirmarPedido({
        fornecedorId: fornecedor_id,
        observacoes,
        itens: Array.isArray(itens)
          ? itens.map((i) => ({ itemId: i.item_id, quantidade: i.quantidade }))
          : [],
        usuarioId,
      });
      res.json(resultado);
    } catch (err) { next(err); }
  },

  async getPedidos(req, res, next) {
    try {
      const itens = await service.listarPedidos();
      res.json(itens);
    } catch (err) { next(err); }
  },

  async getPedidosAbertosPorFornecedor(req, res, next) {
    try {
      const fornecedorId = Number(req.query.fornecedor_id);
      const itens = await service.listarPedidosAbertosPorFornecedor(fornecedorId);
      res.json(itens);
    } catch (err) { next(err); }
  },

  async getSolicitacao(req, res, next) {
    try {
      const id = Number(req.params.id);
      const resultado = await service.buscarSolicitacao(id);
      res.json(resultado);
    } catch (err) { next(err); }
  },
};
