/**
 * Middleware factory que verifica se o usuário autenticado possui
 * a permissão necessária dentro do payload JWT (req.user.permissoes).
 *
 * Uso: router.get('/rota', requirePermission('p_pcp'), controller)
 */
function requirePermission(field) {
  return (req, res, next) => {
    const permissoes = req.user?.permissoes ?? {};
    if (!permissoes[field]) {
      return res.status(403).json({ error: 'Acesso negado: permissão insuficiente' });
    }
    next();
  };
}

module.exports = requirePermission;
