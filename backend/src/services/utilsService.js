const repo = require("../repositories/utilsRepository");

const listarLiberadores  = () => repo.listarLiberadores();
const listarAmbientes    = () => repo.listarAmbientes();
const listarVendedores   = () => repo.listarVendedores();
const listarLojas        = () => repo.listarLojas();
const listarEtapas       = () => repo.listarEtapas();
const listarTipoContrato = () => repo.listarTipoContrato();
const listarTipoCliente      = () => repo.listarTipoCliente();
const listarTiposAssistencia = () => repo.listarTiposAssistencia();
const listarCategorias   = () => repo.listarCategorias();
const maxOrder           = () => repo.maxOrder();
const getDado            = (id) => repo.getDado(id);
const setDado            = (body) => repo.setDado(body);
const listarOperadores   = () => repo.listarOperadores();
const listarCausaFalha   = (idFalha) => repo.listarCausaFalha(idFalha);

const buscarUsuario        = (id)                        => repo.buscarUsuario(id);
const getAcessorios        = (ordemdecompra)              => repo.getAcessorios(ordemdecompra);
const buscarData           = (id)                        => repo.buscarData(id);
const setEtapa             = (pedido, codigo)             => repo.setEtapa(pedido, codigo);
const getProjetoCodigoBarras = (pedido)                  => repo.getProjetoCodigoBarras(pedido);
const getMontadores        = ()                           => repo.getMontadores();
const getSolicitacoes      = (idMontador)                 => repo.getSolicitacoes(idMontador);
const totalPecas           = ()                           => repo.totalPecas();
const getOcorrencias       = ()                           => repo.getOcorrencias();
const getFalhas            = ()                           => repo.getFalhas();
const setTipo              = (oc, tipo, urgente)          => repo.setTipo(oc, tipo, urgente);
const listarEquipSat       = (idSat)                      => repo.listarEquipSat(idSat);

module.exports = {
  listarLiberadores,
  listarAmbientes,
  listarVendedores,
  listarLojas,
  listarEtapas,
  listarTipoContrato,
  listarTipoCliente,
  listarTiposAssistencia,
  listarCategorias,
  maxOrder,
  getDado,
  setDado,
  listarOperadores,
  listarCausaFalha,
  buscarUsuario,
  getAcessorios,
  buscarData,
  setEtapa,
  getProjetoCodigoBarras,
  getMontadores,
  getSolicitacoes,
  totalPecas,
  getOcorrencias,
  getFalhas,
  setTipo,
  listarEquipSat,
};
