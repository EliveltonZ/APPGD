// ── Entry point do servidor Express ──────────────────────────────────────────
// Responsabilidades:
//   1. Servir o frontend compilado (backend/public) como arquivos estáticos
//   2. Expor a API REST em /api/* (com autenticação JWT)
//   3. SPA fallback: qualquer rota desconhecida devolve index.html
//      para que o React Router gerencie a navegação no cliente
//
// Para rodar: node src/server.js  (ou npm run dev para nodemon)
// Variáveis de ambiente lidas de: src/client/.env

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, 'client/.env') })

const express      = require('express')
const cors         = require('cors')
const routes       = require('./routes')
const errorHandler = require('./middlewares/errorHandler')

const app    = express()
const PORT   = process.env.PORT || 3001
// Frontend compilado pelo Vite fica em backend/public (configurado em vite.config.ts)
const PUBLIC = path.join(__dirname, '../public')

app.use(cors())
app.use(express.json())
// Serve os arquivos estáticos do frontend (index.html, JS, CSS, imagens)
app.use(express.static(PUBLIC))

// Todas as rotas da API passam pelo router principal (que aplica JWT middleware)
app.use('/api', routes)
// Middleware centralizado de tratamento de erros (deve vir depois das rotas)
app.use(errorHandler)

// SPA fallback — todas as rotas não-API devolvem o index.html
// Necessário para que URLs como /assistencias/producao funcionem após reload
app.get('*', (_req, res) => {
  res.sendFile(path.join(PUBLIC, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`)
})
