const router = require('express').Router();
const rp = require('../middlewares/requirePermission');
const c = require('../controllers/estoqueController');

router.get('/alerta-minimo',        rp('estoque_reservar'), c.getAlertaMinimo);
router.get('/saldo/:materialId',    rp('estoque_reservar'), c.getSaldo);
router.post('/:id/reservar',        rp('estoque_reservar'), c.postReservar);
router.post('/:id/liberar-reserva', rp('estoque_reservar'), c.postLiberarReserva);
router.post('/:id/baixa',           rp('estoque_reservar'), c.postBaixa);

module.exports = router;
