const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  createProject: createRpcHandler("insert_projeto", "body"),
  createClient: createRpcHandler("inserir_cliente", "body"),
  selectContract: createRpcHandler("buscar_contrato"),
  listClients: createRpcHandler("listar_clientes"),
};
