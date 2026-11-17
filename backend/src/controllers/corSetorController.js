const repo = require('../repositories/corSetorRepository');

module.exports = {
  async listar(req, res) {
    try {
      const mapa = await repo.listarCores();
      res.json(mapa);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao buscar cores dos setores', error: err.message });
    }
  },

  async salvar(req, res) {
    try {
      const { setor, cor } = req.body;
      if (!setor || !cor) {
        return res.status(400).json({ message: 'Informe setor e cor' });
      }
      const data = await repo.salvarCor(setor, cor);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao salvar cor do setor', error: err.message });
    }
  },
};
