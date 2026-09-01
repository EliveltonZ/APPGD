const jwt    = require('jsonwebtoken')
const fs     = require('fs')
const path   = require('path')
const service = require('../services/usuariosService')
const { buscarAcesso } = require('../repositories/usuariosRepository')

const LOG_DIR  = path.join(__dirname, '..', '..', 'logs')
const AUTH_LOG = path.join(LOG_DIR, 'auth.log')
fs.mkdirSync(LOG_DIR, { recursive: true })

function logFailedLogin(id, ip) {
  const logEntry = `[${new Date().toISOString()}] FAILED LOGIN: ID ${id} from IP ${ip}\n`
  fs.appendFile(AUTH_LOG, logEntry, () => {})
}

async function login(req, res) {
  const { id, senha } = req.body ?? {}

  if (!id || !senha) {
    return res.status(400).json({ error: 'ID e senha são obrigatórios' })
  }

  try {
    const { valid } = await service.verificarLogin(id, senha)

    if (!valid) {
      logFailedLogin(id, req.ip)
      return res.status(400).json({ error: 'ID ou senha inválidos' })
    }

    const [permissoes] = await buscarAcesso(id)

    const payload = {
      sub:        Number(id),
      nome:       permissoes?.login ?? '',
      permissoes: permissoes ?? {},
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
    })

    return res.json({ token, user: payload })
  } catch (err) {
    console.error('[login] internal error:', err)
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

module.exports = { login }
