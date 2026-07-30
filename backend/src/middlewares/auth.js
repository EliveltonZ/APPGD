const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // Autenticação via API Key (Power BI / integrações externas)
  const apiKey = req.headers["x-api-key"];
  if (apiKey) {
    if (apiKey === process.env.POWERBI_API_KEY) {
      req.user = { sub: 0, nome: "powerbi", permissoes: {} };
      return next();
    }
    return res.status(401).json({ error: "API key inválida" });
  }

  // Autenticação via JWT (app web)
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const expired = err.name === "TokenExpiredError";
    return res.status(401).json({
      error: expired ? "Token expirado" : "Token inválido",
    });
  }
}

module.exports = authMiddleware;
