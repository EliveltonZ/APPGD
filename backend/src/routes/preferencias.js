const router     = require('express').Router()
const { QueryTypes } = require('sequelize')
const { sequelize }  = require('../client/db')

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

    const rows = await sequelize.query(
      `SELECT chave, valor
         FROM "tblPreferencias"
        WHERE id_usuario = :userId
          AND chave IN (:chaves)`,
      { replacements: { userId, chaves }, type: QueryTypes.SELECT },
    )

    res.json(Object.fromEntries(rows.map(r => [r.chave, r.valor])))
  } catch (err) {
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

    if (!entries.length) return res.json({ ok: true })

    await Promise.all(
      entries.map(([chave, valor]) =>
        sequelize.query(
          `INSERT INTO "tblPreferencias" (id_usuario, chave, valor)
           VALUES (:userId, :chave, :valor)
           ON CONFLICT (id_usuario, chave)
           DO UPDATE SET valor = EXCLUDED.valor, atualizado = now()`,
          { replacements: { userId, chave, valor: String(valor) } },
        )
      )
    )

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
