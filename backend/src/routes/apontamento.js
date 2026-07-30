const router = require('express').Router()
const rp     = require('../middlewares/requirePermission')
const repo   = require('../repositories/producaoRepository')

const apt = rp('apontamento')

// Busca pedido pelo número (leitura de barcode)
router.get('/pedido', apt, async (req, res, next) => {
  try {
    const pedido = req.query.p_pedido
    if (!pedido) return res.status(400).json({ error: 'p_pedido obrigatório' })
    const rows = await repo.buscarProducaoPorPedido(pedido)
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// Salva dados de apontamento (mesmo payload que /producao/dados)
router.post('/dados', apt, async (req, res, next) => {
  try {
    await repo.atualizarDadosProducao(req.body)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
