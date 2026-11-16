'use strict';
const router = require('express').Router();
const rp = require('../middlewares/requirePermission');
const c = require('../controllers/solicitacaoInternaController');

// Lado do solicitante (abrir/ver/cancelar a própria solicitação avulsa de
// produção — ferramenta, EPI, limpeza, peça de máquina etc.) — permissão
// real (`fabrica_solicitacao_interna`) ainda não foi desenhada, decisão
// explícita do usuário. Liberado pra qualquer usuário autenticado.
router.post('/', c.postCriar);
router.get('/minhas', c.getMinhas);
router.delete('/:id', c.deleteCancelar);

// Fila de pendentes é exclusiva do lado compras (tela "Necessidades de
// Compra" — decide o que vira pedido de compra).
router.get('/pendentes', rp('compras_necessidades'), c.getPendentes);

module.exports = router;
