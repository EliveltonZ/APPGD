const router = require('express').Router()
const c = require('../controllers/pecasController')

router.get('/',     c.getPecas)      // listar_pecas
router.post('/',    c.setPecas)      // inserir_pecas (single)
router.post('/lote',c.setPecasLote)  // inserir_pecas_lote (bulk, atomic)

module.exports = router
