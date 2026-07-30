const repo = require("../repositories/assistenciasRepository");

const listarAssistencias       = (p_data)        => repo.listarAssistencias(p_data);
const buscarAssistencia        = (p_solicitacao)  => repo.buscarAssistencia(p_solicitacao);
const atualizarAssistencia     = (body)           => repo.atualizarAssistencia(body);
const buscarCapaAssistencia    = (p_solicitacao)  => repo.buscarCapaAssistencia(p_solicitacao);
const inserirSolicitacao       = (body)           => repo.inserirSolicitacao(body);
const inserirSolicitacaoCompleta = (body)         => repo.inserirSolicitacaoCompleta(body);

module.exports = {
  listarAssistencias,
  buscarAssistencia,
  atualizarAssistencia,
  buscarCapaAssistencia,
  inserirSolicitacao,
  inserirSolicitacaoCompleta,
};
