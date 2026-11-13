const router = require('express').Router()
const c = require('../controllers/comprasController')

router.get('/',  c.getAcessoriosCompras)  // listar_acessorios_compras
router.post('/', c.setAcessorios)         // atualizar_acessorios

module.exports = router
