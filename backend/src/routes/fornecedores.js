const router = require('express').Router();
const rp     = require('../middlewares/requirePermission');
const repo   = require('../repositories/fornecedoresRepository');

function handler(fn) {
  return async (req, res) => {
    try {
      const result = await fn(req);
      if (result === null || result === false) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
      }
      res.json(result);
    } catch (err) {
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ error: 'Fornecedor em uso e não pode ser excluído.' });
      }
      res.status(500).json({ error: err.message });
    }
  };
}

// Leitura liberada pra qualquer usuário autenticado — escolher um fornecedor
// (ex.: lançar nota fiscal) é diferente de administrar o cadastro, mesmo
// padrão já usado em /localizacoes e /materiais/opcoes.
router.get('/',       handler(() => repo.listar()));
router.post('/',      rp('cadastros_fornecedores'), handler((req) => repo.criar(req.body)));
router.put('/:id',    rp('cadastros_fornecedores'), handler((req) => repo.atualizar(req.params.id, req.body)));
router.delete('/:id', rp('cadastros_fornecedores'), handler((req) => repo.excluir(req.params.id)));

module.exports = router;
