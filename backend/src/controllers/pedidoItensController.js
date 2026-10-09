const service = require('../services/pedidoItensService');

module.exports = {
  async getBuscarContrato(req, res, next) {
    try {
      res.json(await service.buscarPorContrato(req.query.contrato));
    } catch (err) { next(err); }
  },

  async getItens(req, res, next) {
    try {
      res.json(await service.listarItens(Number(req.params.ordemdecompra)));
    } catch (err) { next(err); }
  },

  async postItem(req, res, next) {
    try {
      const linha = await service.adicionarManual({
        ordemdecompra: Number(req.params.ordemdecompra),
        materialId:    req.body.material_id,
        quantidade:    req.body.quantidade,
        detalhes:      req.body.detalhes,
      });
      res.status(201).json(linha);
    } catch (err) { next(err); }
  },

  async deleteItem(req, res, next) {
    try {
      const ok = await service.remover(Number(req.params.id));
      if (!ok) return res.status(404).json({ error: 'Item não encontrado ou não pode ser removido (veio de uma importação de XML).' });
      // Corpo sempre em JSON, mesmo em sucesso — o `request()` genérico do
      // frontend (services/api.ts) chama res.json() sem checar status, e
      // quebra ("Unexpected end of JSON input") num 204 sem corpo.
      res.json({ ok: true });
    } catch (err) { next(err); }
  },
};
