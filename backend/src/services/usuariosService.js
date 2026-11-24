const bcrypt = require("bcryptjs");
const repo = require("../repositories/usuariosRepository");

async function verificarLogin(id, senha) {
  const user = await repo.buscarParaLogin(id);
  if (!user) return { user: null, valid: false };

  const valid = await bcrypt.compare(String(senha), user.senha ?? '');
  return { user: valid ? user : null, valid };
}

const buscarMaiorId   = ()       => repo.buscarMaiorId();
const inserirUsuario  = (dados)  => repo.inserirUsuario(dados);
const listarAcessos   = ()       => repo.listarAcessos();
const buscarAcesso    = (id)     => repo.buscarAcesso(id);
const atualizarAcessos = (dados) => repo.atualizarAcessos(dados);

const alterarSenha        = (id, senha)   => repo.alterarSenha(id, senha);
const listarTodosUsuarios = ()            => repo.listarTodosUsuarios();
const atualizarUsuario    = (id, data)    => repo.atualizarUsuario(id, data);
const gerarCracha              = (id)   => repo.gerarCracha(id);
const buscarOperadorPorCracha  = (hash) => repo.buscarOperadorPorCracha(hash);

module.exports = {
  verificarLogin, buscarMaiorId, inserirUsuario, listarAcessos, buscarAcesso,
  atualizarAcessos, alterarSenha, listarTodosUsuarios, atualizarUsuario,
  gerarCracha, buscarOperadorPorCracha,
};
