'use strict';
const router = require('express').Router();
const parser = require('../services/xmlLogisticaAnaliseTemp');

// Rota TEMPORÁRIA — só pra tela de análise ver o que o XML "LISTING" (pasta
// "xml logistica") retorna, nada é gravado no banco. Remover junto com a
// tela (frontend/src/pages/XmlLogisticaAnaliseTemp) quando a decisão sobre
// aproveitar ou não essa fonte estiver tomada.
router.post('/parse', (req, res) => {
  try {
    res.json(parser.parse(req.body.xml));
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Erro ao processar XML.' });
  }
});

module.exports = router;
