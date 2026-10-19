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
router.get('/lista-compras',        c.getListaCompras);
router.get('/pronto-para-baixa',    c.getProntoParaBaixa);
router.get('/lista-separacao/:ordemdecompra', c.getListaSeparacao);
router.get('/saldo-materiais',      c.getSaldoPorMaterial);
router.get('/saldo/:materialId',    c.getSaldo);
router.get('/saldo-localizacoes/:materialId', c.getSaldoLocalizacoes);
router.put('/:id/quantidade',       c.putQuantidade);
router.post('/:id/reservar',        c.postReservar);
router.post('/:id/liberar-reserva', c.postLiberarReserva);
router.post('/:id/baixa',           c.postBaixa);

// Ajuste de estoque por contagem (inventário periódico) — informa o saldo
// atual de um material numa localização, e lança a diferença contra o que
// foi contado de verdade.
router.get('/ajuste/saldo/:materialId/:localizacaoId', c.getSaldoLocalizacao);
router.post('/ajuste',                                 c.postAjuste);
router.get('/ajuste/historico',                        c.getHistoricoAjustes);

router.post('/xml/preview',   xmlC.postPreview);
router.post('/xml/vincular',  xmlC.postVincular);
router.post('/xml/confirmar', xmlC.postConfirmar);

// Tela "Itens Pedido" — lançamento direto no pedido, sem depender de uma
// importação de XML (acessório de terceiro lançado na liberação, etc.).
router.get('/pedido/buscar-contrato',      pedidoC.getBuscarContrato);
router.get('/pedido/:ordemdecompra/itens', pedidoC.getItens);
router.post('/pedido/:ordemdecompra/itens', pedidoC.postItem);
router.delete('/pedido/itens/:id',          pedidoC.deleteItem);

// Reserva em lote — por pedido inteiro ou por todos os pedidos do mesmo
// lote de corte. Reaproveita a mesma validação de saldo do reservar
// individual, item por item (não trava tudo se um material faltar saldo).
router.post('/pedido/:ordemdecompra/reservar-tudo', c.postReservarPedido);
router.post('/pedido/:ordemdecompra/reservar-lote', c.postReservarLote);

module.exports = router;
