'use strict';
const router = require('express').Router();
const c = require('../controllers/solicitacaoInternaController');

// Solicitação avulsa de produção (ferramenta, EPI, limpeza, peça de
// máquina etc.) — permissões reais ainda não foram desenhadas (mesma
// decisão já tomada pras outras features novas desta área). Liberado pra
// qualquer usuário autenticado.
router.post('/', c.postCriar);
router.get('/pendentes', c.getPendentes);
router.get('/minhas', c.getMinhas);
router.delete('/:id', c.deleteCancelar);

module.exports = router;
