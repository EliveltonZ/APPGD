const repo = require("../repositories/pendenciasRepository");

const buscarContratoPendencia    = (contrato)        => repo.buscarContratoPendencia(contrato);
const getAcessoriosPendencias    = (ordemdecompra)   => repo.getAcessoriosPendencias(ordemdecompra);
const listarAcessoriosPendencias = (ordemdecompra)   => repo.listarAcessoriosPendencias(ordemdecompra);
const inserirAcessorios          = (dados)           => repo.inserirAcessorios(dados);
const deletarAcessorio           = (id)              => repo.deletarAcessorio(id);
const atualizarAcessorios        = (dados)           => repo.atualizarAcessorios(dados);
const listarCategoria            = ()                => repo.listarCategoria();

module.exports = {
  buscarContratoPendencia,
  getAcessoriosPendencias,
  listarAcessoriosPendencias,
  inserirAcessorios,
  deletarAcessorio,
  atualizarAcessorios,
  listarCategoria,
};
