const service = require("../services/projetosService");

module.exports = {
  async selectContract(req, res) {
    try {
      const data = await service.buscarPorContrato(req.query.contrato);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar contrato", error: err.message });
    }
  },

  async listClients(req, res) {
    try {
      const data = await service.listarClientes();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar clientes", error: err.message });
    }
  },

  async listTiposCliente(req, res) {
    try {
      const data = await service.listarTiposCliente();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao listar tipos de cliente", error: err.message });
    }
  },

  async createProject(req, res) {
    try {
      await service.inserirProjeto(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao criar projeto", error: err.message });
    }
  },

  async createClient(req, res) {
    try {
      const data = await service.inserirCliente(req.body);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao criar cliente", error: err.message });
    }
  },
};
