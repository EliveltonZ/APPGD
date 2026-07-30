const repo = require("../repositories/solicitacaoRepository");

const getConfig                 = ()                           => repo.getConfig();
const inserirEquipeSat          = (p_id_sat, p_id_montador)   => repo.inserirEquipeSat(p_id_sat, p_id_montador);
const getPecas                  = (p_id_assistencia)          => repo.getPecas(p_id_assistencia);
const listarFalhas              = ()                           => repo.listarFalhas();
const listarOcorrencias         = ()                           => repo.listarOcorrencias();
const listarMontadores          = ()                           => repo.listarMontadores();
const buscarContratoAssistencia = (p_contrato)                 => repo.buscarContratoAssistencia(p_contrato);

module.exports = {
  getConfig,
  inserirEquipeSat,
  getPecas,
  listarFalhas,
  listarOcorrencias,
  listarMontadores,
  buscarContratoAssistencia,
};
