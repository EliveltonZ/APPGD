const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getContrato: createRpcHandler("get_contrato", "query"),
  setProjeto: createRpcHandler("insert_projeto", "body"),
};
