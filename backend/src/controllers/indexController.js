const jwt    = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const fs     = require('fs')
const path   = require('path')
const { Usuario }      = require('../client/db')
const { buscarAcesso } = require('../repositories/usuariosRepository')

const AUTH_LOG = path.join(__dirname, '..', 'auth.log')
const BCRYPT_ROUNDS = 12

async function login(req, res) {
  const { id, senha } = req.body ?? {}

  if (!id || !senha) {
    return res.status(400).json({ error: 'ID e senha são obrigatórios' })
  }

  try {
    const user = await Usuario.findOne({
      where: { id: Number(id), ativo: true },
    })

    if (!user) {
      const logEntry = `[${new Date().toISOString()}] FAILED LOGIN: ID ${id} from IP ${req.ip}\n`
      fs.appendFile(AUTH_LOG, logEntry, () => {})
      return res.status(400).json({ error: 'ID ou senha inválidos' })
    }

    // Suporte a migração gradual: senhas antigas em texto puro são migradas
    // automaticamente para bcrypt no primeiro login bem-sucedido.
    let passwordValid = false
    const senhaStr = String(senha)
    if (user.senha?.startsWith('$2')) {
      passwordValid = await bcrypt.compare(senhaStr, user.senha)
    } else {
      passwordValid = user.senha === senhaStr
      if (passwordValid) {
        const hashed = await bcrypt.hash(senhaStr, BCRYPT_ROUNDS)
        await Usuario.update({ senha: hashed }, { where: { id: user.id } })
      }
    }

    if (!passwordValid) {
      const logEntry = `[${new Date().toISOString()}] FAILED LOGIN: ID ${id} from IP ${req.ip}\n`
      fs.appendFile(AUTH_LOG, logEntry, () => {})
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
