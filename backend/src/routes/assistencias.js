const router = require('express').Router()
const c  = require('../controllers/assistenciasController')
const rp = require('../middlewares/requirePermission')

router.get('/',             c.getAssistencias)
router.get('/projeto',      c.getAssistencia)
router.get('/capa',         c.getCapaAssistencia)
router.post('/',            rp.any('producao_assistencia', 'logistica_assistencia'), c.setAssistencia)
router.post('/solicitacao', rp('nova_solicitacao'), c.setNewOrder)
router.post('/completa',    rp('nova_solicitacao'), c.setNewOrderCompleta)

module.exports = router
