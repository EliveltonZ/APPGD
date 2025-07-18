// Armazena dados do usuário no cookie
function setPermissions(req, res) {
  const dados = req.body;

  // Armazena o objeto como string JSON no cookie assinado
  res.cookie("dadosUsuario", JSON.stringify(dados), {
    httpOnly: true, // O cookie só é acessível pelo servidor
    signed: true, // Assinado com a chave secreta
    maxAge: 1000 * 60 * 60 * 24, // 1 dia
  });

  res.status(200).json({ mensagem: "Dados salvos no cookie com sucesso" });
}

// Recupera os dados do cookie assinado
function checkPermissao(req, res) {
  const cookie = req.signedCookies.dadosUsuario;

  if (!cookie) {
    return res
      .status(404)
      .json({ erro: "Nenhum dado encontrado para este usuário" });
  }

  try {
    const dadosUsuario = JSON.parse(cookie);
    res.status(200).json(dadosUsuario);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao processar os dados do cookie" });
  }
}

module.exports = {
  setPermissions,
  checkPermissao,
};
