const { Projetos } = require('../client/db');

module.exports = {
  async setInfoCapa(req, res) {
    try {
      await Projetos.update(
        {
          tipo:    req.query.tipo    ?? null,
          urgente: req.query.urgente === 'true',
        },
        { where: { ordemdecompra: Number(req.query.ordemdecompra) } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Erro ao atualizar capa', error: err.message });
    }
  },
};
