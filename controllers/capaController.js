const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  fillElements: createRpcHandler("get_projeto_capa", "query"),
};
