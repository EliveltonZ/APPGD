const router     = require('express').Router()
const { login }  = require('../controllers/indexController')
const { getUsuario } = require('../controllers/ultilsController')

router.post('/login',   login)        // check_password + emite JWT
router.get('/usuario',  getUsuario)   // buscar_usuario

module.exports = router
