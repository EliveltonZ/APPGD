const router = require('express').Router()
const auth   = require('../middlewares/auth')

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Rota pública — login não exige token
router.use('/auth', require('./auth'))

// Todas as rotas abaixo exigem token JWT válido
router.use(auth)

router.use('/utils',        require('./utils'))
router.use('/producao',     require('./producao'))
router.use('/apontamento',  require('./apontamento'))
router.use('/previsao',     require('./previsao'))
router.use('/status',       require('./status'))
router.use('/expedicao',    require('./expedicao'))
router.use('/compras',      require('./compras'))
router.use('/pendencias',   require('./pendencias'))
router.use('/assistencias', require('./assistencias'))
router.use('/pcp',          require('./pcp'))
router.use('/projetos',     require('./projetos'))
router.use('/qualidade',    require('./qualidade'))
router.use('/pecas',        require('./pecas'))
router.use('/usuarios',     require('./usuarios'))
router.use('/valores',      require('./valores'))
router.use('/menu',         require('./menu'))
router.use('/senha',        require('./senha'))
router.use('/solicitacao',  require('./solicitacao'))
router.use('/paradas',      require('./paradas'))
router.use('/cadastros',    require('./cadastros'))
router.use('/dashboard',    require('./dashboard'))
router.use('/preferencias', require('./preferencias'))

module.exports = router
