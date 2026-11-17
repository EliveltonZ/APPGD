const service = require('../services/usuariosService');

module.exports = {
  async getOperador(req, res) {
    try {
      const hash = req.query.hash;
      if (!hash) return res.status(400).json({ error: 'hash obrigatório' });
      const operador = await service.buscarOperadorPorCracha(hash);
      if (!operador) return res.status(404).json({ error: 'Crachá não reconhecido' });
      res.json(operador);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao identificar operador', error: err.message });
    }
  },
};
