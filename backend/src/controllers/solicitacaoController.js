const service = require("../services/solicitacaoService");

function ok(res, data) { res.json(data); }
function err(res, msg, e) { res.status(500).json({ message: msg, error: e.message }); }

module.exports = {
  async getConfig(req, res) {
    try { ok(res, await service.getConfig()); }
    catch (e) { err(res, "Erro ao buscar config", e); }
  },

  async setEquipSat(req, res) {
    try {
      await service.inserirEquipeSat(req.body.p_id_sat, req.body.p_id_montador);
      ok(res, { success: true });
    } catch (e) { err(res, "Erro ao inserir equipe", e); }
  },

  async getPecas(req, res) {
    try { ok(res, await service.getPecas(req.query.p_id_assistencia)); }
    catch (e) { err(res, "Erro ao buscar peças", e); }
  },

  async getFalhas(req, res) {
    try { ok(res, await service.listarFalhas()); }
    catch (e) { err(res, "Erro ao listar falhas", e); }
  },

  async getOcorrencias(req, res) {
    try { ok(res, await service.listarOcorrencias()); }
    catch (e) { err(res, "Erro ao listar ocorrências", e); }
  },

  async getMontadores(req, res) {
    try { ok(res, await service.listarMontadores()); }
    catch (e) { err(res, "Erro ao listar montadores", e); }
  },

  async getContratoAssist(req, res) {
    try { ok(res, await service.buscarContratoAssistencia(req.query.p_contrato)); }
    catch (e) { err(res, "Erro ao buscar contrato assistência", e); }
  },
};
