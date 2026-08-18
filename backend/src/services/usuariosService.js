const repo = require("../repositories/usuariosRepository");

const buscarMaiorId   = ()       => repo.buscarMaiorId();
const inserirUsuario  = (dados)  => repo.inserirUsuario(dados);
const listarAcessos   = ()       => repo.listarAcessos();
const buscarAcesso    = (id)     => repo.buscarAcesso(id);
const atualizarAcessos = (dados) => repo.atualizarAcessos(dados);

const alterarSenha        = (id, senha)   => repo.alterarSenha(id, senha);
const listarTodosUsuarios = ()            => repo.listarTodosUsuarios();
const atualizarUsuario    = (id, data)    => repo.atualizarUsuario(id, data);

module.exports = { buscarMaiorId, inserirUsuario, listarAcessos, buscarAcesso, atualizarAcessos, alterarSenha, listarTodosUsuarios, atualizarUsuario };
