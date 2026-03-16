const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getUsuario: createRpcHandler("get_usuario", "query"),
  getGroupedLiberador: createRpcHandler("get_group_by_liberador", "query"),
  getGroupedAmbiente: createRpcHandler("get_group_by_tipoambiente", "query"),
  getGroupedVendedor: createRpcHandler("get_group_by_vendedor", "query"),
  fillTableAcessorios: createRpcHandler("get_acessorios", "query"),
  getGroupedAcessorios: createRpcHandler("get_group_by_acessorios", "query"),
  getDate: createRpcHandler("get_data", "query"),
  setDate: createRpcHandler("set_data", "body"),
  setEtapa: createRpcHandler("set_etapa", "body"),
  getCodigoBarras: createRpcHandler("get_projeto_codigo_barras", "query"),
  getOperadores: createRpcHandler("get_operadores", "query"),
  setTipo: createRpcHandler("set_tipo", "query"),
  getMontador: createRpcHandler("get_montadores", "query"),
  validateLogin: createRpcHandler("validate_login", "query"),
  getSolicitacoes: createRpcHandler("get_solicitacoes", "query"),
  getPecas: createRpcHandler("total_pecas", "query"),
};
