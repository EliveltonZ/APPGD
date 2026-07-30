const router = require('express').Router();
const repo   = require('../repositories/dashboardRepository');

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

router.get('/projetos', handler(async () => {
  return repo.getProjetosDash();
}));

router.get('/producao', handler(async () => {
  return repo.getProducaoDash();
}));

router.get('/producao-detalhada', handler(async (req) => {
  return repo.getProducaoDashDetalhada(req.query.start, req.query.end);
}));

module.exports = router;
