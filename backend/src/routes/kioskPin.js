const router = require('express').Router()
const rp = require('../middlewares/requirePermission')
const c = require('../controllers/kioskPinController')

// Tela "PIN do Terminal" em Configurações — reaproveita a permissão real
// 'acesso' (chave do JWT; config_acessos é só o nome dela no frontend).
router.get('/',       rp('acesso'), c.getPin)
router.post('/gerar', rp('acesso'), c.gerarPin)

module.exports = router
