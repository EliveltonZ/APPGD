const router = require('express').Router()
const { setInfoCapa } = require('../controllers/menuController')

router.get('/capa', setInfoCapa)  // set_infocapa

module.exports = router
