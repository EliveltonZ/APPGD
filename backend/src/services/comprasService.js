const repo = require("../repositories/comprasRepository");

async function listarAcessoriosCompras(params) {
  return repo.listarAcessoriosCompras(params);
}

async function atualizarAcessorios(dados) {
  return repo.atualizarAcessorios(dados);
}

module.exports = { listarAcessoriosCompras, atualizarAcessorios };
