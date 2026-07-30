const service = require("../services/projetosService");

module.exports = {
  async getDeleteProjetos(req, res) {
    try {
      const data = await service.buscarParaDeletar(Number(req.query.p_ordemdecompra));
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar projeto", error: err.message });
    }
  },

  async setDeleteProjeto(req, res) {
    try {
      await service.deletarProjeto(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao excluir projeto", error: err.message });
    }
  },
};
