const router = require('express').Router()
const c = require('../controllers/pendenciasController')

router.get('/',              c.fillTableAPendencia)  // get_acessorios_pendencias
router.get('/contrato',      c.getContratoPendencias) // buscar_contrato_pendencia
router.get('/categorias',    c.listarCategoria)            // listar_categoria
router.get('/acessorios',    c.listAcessoriosPendencias)  // listar_acessorios_pendencias
router.post('/acessorios',   c.insertAcessorios)          // inserir_acessorios
router.post('/del-acessorio',c.delAcessorios)         // del_acessorio
router.put('/acessorios',    c.updateAcessorios)       // atualizar_acessorios

module.exports = router
