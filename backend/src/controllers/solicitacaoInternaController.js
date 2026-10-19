'use strict';
const service = require('../services/solicitacaoInternaService');

module.exports = {
  async postCriar(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      const { material_id, quantidade, observacao } = req.body;
      const resultado = await service.criar({ materialId: material_id, quantidade, observacao, usuarioId });
      res.json(resultado);
    } catch (err) { next(err); }
  },

  async getPendentes(req, res, next) {
    try {
      res.json(await service.listarPendentes());
    } catch (err) { next(err); }
  },

  async getMinhas(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      res.json(await service.listarMinhas(usuarioId));
    } catch (err) { next(err); }
  },

  async deleteCancelar(req, res, next) {
    try {
      const id = Number(req.params.id);
      res.json(await service.cancelar(id));
    } catch (err) { next(err); }
  },
};
