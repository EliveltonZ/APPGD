const repo = require("../repositories/assistenciasRepository");

const listarAssistencias       = (data)           => repo.listarAssistencias(data);
const buscarAssistencia        = (solicitacao)    => repo.buscarAssistencia(solicitacao);
const atualizarAssistencia     = (body)           => repo.atualizarAssistencia(body);
const buscarCapaAssistencia    = (solicitacao)    => repo.buscarCapaAssistencia(solicitacao);
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
