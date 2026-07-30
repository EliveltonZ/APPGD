const repo = require("../repositories/producaoRepository");

const listarProjetosProducao  = ()               => repo.listarProjetosProducao();
const buscarProjetoProducao   = (ordemdecompra)  => repo.buscarProjetoProducao(ordemdecompra);
const buscarProducaoPorPedido = (pedido)         => repo.buscarProducaoPorPedido(pedido);
const listarAcessorios        = (ordemdecompra)  => repo.listarAcessorios(ordemdecompra);
const atualizarDadosProducao  = (dados)          => repo.atualizarDadosProducao(dados);

module.exports = {
  listarProjetosProducao,
  buscarProjetoProducao,
  buscarProducaoPorPedido,
  listarAcessorios,
  atualizarDadosProducao,
};
