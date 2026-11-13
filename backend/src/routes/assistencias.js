const router = require('express').Router()
const c  = require('../controllers/assistenciasController')
const rp = require('../middlewares/requirePermission')

router.get('/',             c.getAssistencias)
router.get('/projeto',      c.getAssistencia)
router.get('/capa',         c.getCapaAssistencia)
router.post('/',            rp.any('producao_assistencia', 'logistica_assistencia'), c.setAssistencia)

module.exports = router
