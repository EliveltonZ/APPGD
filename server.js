const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const helmet = require("helmet");

const useCors = true;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.github.com"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 login attempts per windowMs (reduzido para evitar bloqueio durante dev)
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// NÃO aplicar rate limit global - apenas em rotas de API específicas
// app.use(limiter); ← REMOVIDO para permitir assets estáticos sem bloqueio

// Logging
app.use(morgan('combined', {
  stream: require('fs').createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));

// Security monitoring middleware
app.use((req, res, next) => {
  const suspiciousPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b/i,
    /\b(union|script|javascript|vbscript|onload|onerror)\b/i,
    /\b(\.\.|\/etc|\/bin|\/usr)\b/i,
    /<script/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || pattern.test(JSON.stringify(req.body || {})) || pattern.test(JSON.stringify(req.query || {}))
  );

  if (isSuspicious) {
    const fs = require('fs');
    const logEntry = `[${new Date().toISOString()}] SUSPICIOUS ACTIVITY: ${req.method} ${req.url} from ${req.ip}\n`;
    fs.appendFileSync(path.join(__dirname, 'security.log'), logEntry);
    console.warn('Suspicious activity detected:', req.method, req.url, req.ip);
  }

  next();
});

app.use(express.static(path.join(__dirname, "public")));

if (useCors) {
  app.use(cors());
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(process.env.SESSION_SECRET));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using https
}));

app.use("/", routes);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "public", "error.html"));
});

const PORT = 5500;

// HTTPS configuration for production
if (process.env.NODE_ENV === 'production') {
  const https = require('https');
  const fs = require('fs');
  
  // You'll need to provide your SSL certificate files
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH || 'path/to/private-key.pem'),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH || 'path/to/certificate.pem')
  };
  
  https.createServer(options, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });
  
  // Redirect HTTP to HTTPS
  const http = require('http');
  http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  }).listen(80);
} else {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
  });
}
