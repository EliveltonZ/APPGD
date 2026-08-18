const router = require('express').Router();
const rp     = require('../middlewares/requirePermission');
const repo   = require('../repositories/materiaisRepository');

function handler(fn) {
  return async (req, res) => {
    try {
      const result = await fn(req);
      if (result === null || result === false) {
        return res.status(404).json({ error: 'Material não encontrado.' });
      }
      res.json(result);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Código interno já cadastrado.' });
      }
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ error: 'Material em uso e não pode ser excluído.' });
      }
      res.status(500).json({ error: err.message });
    }
  };
}

router.get('/',     rp('cadastros_materiais'), handler(() => repo.listar()));
router.get('/:id',  rp('cadastros_materiais'), handler((req) => repo.buscarPorId(req.params.id)));
router.post('/',    rp('cadastros_materiais'), handler((req) => repo.criar(req.body)));
router.put('/:id',  rp('cadastros_materiais'), handler((req) => repo.atualizar(req.params.id, req.body)));
router.delete('/:id', rp('cadastros_materiais'), handler((req) => repo.excluir(req.params.id)));

module.exports = router;
