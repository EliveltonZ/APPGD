const router = require('express').Router()
const c = require('../controllers/projetosSttsController')

router.get('/',        c.fillTable)  // listar_projetos_logistica
router.get('/projeto', c.getStatus)  // buscar_projeto_logistica

module.exports = router
