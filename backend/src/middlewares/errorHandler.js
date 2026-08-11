// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = err.status || 500
  console.error(err.stack)
  // Em produção não expõe detalhes internos de erros 5xx ao cliente
  const message = (status < 500 || process.env.NODE_ENV === 'development')
    ? (err.message || 'Internal Server Error')
    : 'Erro interno no servidor'
  res.status(status).json({ error: message })
}

module.exports = errorHandler
