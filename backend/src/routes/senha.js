const router = require('express').Router()
const { alterarSenha } = require('../controllers/senhaController')
const rp = require('../middlewares/requirePermission')

router.post('/', rp('password'), alterarSenha)

module.exports = router
