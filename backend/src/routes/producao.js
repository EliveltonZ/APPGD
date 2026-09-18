const router = require('express').Router()
const c  = require('../controllers/projetosPrdController')
const rp = require('../middlewares/requirePermission')

const prod = rp('producao')

router.get('/',          prod, c.fillTable)
router.get('/projeto',   prod, c.getProducao)
router.get('/barcode',   prod, c.getProducaoBarcode)
router.post('/dados',    prod, c.setDataProducao)
// Mesmos dados (materiais do projeto), duas rotas — uma por tela consumidora,
// cada uma com sua própria permissão. Não compartilhar permissão entre telas.
router.get('/materiais',      prod,              c.getMateriais)  // modal da tela de Produção
router.get('/materiais-capa', rp('relatorios'),  c.getMateriais)  // capa/relatório impresso
router.get('/capa',           rp('relatorios'),  c.getCapaProducao)

module.exports = router
