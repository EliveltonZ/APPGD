const service = require("../services/pecasService");

module.exports = {
  async getPecas(req, res) {
    try {
      const data = await service.listarPecas(req.query.p_id_assistencia);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar peças", error: err.message });
    }
  },

  async setPecas(req, res) {
    try {
      await service.inserirPecas(req.body.p_id_assistencia, req.body.p_pecas ?? []);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao inserir peças", error: err.message });
    }
  },

  async setPecasLote(req, res) {
    try {
      await service.inserirPecas(req.body.p_id_assistencia, req.body.p_pecas ?? []);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao inserir peças em lote", error: err.message });
    }
  },
};
