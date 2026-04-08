const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  setPecas: createRpcHandler("set_pecas", "body"),
};
