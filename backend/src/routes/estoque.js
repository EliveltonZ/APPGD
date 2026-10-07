const router = require('express').Router();
const express = require('express');
const rp = require('../middlewares/requirePermission');
const c = require('../controllers/estoqueController');
const xmlC = require('../controllers/xmlImportacaoController');

// XML pode vir grande (projetos com muitos componentes) — limite maior que o
// express.json() global, e como texto puro (evita escapar o XML inteiro em JSON).
const corpoXml = express.text({ type: '*/*', limit: '20mb' });

router.get('/alerta-minimo',        rp('estoque_reservar'), c.getAlertaMinimo);
router.get('/saldo/:materialId',    rp('estoque_reservar'), c.getSaldo);
router.put('/:id/quantidade',       rp('estoque_reservar'), c.putQuantidade);
router.post('/:id/reservar',        rp('estoque_reservar'), c.postReservar);
router.post('/:id/liberar-reserva', rp('estoque_reservar'), c.postLiberarReserva);
router.post('/:id/baixa',           rp('estoque_reservar'), c.postBaixa);

router.post('/xml/preview',   rp('estoque_reservar'), corpoXml, xmlC.postPreview);
router.post('/xml/confirmar', rp('estoque_reservar'), xmlC.postConfirmar);

module.exports = router;
