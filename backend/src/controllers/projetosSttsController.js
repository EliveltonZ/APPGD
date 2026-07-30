const service = require("../services/logisticaService");

module.exports = {
  async fillTable(req, res) {
    try {
      const data = await service.listarProjetosLogistica(req.query.dataCondition);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar projetos logística", error: err.message });
    }
  },

  async getStatus(req, res) {
    try {
      const data = await service.buscarProjetoLogistica(Number(req.query.id));
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar projeto logística", error: err.message });
    }
  },
};
