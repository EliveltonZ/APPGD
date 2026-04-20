const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  fillTable: createRpcHandler("listar_projetos_logistica", "query"),
  getStatus: createRpcHandler("buscar_projeto_logistica", "query"),
};
