const service = require("../services/usuariosService");

module.exports = {
  async alterarSenha(req, res) {
    try {
      await service.alterarSenha(req.body.p_id, req.body.p_senha);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao alterar senha", error: err.message });
    }
  },
};
