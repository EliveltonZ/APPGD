// controllers/permissoesController.js

function setPermissions(req, res) {
  const dados = req.body;
  req.session.dadosUsuario = dados;
  res.status(200).json({ mensagem: "Dados salvos na sessão com sucesso" });
}

function checkPermissao(req, res) {
  if (!req.session.dadosUsuario) {
    return res
      .status(404)
      .json({ erro: "Nenhum dado encontrado para este usuário" });
  }
  res.status(200).json(req.session.dadosUsuario);
}

module.exports = {
  setPermissions,
  checkPermissao,
};
