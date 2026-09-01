const service = require("../services/projetosService");
const { podeAcessarTipo } = require("../utils/permissoesProjeto");

module.exports = {
  async getDeleteProjetos(req, res) {
    try {
      const data = await service.buscarParaDeletar(Number(req.query.ordemdecompra));
      const registro = data[0];
      if (registro && !podeAcessarTipo(req.user.permissoes, registro.tipo_projeto, 'excluir_pedido')) {
        return res.status(403).json({ message: 'Acesso negado: permissão insuficiente' });
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar projeto", error: err.message });
    }
  },

  async setDeleteProjeto(req, res) {
    try {
      const tipoAtual = await service.buscarTipoProjeto(req.body.ordemdecompra);
      if (tipoAtual && !podeAcessarTipo(req.user.permissoes, tipoAtual, 'excluir_pedido')) {
        return res.status(403).json({ message: 'Acesso negado: permissão insuficiente' });
      }
      await service.deletarProjeto(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erro ao excluir projeto", error: err.message });
    }
  },
};
