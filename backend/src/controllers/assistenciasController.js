const service = require("../services/assistenciasService");

function ok(res, data)      { res.json(data); }
function err(res, msg, e)   { res.status(500).json({ message: msg, error: e.message }); }

module.exports = {
  async getAssistencias(req, res) {
    try { ok(res, await service.listarAssistencias(req.query.p_data)); }
    catch (e) { err(res, "Erro ao listar assistências", e); }
  },

  async getAssistencia(req, res) {
    try { ok(res, await service.buscarAssistencia(req.query.p_solicitacao)); }
    catch (e) { err(res, "Erro ao buscar assistência", e); }
  },

  async setAssistencia(req, res) {
    try {
      await service.atualizarAssistencia(req.body);
      ok(res, { success: true });
    } catch (e) { err(res, "Erro ao atualizar assistência", e); }
  },

  async getCapaAssistencia(req, res) {
    try { ok(res, await service.buscarCapaAssistencia(req.query.p_solicitacao)); }
    catch (e) { err(res, "Erro ao buscar capa assistência", e); }
  },

  async setNewOrder(req, res) {
    try { ok(res, await service.inserirSolicitacao(req.body)); }
    catch (e) { err(res, "Erro ao inserir solicitação", e); }
  },

  async setNewOrderCompleta(req, res) {
    try { ok(res, await service.inserirSolicitacaoCompleta(req.body)); }
    catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Número de solicitação já cadastrado.' });
      }
      err(res, "Erro ao inserir solicitação completa", e);
    }
  },
};
