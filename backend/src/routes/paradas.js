const router = require('express').Router();
const requirePermission = require('../middlewares/requirePermission');
const c = require('../controllers/paradasController');

// ─── Acesso operador ─────────────────────────────────────────────────────────

const opPerm = requirePermission('paradas_maquina');

router.get('/maquinas', opPerm, c.getMaquinas);
router.get('/tipos',    opPerm, c.getTipos);

router.get('/buscar-pedido', opPerm, c.getBuscarPedido);

router.get('/aberta/:id_maquina', opPerm, c.getAberta);

router.get('/abertas', opPerm, c.getAbertas);

// Lista todas as paradas — acessível por operador ou admin
router.get('/listar', opPerm, c.getListar);

router.post('/iniciar', opPerm, c.postIniciar);

router.post('/finalizar', opPerm, c.postFinalizar);

// ─── Acesso admin ─────────────────────────────────────────────────────────────

const adminPerm = requirePermission('paradas_admin');

router.get('/admin/listar', adminPerm, c.getAdminListar);

router.put('/admin/:id', adminPerm, c.putAdminEditar);

router.get('/admin/:id/historico', adminPerm, c.getAdminHistorico);

module.exports = router;
