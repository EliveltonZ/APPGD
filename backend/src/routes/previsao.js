const router = require('express').Router()
const c = require('../controllers/projetosPrevController')

router.get('/',        c.fillTablePrevisao)  // listar_projetos_previsao
router.get('/projeto', c.getPrevisao)        // buscar_projeto_previsao

module.exports = router
