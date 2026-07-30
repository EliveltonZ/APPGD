const router = require('express').Router()
const c = require('../controllers/assistenciasController')

router.get('/',            c.getAssistencias)    // listar_assistencias
router.get('/projeto',     c.getAssistencia)     // buscar_assistencia
router.post('/',           c.setAssistencia)     // atualizar_assistencia
router.get('/capa',        c.getCapaAssistencia) // buscar_capa_assistencia
router.post('/solicitacao', c.setNewOrder)          // inserir_solicitacao
router.post('/completa',   c.setNewOrderCompleta)  // inserir_solicitacao_completa

module.exports = router
