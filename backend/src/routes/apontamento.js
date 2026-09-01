const router = require('express').Router()
const rp     = require('../middlewares/requirePermission')
const c      = require('../controllers/apontamentoController')

const apt = rp('apontamento')

// Busca pedido pelo número (leitura de barcode)
router.get('/pedido', apt, c.getPedido)

// Salva dados de apontamento (mesmo payload que /producao/dados)
router.post('/dados', apt, c.setDados)

module.exports = router
