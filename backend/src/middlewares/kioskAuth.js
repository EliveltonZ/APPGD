const { validarPin } = require('../repositories/kioskPinRepository');

// Gate do terminal público de apontamento — sem JWT, sem login. O PIN é
// gerado/visto em Configurações > PIN do Terminal (tela com permissão
// config_acessos) e digitado uma única vez no terminal (fica salvo no
// navegador dele).
async function kioskAuth(req, res, next) {
  const pin = req.headers['x-kiosk-pin'];
  const ok = await validarPin(pin);
  if (!ok) {
    return res.status(401).json({ error: 'PIN do terminal inválido' });
  }
  next();
}

module.exports = kioskAuth;
