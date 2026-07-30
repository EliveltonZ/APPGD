const router = require('express').Router()
const { fillTableValores } = require('../controllers/valoresController')
const rp = require('../middlewares/requirePermission')

router.get('/', rp('valores'), fillTableValores)

module.exports = router
