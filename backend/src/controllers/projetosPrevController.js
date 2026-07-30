const service = require("../services/previsaoService");

module.exports = {
  async fillTablePrevisao(req, res) {
    try {
      const data = await service.listarProjetosPrevisoes();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar previsões", error: err.message });
    }
  },

  async getPrevisao(req, res) {
    try {
      const data = await service.buscarProjetoPrevisao(Number(req.query.id));
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar previsão", error: err.message });
    }
  },
};
