const repo = require("../repositories/pcpRepository");

const buscarProjetoPcp        = (ordemdecompra)          => repo.buscarProjetoPcp(ordemdecompra);
const buscarUltimoLote        = ()                       => repo.buscarUltimoLote();
const listarProjetosLote      = ()                       => repo.listarProjetosLote();
const listarLotes             = ()                       => repo.listarLotes();
const atualizarIniciarLote    = (p_lote, p_iniciado)     => repo.atualizarIniciarLote(p_lote, p_iniciado);
const atualizarLote           = (p_ordemdecompra, p_lote)=> repo.atualizarLote(p_ordemdecompra, p_lote);
const atualizarProjetoPcp     = (body)                   => repo.atualizarProjetoPcp(body);
const exportarProjetosPeriodo = (data_inicio, data_fim)  => repo.exportarProjetosPeriodo(data_inicio, data_fim);
const buscarPcpCard           = ()                       => repo.buscarPcpCard();

module.exports = {
  buscarProjetoPcp,
  buscarUltimoLote,
  listarProjetosLote,
  listarLotes,
  atualizarIniciarLote,
  atualizarLote,
  atualizarProjetoPcp,
  exportarProjetosPeriodo,
  buscarPcpCard,
};
