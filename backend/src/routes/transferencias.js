'use strict';

const router = require('express').Router();
const rp     = require('../middlewares/requirePermission');
const repo   = require('../repositories/transferenciasRepository');

function handler(fn) {
  return async (req, res) => {
    try {
      res.json(await fn(req));
    } catch (err) {
      res.status(err.message.includes('insuficiente') || err.message.includes('inválid') || err.message.includes('iguais') ? 422 : 500)
        .json({ error: err.message });
    }
  };
}

router.get('/saldo/:materialId', rp('almoxarifado_transferencias'), handler((req) => repo.listarSaldo(req.params.materialId)));
router.get('/',                  rp('almoxarifado_transferencias'), handler(() => repo.listar()));
router.post('/',                 rp('almoxarifado_transferencias'), handler((req) => repo.criar(req.body, req.user?.sub)));

module.exports = router;
