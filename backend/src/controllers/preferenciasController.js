const service = require('../services/preferenciasService');

module.exports = {
  async getPreferencias(req, res, next) {
    try {
      const userId = Number(req.user.sub);
      const chaves = String(req.query.chaves ?? '')
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      if (!chaves.length) return res.json({});

      const rows = await service.buscarPreferencias(userId, chaves);
      res.json(Object.fromEntries(rows.map(r => [r.chave, r.valor])));
    } catch (err) {
      next(err);
    }
  },

  async setPreferencias(req, res, next) {
    try {
      const userId = Number(req.user.sub);
      const entries = Object.entries(req.body ?? {});

      if (!entries.length) return res.json({ ok: true });

      await service.salvarPreferencias(userId, entries);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};
