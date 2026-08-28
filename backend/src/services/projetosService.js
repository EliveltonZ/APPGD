const repo = require("../repositories/projetosRepository");

async function buscarPorContrato(contrato) {
  return repo.buscarPorContrato(contrato);
}

async function listarClientes() {
  return repo.listarClientes();
}

async function listarTiposCliente() {
  return repo.listarTiposCliente();
}

async function inserirProjeto(dados) {
  return repo.inserirProjeto(dados);
}

async function inserirCliente(dados) {
  return repo.inserirCliente(dados);
}

async function buscarParaEditar(ordemdecompra) {
  return repo.buscarParaEditar(ordemdecompra);
}

async function atualizarProjeto(dados) {
  return repo.atualizarProjeto(dados);
}

async function buscarParaDeletar(ordemdecompra) {
  return repo.buscarParaDeletar(ordemdecompra);
}

async function deletarProjeto(dados) {
  return repo.deletarProjeto(dados);
}

async function buscarCapaProducao(ordemdecompra) {
  return repo.buscarCapaProducao(ordemdecompra);
}

module.exports = {
  buscarPorContrato,
  listarClientes,
  listarTiposCliente,
  inserirProjeto,
  inserirCliente,
  buscarParaEditar,
  atualizarProjeto,
  buscarParaDeletar,
  deletarProjeto,
  buscarCapaProducao,
};
