const router = require('express').Router()
const c = require('../controllers/preferenciasController')

// GET /preferencias?chaves=key1,key2 — retorna { key1: "valor1", ... } do usuário autenticado
router.get('/', c.getPreferencias)

// POST /preferencias — Body: { chave1: "valor1", ... } — upsert para o usuário autenticado
router.post('/', c.setPreferencias)

module.exports = router
