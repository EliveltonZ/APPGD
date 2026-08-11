const router = require('express').Router();
const requirePermission = require('../middlewares/requirePermission');
const repo = require('../repositories/paradasRepository');

function handler(fn) {
  return async (req, res) => {
    try {
      const result = await fn(req);
      if (result === null) return res.status(404).json({ error: 'Registro não encontrado' });
      res.json(result);
    } catch (err) {
      if (err.code === 'MAQUINA_EM_PARADA' || err.code === 'SEM_PARADA_ABERTA') {
        return res.status(409).json({ error: err.message });
      }
      if (err.code === 'VALIDACAO') {
        return res.status(400).json({ error: err.message });
      }
      console.error('[paradas]', err);
      res.status(500).json({ error: err.message });
    }
  };
}

// ─── Acesso operador ─────────────────────────────────────────────────────────

const opPerm = requirePermission('paradas_maquina');

router.get('/maquinas', opPerm, handler(() => repo.listarMaquinas()));
router.get('/tipos',    opPerm, handler(() => repo.listarTipos()));

router.get('/buscar-pedido', opPerm, handler((req) => {
  const tipo = Number(req.query.tipo);
  const pedido = Number(req.query.pedido);
  if (!tipo || isNaN(pedido)) throw Object.assign(new Error('Parâmetros inválidos'), { code: 'VALIDACAO' });
  return repo.buscarPedido(tipo, pedido);
}));

router.get('/aberta/:id_maquina', opPerm, handler((req) =>
  repo.buscarAberta(Number(req.params.id_maquina))
));

router.get('/abertas', opPerm, handler(() => repo.listarAbertas()));

// Lista todas as paradas — acessível por operador ou admin
router.get('/listar', opPerm, handler((req) =>
  repo.listarTodas({
    data_inicio_de:  req.query.data_inicio_de,
    data_inicio_ate: req.query.data_inicio_ate,
    id_maquina:      req.query.id_maquina,
  })
));

router.post('/iniciar', opPerm, handler((req) => {
  const { pedido, id_maquina, id_tipo } = req.body;
  if (pedido === undefined || pedido === null || String(pedido).trim() === '') {
    throw Object.assign(new Error('Pedido é obrigatório'), { code: 'VALIDACAO' });
  }
  if (!id_maquina) throw Object.assign(new Error('Máquina é obrigatória'), { code: 'VALIDACAO' });
  if (!id_tipo)    throw Object.assign(new Error('Tipo é obrigatório'),    { code: 'VALIDACAO' });
  return repo.iniciar({
    pedido:     Number(pedido),
    id_maquina: Number(id_maquina),
    id_tipo:    Number(id_tipo),
    id_usuario: req.user.sub,
  });
}));

router.post('/finalizar', opPerm, handler((req) => {
  const { id_maquina } = req.body;
  if (!id_maquina) throw Object.assign(new Error('Máquina é obrigatória'), { code: 'VALIDACAO' });
  return repo.finalizar(Number(id_maquina));
}));

// ─── Acesso admin ─────────────────────────────────────────────────────────────

const adminPerm = requirePermission('paradas_admin');

router.get('/admin/listar', adminPerm, handler((req) =>
  repo.listarTodas({
    data_inicio_de:  req.query.data_inicio_de,
    data_inicio_ate: req.query.data_inicio_ate,
    id_maquina:      req.query.id_maquina,
  })
));

router.put('/admin/:id', adminPerm, handler((req) => {
  const id_usuario = req.user.sub;
  return repo.editarParada(Number(req.params.id), req.body, id_usuario);
}));

router.get('/admin/:id/historico', adminPerm, handler((req) =>
  repo.listarHistorico(req.params.id)
));

module.exports = router;
