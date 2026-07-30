const service = require("../services/usuariosService");

module.exports = {
  async getMaxId(req, res) {
    try {
      const data = await service.buscarMaiorId();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar maior id", error: err.message });
    }
  },

  async insertUser(req, res) {
    try {
      await service.inserirUsuario(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao inserir usuário", error: err.message });
    }
  },

  async listAllUsers(req, res) {
    try {
      const data = await service.listarTodosUsuarios();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar usuários", error: err.message });
    }
  },

  async updateUser(req, res) {
    try {
      await service.atualizarUsuario(req.params.id, req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar usuário", error: err.message });
    }
  },
};
