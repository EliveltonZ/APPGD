const service = require("../services/pendenciasService");

module.exports = {
  async getContratoPendencias(req, res) {
    try {
      const data = await service.buscarContratoPendencia(req.query.p_contrato);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar contrato", error: err.message });
    }
  },

  async fillTableAPendencia(req, res) {
    try {
      const data = await service.getAcessoriosPendencias(req.query.p_ordemdecompra);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar acessórios pendências", error: err.message });
    }
  },

  async listAcessoriosPendencias(req, res) {
    try {
      const data = await service.listarAcessoriosPendencias(req.query.p_ordemdecompra);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar acessórios", error: err.message });
    }
  },

  async insertAcessorios(req, res) {
    try {
      await service.inserirAcessorios(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao inserir acessório", error: err.message });
    }
  },

  async delAcessorios(req, res) {
    try {
      await service.deletarAcessorio(req.body.p_id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao deletar acessório", error: err.message });
    }
  },

  async updateAcessorios(req, res) {
    try {
      await service.atualizarAcessorios(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar acessório", error: err.message });
    }
  },

  async listarCategoria(req, res) {
    try {
      const data = await service.listarCategoria();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar categorias", error: err.message });
    }
  },
};
