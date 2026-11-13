const service = require("../services/assistenciasService");

function ok(res, data)      { res.json(data); }
function err(res, msg, e)   { res.status(500).json({ message: msg, error: e.message }); }

module.exports = {
  async getAssistencias(req, res) {
    try { ok(res, await service.listarAssistencias(req.query.data)); }
    catch (e) { err(res, "Erro ao listar assistências", e); }
  },

  async getAssistencia(req, res) {
    try { ok(res, await service.buscarAssistencia(req.query.solicitacao)); }
    catch (e) { err(res, "Erro ao buscar assistência", e); }
  },

  async setAssistencia(req, res) {
    try {
      await service.atualizarAssistencia(req.body);
      ok(res, { success: true });
    } catch (e) { err(res, "Erro ao atualizar assistência", e); }
  },

  async getCapaAssistencia(req, res) {
    try { ok(res, await service.buscarCapaAssistencia(req.query.solicitacao)); }
    catch (e) { err(res, "Erro ao buscar capa assistência", e); }
  },
};
