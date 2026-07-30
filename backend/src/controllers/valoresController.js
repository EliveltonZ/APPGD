const service = require("../services/valoresService");

module.exports = {
  async fillTableValores(req, res) {
    try {
      const data = await service.listarValoresProjetos(req.query.dataInicial, req.query.dataFinal);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar valores", error: err.message });
    }
  },
};
