const repo = require("../repositories/pcpRepository");

const buscarProjetoPcp        = (ordemdecompra)          => repo.buscarProjetoPcp(ordemdecompra);
const buscarUltimoLote        = ()                       => repo.buscarUltimoLote();
const listarProjetosLote      = ()                       => repo.listarProjetosLote();
const listarLotes             = ()                       => repo.listarLotes();
const listarLotesIniciados    = ()                       => repo.listarLotesIniciados();
const reverterLote            = (lote)                   => repo.reverterLote(lote);
const atualizarIniciarLote    = (lote, iniciado)         => repo.atualizarIniciarLote(lote, iniciado);
const atualizarLote           = (ordemdecompra, lote)    => repo.atualizarLote(ordemdecompra, lote);
const atualizarProjetoPcp     = (body)                   => repo.atualizarProjetoPcp(body);
const exportarProjetosPeriodo = (data_inicio, data_fim)  => repo.exportarProjetosPeriodo(data_inicio, data_fim);
const buscarPcpCard           = ()                       => repo.buscarPcpCard();

module.exports = {
  buscarProjetoPcp,
  buscarUltimoLote,
  listarProjetosLote,
  listarLotes,
  listarLotesIniciados,
  reverterLote,
  atualizarIniciarLote,
  atualizarLote,
  atualizarProjetoPcp,
  exportarProjetosPeriodo,
  buscarPcpCard,
};
