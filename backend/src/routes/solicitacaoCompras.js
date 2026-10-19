'use strict';
const router = require('express').Router();
const c = require('../controllers/solicitacaoComprasController');

// Orçamento e confirmação de compra — permissões reais dessa feature ainda
// não foram desenhadas (mesma decisão já tomada pra /estoque e
// /nota-fiscal). Liberado pra qualquer usuário autenticado.
router.post('/', c.postOrcamento);
router.get('/itens-abertos', c.getItensAbertos);
router.put('/itens/:itemId', c.putItem);
router.delete('/itens/:itemId', c.deleteItem);
router.post('/confirmar', c.postConfirmar);
router.get('/pedidos', c.getPedidos);
router.get('/pedidos-abertos', c.getPedidosAbertosPorFornecedor);
router.get('/:id', c.getSolicitacao);

module.exports = router;
