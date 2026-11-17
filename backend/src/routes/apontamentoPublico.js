const router = require('express').Router()
const kioskAuth = require('../middlewares/kioskAuth')
const apt = require('../controllers/apontamentoController')
const c = require('../controllers/apontamentoPublicoController')

// Terminal de apontamento sem login — montado FORA do middleware `auth`
// global (ver routes/index.js), protegido só pelo PIN do terminal
// (kioskAuth). Reaproveita os mesmos handlers de /apontamento (mesma
// lógica de busca de pedido e gravação), só a identificação do operador
// muda: em vez de digitar o ID, lê o crachá (hash) e resolve pra cá.
router.use(kioskAuth)

// Usado só pela tela de configuração do terminal, pra validar um PIN
// antes de salvá-lo — sem efeito colateral nenhum.
router.get('/ping', (_req, res) => res.json({ ok: true }))

router.get('/pedido',   apt.getPedido)
router.post('/dados',   apt.setDados)
router.get('/operador', c.getOperador)

module.exports = router
