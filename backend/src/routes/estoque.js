const router = require('express').Router();
const rp = require('../middlewares/requirePermission');
const c = require('../controllers/estoqueController');
const xmlC = require('../controllers/xmlImportacaoController');
const pedidoC = require('../controllers/pedidoItensController');

// `estoque_reservar` (tela "Validar XML") ainda não tem coluna real em
// tblUsuario — decisão explícita do usuário, mantida por enquanto. Liberado
// pra qualquer usuário autenticado.
router.post('/xml/preview',   xmlC.postPreview);
router.post('/xml/vincular',  xmlC.postVincular);
router.post('/xml/confirmar', xmlC.postConfirmar);

// `/lista-separacao` é usada só pela impressão (/impressao/lista-separacao,
// aberta a partir da Expedição já autenticada) — sem permissão própria,
// mesmo padrão dos outros `/impressao/*`.
router.get('/lista-separacao/:ordemdecompra', c.getListaSeparacao);

// `/alerta-minimo` e `/saldo/:materialId` não têm nenhuma tela que os chame
// hoje — sem dono claro, protegidos com `almoxarifado_estoque` (mesmo
// domínio) por padrão defensivo.
router.get('/alerta-minimo',     rp('almoxarifado_estoque'), c.getAlertaMinimo);
router.get('/saldo/:materialId', rp('almoxarifado_estoque'), c.getSaldo);

router.get('/lista-compras',        rp('compras_necessidades'), c.getListaCompras);
router.get('/pronto-para-baixa',    rp('almoxarifado_baixas'), c.getProntoParaBaixa);
router.get('/pendentes-liberados',  rp('compras_liberacoes'), c.getPendentesLiberados);
router.get('/saldo-materiais',      rp('almoxarifado_estoque'), c.getSaldoPorMaterial);
router.get('/saldo-localizacoes/:materialId', rp('almoxarifado_estoque'), c.getSaldoLocalizacoes);
router.put('/:id/quantidade',          rp('compras_liberacoes'), c.putQuantidade);
router.post('/:id/liberar',            rp('compras_liberacoes'), c.postLiberar);
// Cancelar liberação é usado tanto na tela de Liberações quanto na de Baixas
// (pra desfazer antes de dar baixa).
router.post('/:id/cancelar-liberacao', rp.any('compras_liberacoes', 'almoxarifado_baixas'), c.postCancelarLiberacao);
router.post('/:id/baixa',              rp('almoxarifado_baixas'), c.postBaixa);

// Ajuste de estoque por contagem (inventário periódico) — informa o saldo
// atual de um material numa localização, e lança a diferença contra o que
// foi contado de verdade.
router.get('/ajuste/saldo/:materialId/:localizacaoId', rp('almoxarifado_ajuste'), c.getSaldoLocalizacao);
router.post('/ajuste',                                 rp('almoxarifado_ajuste'), c.postAjuste);
router.get('/ajuste/historico',                        rp('almoxarifado_ajuste'), c.getHistoricoAjustes);

// Tela "Itens Pedido" — lançamento direto no pedido, sem depender de uma
// importação de XML (acessório de terceiro lançado na liberação, etc.).
router.get('/pedido/buscar-contrato',      rp('compras_pendencias'), pedidoC.getBuscarContrato);
router.get('/pedido/:ordemdecompra/itens', rp('compras_pendencias'), pedidoC.getItens);
router.post('/pedido/:ordemdecompra/itens', rp('compras_pendencias'), pedidoC.postItem);
router.delete('/pedido/itens/:id',          rp('compras_pendencias'), pedidoC.deleteItem);

// Liberação em lote — por pedido inteiro ou por todos os pedidos do mesmo
// lote de corte. Item por item (não trava tudo se um item ainda não tiver
// quantidade definida).
router.post('/pedido/:ordemdecompra/liberar-tudo', rp('compras_liberacoes'), c.postLiberarPedido);
router.post('/pedido/:ordemdecompra/liberar-lote', rp('compras_liberacoes'), c.postLiberarLote);

// Baixa em cascata — dá baixa de todo item pendente/liberado do pedido de
// uma vez (nunca bloqueia por saldo); só exige que chapa/fita já tenha
// quantidade em UN definida.
router.post('/pedido/:ordemdecompra/baixar-tudo', rp('almoxarifado_baixas'), c.postBaixarPedidoCompleto);

module.exports = router;
