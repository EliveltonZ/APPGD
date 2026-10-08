const service = require('../services/xmlImportacaoService');

module.exports = {
  async postPreview(req, res, next) {
    try {
      const xmlString = req.body?.xml;
      if (!xmlString) {
        return res.status(400).json({ error: 'Envie o conteúdo do XML no corpo da requisição.' });
      }
      res.json(await service.previsualizar(xmlString));
    } catch (err) { next(err); }
  },

  async postVincular(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      const { referencia_promob, material_id } = req.body;
      res.json(await service.vincularReferencia({
        referenciaPromob: referencia_promob, materialId: material_id, usuarioId,
      }));
    } catch (err) { next(err); }
  },

  async postConfirmar(req, res, next) {
    try {
      const usuarioId = Number(req.user.sub);
      const { ordemdecompra, arquivo_nome, itens } = req.body;
      const importacao = await service.confirmar({
        ordemdecompra, arquivoNome: arquivo_nome, usuarioId, itens,
      });
      res.json(importacao);
    } catch (err) { next(err); }
  },
};
