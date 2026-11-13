const service = require("../services/comprasService");

module.exports = {
  async getAcessoriosCompras(req, res) {
    try {
      const data = await service.listarAcessoriosCompras(req.query);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar compras", error: err.message });
    }
  },

  async setAcessorios(req, res) {
    try {
      await service.atualizarAcessorios(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar acessório", error: err.message });
    }
  },
};
