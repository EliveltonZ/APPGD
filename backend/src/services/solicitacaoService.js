const repo = require("../repositories/solicitacaoRepository");

const getConfig                 = ()                           => repo.getConfig();
const inserirEquipeSat          = (idSat, idMontador)         => repo.inserirEquipeSat(idSat, idMontador);
const getPecas                  = (idAssistencia)             => repo.getPecas(idAssistencia);
const listarFalhas              = ()                           => repo.listarFalhas();
const listarOcorrencias         = ()                           => repo.listarOcorrencias();
const listarMontadores          = ()                           => repo.listarMontadores();
const buscarContratoAssistencia = (contrato)                   => repo.buscarContratoAssistencia(contrato);

module.exports = {
  getConfig,
  inserirEquipeSat,
  getPecas,
  listarFalhas,
  listarOcorrencias,
  listarMontadores,
  buscarContratoAssistencia,
};
