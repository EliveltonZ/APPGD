'use strict';
const router = require('express').Router();
const rp = require('../middlewares/requirePermission');
const c = require('../controllers/solicitacaoComprasController');

// Orçamento (tela "Necessidades de Compra").
router.post('/', rp('compras_necessidades'), c.postOrcamento);

// Confirmação de compra (tela "Confirmar Compras").
router.get('/itens-abertos', rp('compras_confirmar'), c.getItensAbertos);
router.put('/itens/:itemId', rp('compras_confirmar'), c.putItem);
router.post('/confirmar',    rp('compras_confirmar'), c.postConfirmar);

// Cancelar item é usado tanto em Confirmar Compras quanto em Pedidos de Compra.
router.delete('/itens/:itemId', rp.any('compras_confirmar', 'compras_pedidos'), c.deleteItem);

// Tela "Pedidos de Compra".
router.get('/pedidos', rp('compras_pedidos'), c.getPedidos);

// Usado pela tela "Nota Fiscal" pra casar a NF com um pedido em aberto.
router.get('/pedidos-abertos', rp('almoxarifado_nota_fiscal'), c.getPedidosAbertosPorFornecedor);

// Cabeçalho+itens pra impressão do orçamento, aberta tanto a partir de
// Necessidades quanto de Confirmar Compras.
router.get('/:id', rp.any('compras_necessidades', 'compras_confirmar'), c.getSolicitacao);

module.exports = router;
