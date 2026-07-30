const router = require('express').Router()
const add    = require('../controllers/addUsersController')
const ac     = require('../controllers/acessosController')
const rp     = require('../middlewares/requirePermission')

router.get('/max-id',         rp('cadastros_usuarios'),  add.getMaxId)
router.post('/',              rp('cadastros_usuarios'),  add.insertUser)
router.get('/listar-acessos', rp('acesso'),              ac.listAcessos)
router.post('/acessos',       rp('acesso'),              ac.setUserAccess)
router.get('/acessos',        rp('acesso'),              ac.getUserAccess)
router.get('/todos',          rp('cadastros_usuarios'),  add.listAllUsers)
router.put('/:id',            rp('cadastros_usuarios'),  add.updateUser)

module.exports = router
