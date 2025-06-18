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
};
