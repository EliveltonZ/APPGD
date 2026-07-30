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
  listarTipoCliente:  handler(() => service.listarTipoCliente()),
  listarCategorias:   handler(() => service.listarCategorias()),
  getMax:             handler(() => service.maxOrder()),
  getTableData:       handler((req) => service.getDado(req.query.p_id)),
  setDate:            handler((req) => service.setDado(req.body)),
  getOperadores:      handler(() => service.listarOperadores()),
  getCausa:           handler((req) => service.listarCausaFalha(req.query.p_id_falha)),
  getLojas:           handler(() => service.listarLojas()),

  // ── Migrados de RPC ───────────────────────────────────────────────────────────
  getUsuario:          handler((req) => service.buscarUsuario(req.query.p_id)),
  fillTableAcessorios: handler((req) => service.getAcessorios(req.query.p_ordemdecompra)),
  getDate:             handler((req) => service.buscarData(req.query.p_id)),
  setEtapa:            handler((req) => service.setEtapa(req.body.p_pedido, req.body.p_codigo)),
  getCodigoBarras:     handler((req) => service.getProjetoCodigoBarras(req.query.p_pedido)),
  getMontador:         handler(() => service.getMontadores()),
  validateLogin:       handler((req) => service.validateLogin(req.query.p_codigo, req.query.p_senha)),
  getSolicitacoes:     handler((req) => service.getSolicitacoes(req.query.p_id_montador)),
  getPecas:            handler(() => service.totalPecas()),
  getOcorrencia:       handler(() => service.getOcorrencias()),
  getFalhas:           handler(() => service.getFalhas()),
  setTipo:             handler((req) => service.setTipo(req.body.p_ordemdecompra, req.body.p_tipo, req.body.p_urgente)),
  getEquipSat:         handler((req) => service.listarEquipSat(req.query.p_id_sat)),
};
