const service = require("../services/projetosService");

module.exports = {
  async fillElements(req, res) {
    try {
      const data = await service.buscarCapaProducao(Number(req.query.id));
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar capa", error: err.message });
    }
  },
};
