const service = require('../services/utilsService');

module.exports = {
  async setInfoCapa(req, res) {
    try {
      await service.setTipo(req.query.ordemdecompra, req.query.tipo, req.query.urgente);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Erro ao atualizar capa', error: err.message });
    }
  },
};
