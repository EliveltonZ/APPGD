const service = require("../services/projetosService");

module.exports = {
  async getEditProjetos(req, res) {
    try {
      const data = await service.buscarParaEditar(Number(req.query.id));
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar projeto", error: err.message });
    }
  },

  async setEditProjetos(req, res) {
    try {
      await service.atualizarProjeto(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar projeto", error: err.message });
    }
  },
};
