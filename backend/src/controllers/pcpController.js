const service = require("../services/pcpService");

function ok(res, data) { res.json(data); }
function err(res, msg, e) { res.status(500).json({ message: msg, error: e.message }); }

module.exports = {
  async getProjetoPcp(req, res) {
    try { ok(res, await service.buscarProjetoPcp(req.query.id)); }
    catch (e) { err(res, "Erro ao buscar projeto PCP", e); }
  },

  async getLastLote(req, res) {
    try { ok(res, await service.buscarUltimoLote()); }
    catch (e) { err(res, "Erro ao buscar último lote", e); }
  },

  async getProjetosLote(req, res) {
    try { ok(res, await service.listarProjetosLote()); }
    catch (e) { err(res, "Erro ao listar projetos lote", e); }
  },

  async getLotes(req, res) {
    try { ok(res, await service.listarLotes()); }
    catch (e) { err(res, "Erro ao listar lotes", e); }
  },

  async setStartLote(req, res) {
    try {
      await service.atualizarIniciarLote(req.body.p_lote, req.body.p_iniciado ?? req.body.p_datainicio ?? null);
      ok(res, { success: true });
    } catch (e) { err(res, "Erro ao iniciar lote", e); }
  },

  async setLote(req, res) {
    try {
      await service.atualizarLote(req.body.p_ordemdecompra, req.body.p_lote);
      ok(res, { success: true });
    } catch (e) { err(res, "Erro ao atualizar lote", e); }
  },

  async setProjetoPcp(req, res) {
    try {
      await service.atualizarProjetoPcp(req.body);
      ok(res, { success: true });
    } catch (e) { err(res, "Erro ao atualizar projeto PCP", e); }
  },

  async exportarDados(req, res) {
    try {
      ok(res, await service.exportarProjetosPeriodo(req.query.dataInicial, req.query.dataFinal));
    } catch (e) { err(res, "Erro ao exportar dados", e); }
  },

  async getCards(req, res) {
    try { ok(res, await service.buscarPcpCard()); }
    catch (e) { err(res, "Erro ao buscar cards PCP", e); }
  },
};
