const service = require("../services/expedicaoService");

module.exports = {
  async fillTable(req, res) {
    try {
      const data = await service.listarProjetosExpedicao(req.query.data_condition);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar projetos expedição", error: err.message });
    }
  },

  async getExpedicao(req, res) {
    try {
      const data = await service.buscarProjetoExpedicao(Number(req.query.id));
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar projeto expedição", error: err.message });
    }
  },

  async getMateriais(req, res) {
    try {
      const data = await service.listarAcessoriosExpedicao(Number(req.query.id));
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar materiais", error: err.message });
    }
  },

  async setDataExpedicao(req, res) {
    try {
      await service.atualizarProjetoExpedicao(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar expedição", error: err.message });
    }
  },
};
