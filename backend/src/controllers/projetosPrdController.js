const prdService   = require("../services/producaoService");
const projetosSvc  = require("../services/projetosService");

module.exports = {
  async fillTable(req, res) {
    try {
      const data = await prdService.listarProjetosProducao();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar projetos produção", error: err.message });
    }
  },

  async getProducao(req, res) {
    try {
      const data = await prdService.buscarProjetoProducao(Number(req.query.id));
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar projeto produção", error: err.message });
    }
  },

  async getProducaoBarcode(req, res) {
    try {
      const data = await prdService.buscarProducaoPorPedido(Number(req.query.p_pedido));
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar por pedido", error: err.message });
    }
  },

  async getMateriais(req, res) {
    try {
      const data = await prdService.listarAcessorios(Number(req.query.id));
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar materiais", error: err.message });
    }
  },

  async setDataProducao(req, res) {
    try {
      await prdService.atualizarDadosProducao(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar produção", error: err.message });
    }
  },

  async getCapaProducao(req, res) {
    try {
      const data = await projetosSvc.buscarCapaProducao(Number(req.query.id));
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar capa", error: err.message });
    }
  },
};
