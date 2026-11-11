const repo = require("../repositories/expedicaoRepository");

const listarProjetosExpedicao   = (data_condition)  => repo.listarProjetosExpedicao(data_condition);
const buscarProjetoExpedicao    = (ordemdecompra)   => repo.buscarProjetoExpedicao(ordemdecompra);
const listarAcessoriosExpedicao = (ordemdecompra)   => repo.listarAcessoriosExpedicao(ordemdecompra);
const atualizarProjetoExpedicao = (dados, usuarioId) => repo.atualizarProjetoExpedicao(dados, usuarioId);

module.exports = {
  listarProjetosExpedicao,
  buscarProjetoExpedicao,
  listarAcessoriosExpedicao,
  atualizarProjetoExpedicao,
};
