const router = require('express').Router()
const rp = require('../middlewares/requirePermission')
const c = require('../controllers/kioskPinController')

// Tela "PIN do Terminal" em Configurações — reaproveita config_acessos
// (mesma permissão de quem já administra acesso no sistema).
router.get('/',       rp('config_acessos'), c.getPin)
router.post('/gerar', rp('config_acessos'), c.gerarPin)

module.exports = router
