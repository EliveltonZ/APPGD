const service = require("../services/usuariosService");

module.exports = {
  async alterarSenha(req, res) {
    try {
      // Usa req.user.sub para garantir que cada usuário só altere a própria senha.
      await service.alterarSenha(req.user.sub, req.body.p_senha);
      res.json({ success: true });
    } catch (err) {
      res.status(err.message.includes('ao menos') ? 400 : 500)
         .json({ error: err.message });
    }
  },
};
