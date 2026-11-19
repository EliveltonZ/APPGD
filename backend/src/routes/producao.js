const router = require('express').Router()
const c  = require('../controllers/projetosPrdController')
const rp = require('../middlewares/requirePermission')

const prod = rp('producao')

router.get('/',          prod, c.fillTable)
router.get('/projeto',   prod, c.getProducao)
router.get('/barcode',   prod, c.getProducaoBarcode)
router.post('/dados',    prod, c.setDataProducao)
router.get('/materiais', prod, c.getMateriais)
// Tela de Relatórios (Fábrica) também busca por aqui, com permissão própria
router.get('/capa',      rp.any('producao', 'relatorios'), c.getCapaProducao)

module.exports = router
