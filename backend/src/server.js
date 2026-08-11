// ── Entry point do servidor Express ──────────────────────────────────────────
// Responsabilidades:
//   1. Servir o frontend compilado (backend/public) como arquivos estáticos
//   2. Expor a API REST em /api/* (com autenticação JWT)
//   3. SPA fallback: qualquer rota desconhecida devolve index.html
//      para que o React Router gerencie a navegação no cliente
//
// Para rodar: node src/server.js  (ou npm run dev para nodemon)
// Variáveis de ambiente lidas de: src/client/.env

process.env.TZ = 'America/Sao_Paulo'

const path      = require('path')
require('dotenv').config({ path: path.join(__dirname, 'client/.env') })

const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const rateLimit    = require('express-rate-limit')
const routes       = require('./routes')
const errorHandler = require('./middlewares/errorHandler')

const app    = express()
const PORT   = process.env.PORT || 3001
const PUBLIC = path.join(__dirname, '../public')

// Headers de segurança HTTP
app.use(helmet())

// CORS: permite apenas origens conhecidas.
// Em produção defina ALLOWED_ORIGINS=https://app.suaempresa.com no .env.
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(',').map(o => o.trim())
app.use(cors({
  origin: (origin, cb) => {
    // Requisições sem Origin (mesma origem, ferramentas internas) são permitidas
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('Bloqueado por CORS'))
  },
  credentials: true,
}))

app.use(express.json())
app.use(express.static(PUBLIC))

// Rate limit no endpoint de login: máx. 20 tentativas por 15 min por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
})

app.use('/api/auth/login', loginLimiter)
app.use('/api', routes)
app.use(errorHandler)

// SPA fallback — todas as rotas não-API devolvem o index.html
// Necessário para que URLs como /assistencias/producao funcionem após reload
app.get('*', (_req, res) => {
  res.sendFile(path.join(PUBLIC, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`)
})
