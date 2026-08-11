const router = require('express').Router();
const repo   = require('../repositories/dashboardRepository');
const rp     = require('../middlewares/requirePermission');

function handler(fn) {
  return async (req, res) => {
    try {
      const data = await fn(req);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao carregar dashboard' });
    }
  };
}

const dash = rp('dashboard');

router.get('/projetos',           dash, handler(() => repo.getProjetosDash()));
router.get('/producao',           dash, handler(() => repo.getProducaoDash()));
router.get('/producao-detalhada', dash, handler((req) => repo.getProducaoDashDetalhada(req.query.start, req.query.end)));

module.exports = router;
