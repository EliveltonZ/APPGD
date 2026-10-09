const router = require('express').Router();
const c = require('../controllers/estoqueController');
const xmlC = require('../controllers/xmlImportacaoController');
const pedidoC = require('../controllers/pedidoItensController');

// Permissões reais da feature de estoque ainda não foram desenhadas (decisão
// explícita do usuário — "vamos ver à frente"). Por enquanto, liberado pra
// qualquer usuário autenticado (o middleware `auth` global já exige token
// válido antes de chegar aqui). Quando a chave `estoque_reservar` virar uma
// coluna real em tblUsuario, reintroduzir `rp('estoque_reservar')` em cada rota.

router.get('/alerta-minimo',        c.getAlertaMinimo);
router.get('/saldo/:materialId',    c.getSaldo);
router.put('/:id/quantidade',       c.putQuantidade);
router.post('/:id/reservar',        c.postReservar);
router.post('/:id/liberar-reserva', c.postLiberarReserva);
router.post('/:id/baixa',           c.postBaixa);

router.post('/xml/preview',   xmlC.postPreview);
router.post('/xml/vincular',  xmlC.postVincular);
router.post('/xml/confirmar', xmlC.postConfirmar);

// Tela "Itens Pedido" — lançamento direto no pedido, sem depender de uma
// importação de XML (acessório de terceiro lançado na liberação, etc.).
router.get('/pedido/buscar-contrato',      pedidoC.getBuscarContrato);
router.get('/pedido/:ordemdecompra/itens', pedidoC.getItens);
router.post('/pedido/:ordemdecompra/itens', pedidoC.postItem);
router.delete('/pedido/itens/:id',          pedidoC.deleteItem);

module.exports = router;
