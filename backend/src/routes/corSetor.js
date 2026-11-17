const router = require('express').Router()
const rp = require('../middlewares/requirePermission')
const c = require('../controllers/corSetorController')

// Cores por setor usadas na impressão de crachás — mesma permissão da tela
// (cadastros_impressao_cracha, no frontend, piggyback em cadastros_usuarios).
router.get('/',  rp('cadastros_usuarios'), c.listar)
router.post('/', rp('cadastros_usuarios'), c.salvar)

module.exports = router
