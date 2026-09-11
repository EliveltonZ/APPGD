// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = err.status || 500
  console.error(err.stack)
  // Em produção não expõe detalhes internos de erros 5xx ao cliente
  const message = (status < 500 || process.env.NODE_ENV === 'development')
    ? (err.message || 'Internal Server Error')
    : 'Erro interno no servidor'
  const body = { error: message }
  // ValidationError (backend/src/validation) anexa erros por campo, no mesmo
  // formato do ValidationResult do frontend — dá pra jogar direto em setErrors().
  if (err.errors) body.errors = err.errors
  res.status(status).json(body)
}

module.exports = errorHandler
