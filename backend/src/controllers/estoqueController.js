const service = require('../services/estoqueService');

function notFound(res) {
  return res.status(404).json({ error: 'Registro não encontrado.' });
}

module.exports = {
  async getSaldo(req, res, next) {
    try {
      const materialId = Number(req.params.materialId);
      res.json(await service.calcularSaldo(materialId));
    } catch (err) { next(err); }
  },

  async getAlertaMinimo(req, res, next) {
    try {
      res.json(await service.listarAlertaMinimo());
    } catch (err) { next(err); }
  },

  async postReservar(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      const linha = await service.reservar(Number(req.params.id), usuarioId);
      if (!linha) return notFound(res);
      res.json(linha);
    } catch (err) { next(err); }
  },

  async postLiberarReserva(req, res, next) {
    try {
      const linha = await service.liberarReserva(Number(req.params.id));
      if (!linha) return notFound(res);
      res.json(linha);
    } catch (err) { next(err); }
  },

  async postBaixa(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      const { qtd_un_baixada, localizacao_id } = req.body;
      const linha = await service.darBaixa(Number(req.params.id), {
        qtdUnBaixada: qtd_un_baixada,
        localizacaoId: localizacao_id,
        usuarioId,
      });
      if (!linha) return notFound(res);
      res.json(linha);
    } catch (err) { next(err); }
  },
};
