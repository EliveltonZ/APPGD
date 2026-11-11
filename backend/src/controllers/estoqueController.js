const service = require('../services/estoqueService');

function notFound(res) {
  return res.status(404).json({ error: 'Registro não encontrado.' });
}

module.exports = {
  async getSaldo(req, res, next) {
    try {
      const materialId = Number(req.params.materialId);
      res.json(await service.calcularSaldo(materialId));
    } catch (err) { next(err); }
  },

  async getAlertaMinimo(req, res, next) {
    try {
      res.json(await service.listarAlertaMinimo());
    } catch (err) { next(err); }
  },

  async getListaCompras(req, res, next) {
    try {
      res.json(await service.listarListaCompras());
    } catch (err) { next(err); }
  },

  async getProntoParaBaixa(req, res, next) {
    try {
      res.json(await service.listarProntoParaBaixa());
    } catch (err) { next(err); }
  },

  async getListaSeparacao(req, res, next) {
    try {
      res.json(await service.listarItensPedidoParaSeparacao(req.params.ordemdecompra));
    } catch (err) { next(err); }
  },

  async getSaldoPorMaterial(req, res, next) {
    try {
      res.json(await service.listarSaldoPorMaterial());
    } catch (err) { next(err); }
  },

  async putQuantidade(req, res, next) {
    try {
      const linha = await service.definirQuantidade(Number(req.params.id), req.body.qtd_un_confirmada);
      if (!linha) return notFound(res);
      res.json(linha);
    } catch (err) { next(err); }
  },

  async postLiberar(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      const linha = await service.liberar(Number(req.params.id), usuarioId);
      if (!linha) return notFound(res);
      res.json(linha);
    } catch (err) { next(err); }
  },

  async postLiberarPedido(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      res.json(await service.liberarPedido(Number(req.params.ordemdecompra), usuarioId));
    } catch (err) { next(err); }
  },

  async postLiberarLote(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      res.json(await service.liberarLote(Number(req.params.ordemdecompra), usuarioId));
    } catch (err) { next(err); }
  },

  async postCancelarLiberacao(req, res, next) {
    try {
      const linha = await service.cancelarLiberacao(Number(req.params.id));
      if (!linha) return notFound(res);
      res.json(linha);
    } catch (err) { next(err); }
  },

  async postBaixa(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      const linha = await service.darBaixa(Number(req.params.id), {
        qtd: req.body.qtd_un_baixada,
        usuarioId,
      });
      if (!linha) return notFound(res);
      res.json(linha);
    } catch (err) { next(err); }
  },

  async postBaixarPedidoCompleto(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      res.json(await service.baixarPedidoCompleto(Number(req.params.ordemdecompra), usuarioId));
    } catch (err) { next(err); }
  },

  async getSaldoLocalizacao(req, res, next) {
    try {
      const materialId = Number(req.params.materialId);
      const localizacaoId = Number(req.params.localizacaoId);
      res.json({ saldo: await service.saldoPorLocalizacao(materialId, localizacaoId) });
    } catch (err) { next(err); }
  },

  async getSaldoLocalizacoes(req, res, next) {
    try {
      const materialId = Number(req.params.materialId);
      res.json(await service.saldoPorLocalizacoes(materialId));
    } catch (err) { next(err); }
  },

  async postAjuste(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      const { material_id, localizacao_id, contagem, observacoes, preco_un } = req.body;
      res.json(await service.ajustarEstoque({
        materialId: material_id,
        localizacaoId: localizacao_id,
        contagem,
        observacoes,
        precoUn: preco_un,
        usuarioId,
      }));
    } catch (err) { next(err); }
  },

  async getHistoricoAjustes(req, res, next) {
    try {
      res.json(await service.listarHistoricoAjustes());
    } catch (err) { next(err); }
  },
};
