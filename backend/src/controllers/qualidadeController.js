const service     = require("../services/qualidadeService");
const utilsService = require("../services/utilsService");

module.exports = {
  async getPecasQualidade(req, res) {
    try {
      const data = await service.listarPecasQualidade();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar peças qualidade", error: err.message });
    }
  },

  async updateCausaRaiz(req, res) {
    try {
      await service.updateCausaRaiz(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar causa raiz", error: err.message });
    }
  },

  async getCausaFalha(req, res) {
    try {
      const data = await utilsService.listarCausaFalha(req.query.p_id_falha);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar causas de falha", error: err.message });
    }
  },
};
