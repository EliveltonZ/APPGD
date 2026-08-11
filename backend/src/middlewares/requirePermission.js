/**
 * Verifica se o usuário possui UMA permissão específica.
 * Uso: rp('pcp')
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

/**
 * Verifica se o usuário possui QUALQUER UMA das permissões listadas.
 * Uso: rp.any('producao_assistencia', 'logistica_assistencia')
 */
requirePermission.any = function (...fields) {
  return (req, res, next) => {
    const permissoes = req.user?.permissoes ?? {};
    if (fields.some(f => permissoes[f])) return next();
    return res.status(403).json({ error: 'Acesso negado: permissão insuficiente' });
  };
};

module.exports = requirePermission;
