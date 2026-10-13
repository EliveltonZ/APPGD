const router = require('express').Router();
const rp     = require('../middlewares/requirePermission');
const repo   = require('../repositories/localizacoesRepository');

function handler(fn) {
  return async (req, res) => {
    try {
      const result = await fn(req);
      if (result === null || result === false) {
        return res.status(404).json({ error: 'Localização não encontrada.' });
      }
      res.json(result);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Já existe uma localização com esse endereço (rua/prateleira/nível/divisão).' });
      }
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ error: 'Localização em uso e não pode ser excluída.' });
      }
      res.status(err.status ?? 500).json({ error: err.message });
    }
  };
}

// Leitura liberada pra qualquer usuário autenticado — escolher uma
// localização (ex.: dar baixa de estoque) é diferente de administrar o
// cadastro, mesmo padrão já usado em /materiais/opcoes.
router.get('/',      handler(() => repo.listar()));
router.post('/',     rp('cadastros_localizacoes'), handler((req) => repo.criar(req.body)));
router.put('/:id',   rp('cadastros_localizacoes'), handler((req) => repo.atualizar(req.params.id, req.body)));
router.delete('/:id',rp('cadastros_localizacoes'), handler((req) => repo.excluir(req.params.id)));

module.exports = router;
