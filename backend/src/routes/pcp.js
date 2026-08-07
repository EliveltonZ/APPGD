const router = require('express').Router()
const c = require('../controllers/pcpController')
const rp = require('../middlewares/requirePermission')

const pcp = rp('pcp')

router.get('/',            pcp, c.getProjetoPcp)
router.get('/ultimo-lote', pcp, c.getLastLote)
router.get('/lote',        pcp, c.getProjetosLote)
router.get('/lotes',          pcp, c.getLotes)
router.get('/lotes-iniciados',pcp, c.getLotesIniciados)
router.get('/exportar',       pcp, c.exportarDados)
router.get('/cards',          pcp, c.getCards)
router.post('/iniciar',       pcp, c.setStartLote)
router.post('/reverter',      pcp, c.reverterLote)
router.post('/lote',       pcp, c.setLote)
router.post('/projeto',    pcp, c.setProjetoPcp)

module.exports = router
