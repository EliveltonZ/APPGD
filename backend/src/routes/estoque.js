const router = require('express').Router();
const rp = require('../middlewares/requirePermission');
const c = require('../controllers/estoqueController');
const xmlC = require('../controllers/xmlImportacaoController');
const pedidoC = require('../controllers/pedidoItensController');

// `estoque_reservar` (tela "Validar XML") já tem coluna real em tblUsuario.
router.post('/xml/preview',   rp('estoque_reservar'), xmlC.postPreview);
router.post('/xml/vincular',  rp('estoque_reservar'), xmlC.postVincular);
router.post('/xml/confirmar', rp('estoque_reservar'), xmlC.postConfirmar);

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
// Ações por item (definir quantidade/liberar/cancelar/baixa) — mesmo
// PendingControlModal embutido em Itens Pedido, Baixas e Liberações, sem
// diferenciar botão por tela (ver comentário mais abaixo).
router.put('/:id/quantidade',          rp.any('compras_pendencias', 'almoxarifado_baixas', 'compras_liberacoes'), c.putQuantidade);
router.post('/:id/liberar',            rp.any('compras_pendencias', 'almoxarifado_baixas', 'compras_liberacoes'), c.postLiberar);
router.post('/:id/cancelar-liberacao', rp.any('compras_pendencias', 'almoxarifado_baixas', 'compras_liberacoes'), c.postCancelarLiberacao);
router.post('/:id/baixa',              rp.any('compras_pendencias', 'almoxarifado_baixas', 'compras_liberacoes'), c.postBaixa);

// Ajuste de estoque por contagem (inventário periódico) — informa o saldo
// atual de um material numa localização, e lança a diferença contra o que
// foi contado de verdade.
router.get('/ajuste/saldo/:materialId/:localizacaoId', rp('almoxarifado_ajuste'), c.getSaldoLocalizacao);
router.post('/ajuste',                                 rp('almoxarifado_ajuste'), c.postAjuste);
router.get('/ajuste/historico',                        rp('almoxarifado_ajuste'), c.getHistoricoAjustes);

// Itens do pedido (tblXmlConsumo) — lançamento/consulta direto no pedido,
// sem depender de importação de XML. Esse grupo de rotas é lido/escrito
// por bem mais telas do que só "Itens Pedido": o mesmo PendingControlModal
// é embutido em Itens Pedido (compras_pendencias), Baixas
// (almoxarifado_baixas) e Liberações (compras_liberacoes) sem diferenciar
// por tela, e a listagem (GET itens) ainda é lida, só pra exibição, pelos
// modais de Previsão/Status/Expedição/Produção (4 permissões totalmente
// diferentes). Solicitação Interna (fabrica_solicitacao_interna, sem
// coluna real ainda) também usa buscar-contrato/inserir item pra abrir uma
// pendência avulsa. Com essa variedade — e uma permissão ainda não
// reforçada no meio — fica sem dono único pra gatekeeping real; mantido
// liberado pra qualquer autenticado, como já era antes.
router.get('/pedido/buscar-contrato',      pedidoC.getBuscarContrato);
router.get('/pedido/:ordemdecompra/itens', pedidoC.getItens);
router.post('/pedido/:ordemdecompra/itens', pedidoC.postItem);
router.delete('/pedido/itens/:id',          pedidoC.deleteItem);

// Liberação em lote — por pedido inteiro ou por todos os pedidos do mesmo
// lote de corte. Item por item (não trava tudo se um item ainda não tiver
// quantidade definida). Mesmo PendingControlModal das 3 telas acima.
router.post('/pedido/:ordemdecompra/liberar-tudo', rp.any('compras_pendencias', 'almoxarifado_baixas', 'compras_liberacoes'), c.postLiberarPedido);
router.post('/pedido/:ordemdecompra/liberar-lote', rp.any('compras_pendencias', 'almoxarifado_baixas', 'compras_liberacoes'), c.postLiberarLote);

// Baixa em cascata — dá baixa de todo item pendente/liberado do pedido de
// uma vez (nunca bloqueia por saldo); só exige que chapa/fita já tenha
// quantidade em UN definida.
router.post('/pedido/:ordemdecompra/baixar-tudo', rp.any('compras_pendencias', 'almoxarifado_baixas', 'compras_liberacoes'), c.postBaixarPedidoCompleto);

module.exports = router;
