const service = require("../services/utilsService");

function handler(fn) {
  return async (req, res) => {
    try {
      const data = await fn(req);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
}

module.exports = {
  // ── Lookup tables ─────────────────────────────────────────────────────────────
  listarLiberadores:  handler(() => service.listarLiberadores()),
  listarAmbientes:    handler(() => service.listarAmbientes()),
  listarVendedores:   handler(() => service.listarVendedores()),
  listarLojas:        handler(() => service.listarLojas()),
  listarEtapas:       handler(() => service.listarEtapas()),
  listarTipoContrato: handler(() => service.listarTipoContrato()),
  listarTipoCliente:       handler(() => service.listarTipoCliente()),
  listarTiposAssistencia:  handler(() => service.listarTiposAssistencia()),
  listarCategorias:   handler(() => service.listarCategorias()),
  getMax:             handler(() => service.maxOrder()),
  getTableData:       handler((req) => service.getDado(req.query.id)),
  setDate:            handler((req) => service.setDado(req.body)),
  getOperadores:      handler(() => service.listarOperadores()),
  getCausa:           handler((req) => service.listarCausaFalha(req.query.id_falha)),
  getLojas:           handler(() => service.listarLojas()),

  // ── Migrados de RPC ───────────────────────────────────────────────────────────
  getUsuario:          handler((req) => service.buscarUsuario(req.query.id)),
  fillTableAcessorios: handler((req) => service.getAcessorios(req.query.ordemdecompra)),
  getDate:             handler((req) => service.buscarData(req.query.id)),
  setEtapa:            handler((req) => service.setEtapa(req.body.pedido, req.body.codigo)),
  getCodigoBarras:     handler((req) => service.getProjetoCodigoBarras(req.query.pedido)),
  getMontador:         handler(() => service.getMontadores()),
  validateLogin:       handler((req) => service.validateLogin(req.query.codigo, req.query.senha)),
  getSolicitacoes:     handler((req) => service.getSolicitacoes(req.query.id_montador)),
  getPecas:            handler(() => service.totalPecas()),
  getOcorrencia:       handler(() => service.getOcorrencias()),
  getFalhas:           handler(() => service.getFalhas()),
  setTipo:             handler((req) => service.setTipo(req.body.ordemdecompra, req.body.tipo, req.body.urgente)),
  getEquipSat:         handler((req) => service.listarEquipSat(req.query.id_sat)),
};
