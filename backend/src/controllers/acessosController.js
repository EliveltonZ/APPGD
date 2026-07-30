const service = require("../services/usuariosService");

module.exports = {
  async listAcessos(req, res) {
    try {
      const data = await service.listarAcessos();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar acessos", error: err.message });
    }
  },

  async setUserAccess(req, res) {
    try {
      await service.atualizarAcessos(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar acessos", error: err.message });
    }
  },

  async getUserAccess(req, res) {
    try {
      const data = await service.buscarAcesso(req.query.p_id);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar acesso", error: err.message });
    }
  },
};
