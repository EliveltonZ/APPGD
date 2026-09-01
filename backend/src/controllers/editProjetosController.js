const service = require("../services/projetosService");
const { podeAcessarTipo } = require("../utils/permissoesProjeto");

module.exports = {
  async getEditProjetos(req, res) {
    try {
      const data = await service.buscarParaEditar(Number(req.query.id));
      const registro = data[0];
      if (registro && !podeAcessarTipo(req.user.permissoes, registro.tipo_projeto, 'editar_pedido')) {
        return res.status(403).json({ message: 'Acesso negado: permissão insuficiente' });
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar projeto", error: err.message });
    }
  },

  async setEditProjetos(req, res) {
    try {
      const tipoAtual = await service.buscarTipoProjeto(req.body.ordemdecompra);
      if (tipoAtual && !podeAcessarTipo(req.user.permissoes, tipoAtual, 'editar_pedido')) {
        return res.status(403).json({ message: 'Acesso negado: permissão insuficiente' });
      }
      await service.atualizarProjeto(req.body);
      res.json({ success: true });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError' && err.fields?.numero_solicitacao) {
        return res.status(409).json({ message: 'Número de solicitação já cadastrado.' });
      }
      res.status(500).json({ message: "Erro ao atualizar projeto", error: err.message });
    }
  },
};
