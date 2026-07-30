const router = require('express').Router()
const c  = require('../controllers/projetosExpController')
const rp = require('../middlewares/requirePermission')

const exp = rp('expedicao')

router.get('/',          exp, c.fillTable)
router.get('/projeto',   exp, c.getExpedicao)
router.get('/materiais', exp, c.getMateriais)
router.post('/dados',    exp, c.setDataExpedicao)

module.exports = router
