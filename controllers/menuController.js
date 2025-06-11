const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  setInfoCapa: createRpcHandler("set_infocapa", "query"),
};
