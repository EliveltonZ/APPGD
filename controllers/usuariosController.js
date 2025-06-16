const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../dados_usuario.json");

// Salva ou substitui todos os dados
function setPermissions(req, res) {
  const dados = req.body;

  fs.writeFile(filePath, JSON.stringify(dados, null, 2), (err) => {
    if (err) {
      console.error("Erro ao salvar dados:", err);
      return res.status(500).json({ erro: "Falha ao salvar dados" });
    }

    console.log("Dados salvos com sucesso!");
    res.status(200).json({ mensagem: "Dados salvos com sucesso" });
  });
}

// Retorna todos os dados salvos
function checkPermissao(req, res) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ erro: "Arquivo não encontrado" });
  }

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Erro ao ler dados:", err);
      return res.status(500).json({ erro: "Falha ao ler dados" });
    }

    res.status(200).json(JSON.parse(data));
  });
}

module.exports = {
  setPermissions: setPermissions,
  checkPermissao: checkPermissao,
};
