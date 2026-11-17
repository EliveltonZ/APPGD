const repo = require('../repositories/kioskPinRepository');

module.exports = {
  async getPin(req, res) {
    try {
      const data = await repo.buscarPin();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao buscar PIN', error: err.message });
    }
  },

  async gerarPin(req, res) {
    try {
      const data = await repo.gerarPin();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao gerar PIN', error: err.message });
    }
  },
};
