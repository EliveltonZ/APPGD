const service = require('../services/producaoService');

module.exports = {
  async getPedido(req, res, next) {
    try {
      const pedido = req.query.pedido;
      if (!pedido) return res.status(400).json({ error: 'pedido obrigatório' });
      const rows = await service.buscarProducaoPorPedido(pedido);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  async setDados(req, res, next) {
    try {
      await service.atualizarDadosProducao(req.body);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};
