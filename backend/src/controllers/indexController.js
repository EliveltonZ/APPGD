const jwt  = require('jsonwebtoken')
const fs   = require('fs')
const path = require('path')
const { Usuario }    = require('../client/db')
const { buscarAcesso } = require('../repositories/usuariosRepository')

async function login(req, res) {
  const { id, senha } = req.body ?? {}

  if (!id || !senha) {
    return res.status(400).json({ error: 'ID e senha são obrigatórios' })
  }

  try {
    const user = await Usuario.findOne({
      where: { id: Number(id), senha: String(senha), ativo: true },
    })

    if (!user) {
      const logEntry = `[${new Date().toISOString()}] FAILED LOGIN: ID ${id} from IP ${req.ip}\n`
      fs.appendFileSync(path.join(__dirname, '..', 'auth.log'), logEntry)
      return res.status(400).json({ error: 'ID ou senha inválidos' })
    }

    const [permissoes] = await buscarAcesso(id)

    const payload = {
      sub:        Number(id),
      nome:       permissoes?.login ?? '',
      permissoes: permissoes ?? {},
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '3d',
    })

    return res.json({ token, user: payload })
  } catch (err) {
    console.error('[login] internal error:', err)
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

module.exports = { login }
