const router = require('express').Router();
const rp = require('../middlewares/requirePermission');
const c = require('../controllers/estoqueController');
const xmlC = require('../controllers/xmlImportacaoController');

router.get('/alerta-minimo',        rp('estoque_reservar'), c.getAlertaMinimo);
router.get('/saldo/:materialId',    rp('estoque_reservar'), c.getSaldo);
router.put('/:id/quantidade',       rp('estoque_reservar'), c.putQuantidade);
router.post('/:id/reservar',        rp('estoque_reservar'), c.postReservar);
router.post('/:id/liberar-reserva', rp('estoque_reservar'), c.postLiberarReserva);
router.post('/:id/baixa',           rp('estoque_reservar'), c.postBaixa);

router.post('/xml/preview',   rp('estoque_reservar'), xmlC.postPreview);
router.post('/xml/vincular',  rp('estoque_reservar'), xmlC.postVincular);
router.post('/xml/confirmar', rp('estoque_reservar'), xmlC.postConfirmar);

module.exports = router;
