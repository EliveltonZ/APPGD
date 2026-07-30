const router = require('express').Router()
const requirePermission = require('../middlewares/requirePermission')
const repo = require('../repositories/cadastrosRepository')

const ENTITY_PERMISSION = {
  vendedores:      'cadastros_equipe',
  liberadores:     'cadastros_equipe',
  montadores:      'cadastros_equipe',
  causas:          'cadastros_qualidade',
  falhas:          'cadastros_qualidade',
  etapas:          'cadastros_qualidade',
  'tipo-cliente':  'cadastros_comercial',
  'tipo-contrato': 'cadastros_comercial',
  lojas:           'cadastros_comercial',
  clientes:        'cadastros_clientes',
}

function requireEntityPermission(req, res, next) {
  const permKey = ENTITY_PERMISSION[req.params.entity]
  if (!permKey) return next()
  return requirePermission(permKey)(req, res, next)
}

function handler(fn) {
  return async (req, res) => {
    try {
      const result = await fn(req)
      if (result === null || result === false) {
        return res.status(404).json({ error: 'Registro não encontrado' })
      }
      res.json(result)
    } catch (err) {
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ error: 'Registro em uso e não pode ser excluído.' })
      }
      res.status(500).json({ error: err.message })
    }
  }
}

function validateEntity(req, res, next) {
  if (!repo.entityExists(req.params.entity)) {
    return res.status(400).json({ error: `Entidade inválida: ${req.params.entity}` })
  }
  next()
}

router.get('/:entity',        requireEntityPermission, validateEntity, handler((req) => repo.listar(req.params.entity)))
router.post('/:entity',       requireEntityPermission, validateEntity, handler((req) => repo.criar(req.params.entity, req.body)))
router.put('/:entity/:id',    requireEntityPermission, validateEntity, handler((req) => repo.atualizar(req.params.entity, req.params.id, req.body)))
router.delete('/:entity/:id', requireEntityPermission, validateEntity, handler((req) => repo.excluir(req.params.entity, req.params.id)))

module.exports = router
