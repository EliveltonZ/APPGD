const { Projetos } = require('../client/db');

module.exports = {
  async setInfoCapa(req, res) {
    try {
      await Projetos.update(
        {
          tipo:    req.query.p_tipo    ?? null,
          urgente: req.query.p_urgente === 'true',
        },
        { where: { ordemdecompra: Number(req.query.p_ordemdecompra) } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Erro ao atualizar capa', error: err.message });
    }
  },
};
