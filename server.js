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
const fs = require("fs");

require("dotenv").config({ path: __dirname + "/client/.env" });

const useCors = true;

// Security middleware
app.use(
  helmet({
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
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Logging
app.use(
  morgan("combined", {
    stream: fs.createWriteStream(path.join(__dirname, "access.log"), {
      flags: "a",
    }),
  }),
);

// Security monitoring middleware
app.use((req, res, next) => {
  const suspiciousPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b/i,
    /\b(union|script|javascript|vbscript|onload|onerror)\b/i,
    /\b(\.\.|\/etc|\/bin|\/usr)\b/i,
    /<script/i,
  ];

  const isSuspicious = suspiciousPatterns.some(
    (pattern) =>
      pattern.test(req.url) ||
      pattern.test(JSON.stringify(req.body || {})) ||
      pattern.test(JSON.stringify(req.query || {})),
  );

  if (isSuspicious) {
    const logEntry = `[${new Date().toISOString()}] SUSPICIOUS ACTIVITY: ${req.method} ${req.url} from ${req.ip}\n`;
    fs.appendFileSync(path.join(__dirname, "security.log"), logEntry);
    console.warn("Suspicious activity detected:", req.method, req.url, req.ip);
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

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

app.use("/", routes);

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "error.html"));
});

const PORT = process.env.PORT || 5500;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
