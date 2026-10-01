const router = require('express').Router()
const c  = require('../controllers/projetosPrdController')
const rp = require('../middlewares/requirePermission')

const prod = rp('producao')

router.get('/',          prod, c.fillTable)
router.get('/projeto',   prod, c.getProducao)
router.get('/barcode',   prod, c.getProducaoBarcode)
router.post('/dados',    prod, c.setDataProducao)
// Usada tanto pelo modal da tela de Produção quanto pela capa/Relatórios —
// sem permissão própria (só exige login, via o middleware global de auth) em
// vez de amarrar a uma permissão de uma das telas ou duplicar a rota.
router.get('/materiais', c.getMateriais)
router.get('/capa',      rp('relatorios'), c.getCapaProducao)

module.exports = router
