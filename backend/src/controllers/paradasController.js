const service = require('../services/paradasService');

function ok(res, result) {
  if (result === null) return res.status(404).json({ error: 'Registro não encontrado' });
  res.json(result);
}

function fail(res, e) {
  if (e.code === 'MAQUINA_EM_PARADA' || e.code === 'SEM_PARADA_ABERTA') {
    return res.status(409).json({ error: e.message });
  }
  if (e.code === 'VALIDACAO') {
    return res.status(400).json({ error: e.message });
  }
  console.error('[paradas]', e);
  res.status(500).json({ error: e.message });
}

module.exports = {
  async getMaquinas(req, res) {
    try { ok(res, await service.listarMaquinas()); } catch (e) { fail(res, e); }
  },

  async getTipos(req, res) {
    try { ok(res, await service.listarTipos()); } catch (e) { fail(res, e); }
  },

  async getBuscarPedido(req, res) {
    try { ok(res, await service.buscarPedido(Number(req.query.tipo), Number(req.query.pedido))); }
    catch (e) { fail(res, e); }
  },

  async getAberta(req, res) {
    try { ok(res, await service.buscarAberta(Number(req.params.id_maquina))); }
    catch (e) { fail(res, e); }
  },

  async getAbertas(req, res) {
    try { ok(res, await service.listarAbertas()); } catch (e) { fail(res, e); }
  },

  async getListar(req, res) {
    try {
      ok(res, await service.listarTodas({
        data_inicio_de:  req.query.data_inicio_de,
        data_inicio_ate: req.query.data_inicio_ate,
        id_maquina:      req.query.id_maquina,
      }));
    } catch (e) { fail(res, e); }
  },

  async postIniciar(req, res) {
    try {
      const { pedido, id_maquina, id_tipo } = req.body;
      ok(res, await service.iniciar({ pedido, id_maquina, id_tipo, id_usuario: req.user.sub }));
    } catch (e) { fail(res, e); }
  },

  async postFinalizar(req, res) {
    try { ok(res, await service.finalizar(req.body.id_maquina)); } catch (e) { fail(res, e); }
  },

  async getAdminListar(req, res) {
    try {
      ok(res, await service.listarTodas({
        data_inicio_de:  req.query.data_inicio_de,
        data_inicio_ate: req.query.data_inicio_ate,
        id_maquina:      req.query.id_maquina,
      }));
    } catch (e) { fail(res, e); }
  },

  async putAdminEditar(req, res) {
    try { ok(res, await service.editarParada(Number(req.params.id), req.body, req.user.sub)); }
    catch (e) { fail(res, e); }
  },

  async getAdminHistorico(req, res) {
    try { ok(res, await service.listarHistorico(req.params.id)); } catch (e) { fail(res, e); }
  },
};
