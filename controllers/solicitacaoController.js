const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  getConfig: createRpcHandler("get_config", "query"),
};
