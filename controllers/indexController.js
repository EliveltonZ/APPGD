const { createRpcHandler } = require("./rpcHandlerFactory");

module.exports = {
  passwordValidation: createRpcHandler("check_password", "body"),
};
