const router = require('express').Router()
const c = require('../controllers/solicitacaoController')

router.get('/config',   c.getConfig)         // get_config
router.get('/pecas',    c.getPecas)          // get_pecas
router.get('/falhas',      c.getFalhas)       // listar_falhas
router.get('/ocorrencias', c.getOcorrencias)  // listar_ocorrencias
router.get('/montadores',  c.getMontadores)   // listar_montadores
router.get('/contrato', c.getContratoAssist) // buscar_contrato_assistencia
router.post('/equip',   c.setEquipSat)       // inserir_equipe_assistencia

module.exports = router
