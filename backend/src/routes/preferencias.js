const router = require('express').Router()
const { Pool } = require('pg')

// Pool dedicado para a tabela de preferências.
// DATABASE_URL já está no process.env (carregado pelo dotenv em sequelize.js).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true, rejectUnauthorized: false },
  max: 3,
})

pool.on('error', (err) => {
  console.error('[preferencias pool] erro inesperado:', err)
})

/**
 * GET /preferencias?chaves=key1,key2
 * Retorna { key1: "valor1", key2: "valor2" } para o usuário autenticado.
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = Number(req.user.sub)
    const chaves = String(req.query.chaves ?? '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)

    if (!chaves.length) return res.json({})

    // Parâmetros posicionais: $1 = userId, $2… = cada chave
    const params = [userId, ...chaves]
    const placeholders = chaves.map((_, i) => `$${i + 2}`).join(', ')

    const { rows } = await pool.query(
      `SELECT chave, valor
         FROM "tblPreferencias"
        WHERE id_usuario = $1
          AND chave IN (${placeholders})`,
      params,
    )

    res.json(Object.fromEntries(rows.map(r => [r.chave, r.valor])))
  } catch (err) {
    console.error('[preferencias GET]', err.message)
    next(err)
  }
})

/**
 * POST /preferencias
 * Body: { "chave1": "valor1", "chave2": "valor2" }
 * Faz upsert de todos os pares para o usuário autenticado.
 */
router.post('/', async (req, res, next) => {
  try {
    const userId  = Number(req.user.sub)
    const entries = Object.entries(req.body ?? {})
    console.log('[preferencias POST] userId=%d entries=%j', userId, entries)

    if (!entries.length) return res.json({ ok: true })

    await Promise.all(
      entries.map(([chave, valor]) =>
        pool.query(
          `INSERT INTO "tblPreferencias" (id_usuario, chave, valor)
           VALUES ($1, $2, $3)
           ON CONFLICT (id_usuario, chave)
           DO UPDATE SET valor = EXCLUDED.valor, atualizado = now()`,
          [userId, chave, String(valor)],
        )
      )
    )

    console.log('[preferencias POST] upsert ok userId=%d', userId)
    res.json({ ok: true })
  } catch (err) {
    console.error('[preferencias POST] ERROR:', err.message)
    next(err)
  }
})

module.exports = router
