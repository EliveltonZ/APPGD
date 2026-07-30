const repo = require("../repositories/utilsRepository");

const listarLiberadores  = () => repo.listarLiberadores();
const listarAmbientes    = () => repo.listarAmbientes();
const listarVendedores   = () => repo.listarVendedores();
const listarLojas        = () => repo.listarLojas();
const listarEtapas       = () => repo.listarEtapas();
const listarTipoContrato = () => repo.listarTipoContrato();
const listarTipoCliente  = () => repo.listarTipoCliente();
const listarCategorias   = () => repo.listarCategorias();
const maxOrder           = () => repo.maxOrder();
const getDado            = (p_id) => repo.getDado(p_id);
const setDado            = (body) => repo.setDado(body);
const listarOperadores   = () => repo.listarOperadores();
const listarCausaFalha   = (p_id_falha) => repo.listarCausaFalha(p_id_falha);

const buscarUsuario        = (p_id)                      => repo.buscarUsuario(p_id);
const getAcessorios        = (p_ordemdecompra)            => repo.getAcessorios(p_ordemdecompra);
const buscarData           = (p_id)                      => repo.buscarData(p_id);
const setEtapa             = (p_pedido, p_codigo)         => repo.setEtapa(p_pedido, p_codigo);
const getProjetoCodigoBarras = (p_pedido)                => repo.getProjetoCodigoBarras(p_pedido);
const getMontadores        = ()                           => repo.getMontadores();
const validateLogin        = (p_codigo, p_senha)          => repo.validateLogin(p_codigo, p_senha);
const getSolicitacoes      = (p_id_montador)              => repo.getSolicitacoes(p_id_montador);
const totalPecas           = ()                           => repo.totalPecas();
const getOcorrencias       = ()                           => repo.getOcorrencias();
const getFalhas            = ()                           => repo.getFalhas();
const setTipo              = (oc, tipo, urgente)          => repo.setTipo(oc, tipo, urgente);
const listarEquipSat       = (p_id_sat)                   => repo.listarEquipSat(p_id_sat);

module.exports = {
  listarLiberadores,
  listarAmbientes,
  listarVendedores,
  listarLojas,
  listarEtapas,
  listarTipoContrato,
  listarTipoCliente,
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
  validateLogin,
  getSolicitacoes,
  totalPecas,
  getOcorrencias,
  getFalhas,
  setTipo,
  listarEquipSat,
};
