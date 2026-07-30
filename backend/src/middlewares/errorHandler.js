// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  })
}

module.exports = errorHandler
