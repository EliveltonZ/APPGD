const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  fillTableValores: createRpcHandler("get_valores", "query"),
};
